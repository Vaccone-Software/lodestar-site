// The site, as it ships: built once, served, and read the way a visitor
// and a link preview read it. Run with `bun run test` (it builds first).
//
// The layout checks open a real browser. Playwright's own Chromium is used
// when it is installed (`bunx playwright install chromium`, as CI does);
// otherwise SITE_BROWSER names one, or Brave where it is.

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { chromium, type Browser } from "playwright";
import { doors } from "@/data/doors";
import { guide } from "@/data/guide";

const headline = "Everything one key away";
const subline = "Free tools that stay on your Mac";

let server: ReturnType<typeof Bun.spawn>;
let origin = "";

beforeAll(async () => {
  const port = 4100 + Math.floor(Math.random() * 800);
  origin = `http://localhost:${port}`;
  server = Bun.spawn(["bunx", "next", "start", "-p", String(port)], { stdout: "ignore", stderr: "inherit" });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(origin)).ok) return;
    } catch {}
    await Bun.sleep(250);
  }
  throw new Error("the built site never answered; run `bun run build` first");
}, 40_000);

afterAll(() => server?.kill());

const page = async (path: string) => {
  const response = await fetch(origin + path);
  return { status: response.status, html: await response.text(), type: response.headers.get("content-type") ?? "" };
};

const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'");
const heading = (html: string) => text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "").trim();
const meta = (html: string, key: string) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]+content="([^"]*)"`))?.[1];

// MARK: - The front page says the line, and nothing else

describe("the front page", () => {
  test("its headline is the line, with no period", async () => {
    const { status, html } = await page("/");
    expect(status).toBe(200);
    expect(heading(html)).toBe(headline);
    expect(text(html)).toContain(subline);
    expect(text(html)).not.toContain(subline + ".");
  });

  test("a tab and a link preview carry the same line", async () => {
    const { html } = await page("/");
    expect(meta(html, "og:title")).toBe(`Lodestar · ${headline}`);
    expect(meta(html, "twitter:title")).toBe(`Lodestar · ${headline}`);
  });

  test("the old line is gone everywhere", async () => {
    for (const path of ["/", ...doors.map((door) => `/${door.slug}`)]) {
      expect(text((await page(path)).html)).not.toMatch(/Master your Mac|second nature/i);
    }
  });

  test("the link card is drawn", async () => {
    const card = await page("/opengraph-image");
    expect(card.status).toBe(200);
    expect(card.type).toContain("image/png");
  });

  test("Download points at a disk image of a release", async () => {
    const { html } = await page("/");
    expect(html).toMatch(/href="https:\/\/github\.com\/Vaccone-Software\/lodestar\/releases\/download\/v[\d.]+\/[^"]+\.dmg"/);
  });

  test("every answer carries the site's headers", async () => {
    for (const path of ["/", "/api/stable", "/opengraph-image"]) {
      const response = await fetch(origin + path);
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("x-frame-options")).toBe("DENY");
      expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
      expect(response.headers.get("x-powered-by")).toBeNull();
    }
  });

  test("Download is the build /api/stable names", async () => {
    const response = await fetch(origin + "/api/stable");
    expect(response.status).toBe(200);
    const stable = await response.json();
    expect(stable.zip.name).toBe(`lodestar-${stable.version}.zip`);
    const { html } = await page("/");
    expect(html).toContain(`/releases/download/${stable.tag}/lodestar-${stable.version}.dmg`);
  });
});

// MARK: - The doors

describe("the doors", () => {
  test("every door has a page with its own headline", async () => {
    for (const door of doors) {
      const { status, html } = await page(`/${door.slug}`);
      expect(status).toBe(200);
      expect(heading(html)).toBe(door.h1);
    }
  });

  // The copy voice: a name or a line on a surface ends without a period
  // and carries no dash or semicolon.
  test("each door's short lines keep the voice", () => {
    for (const door of doors) {
      for (const line of [door.name, door.what, door.h1, door.lede]) {
        expect(line).not.toMatch(/\.$/);
        expect(line).not.toMatch(/[—–;]/);
      }
    }
  });
});

// MARK: - Nothing leads nowhere

describe("links", () => {
  test("every page a visitor can reach answers", async () => {
    const seen = new Set<string>();
    const queue = ["/", "/guide", "/changelog", "/evidence", ...doors.map((d) => `/${d.slug}`),
                   ...guide.map((g) => `/guide/${g.slug}`)];
    const broken: string[] = [];
    while (queue.length) {
      const path = queue.shift()!;
      if (seen.has(path)) continue;
      seen.add(path);
      const { status, html } = await page(path);
      if (status !== 200) {
        broken.push(`${path} ${status}`);
        continue;
      }
      for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
        if (href.startsWith("/_next") || /\.(png|svg|ico|webm|mp4|json|xml|txt)$/.test(href)) continue;
        if (!seen.has(href)) queue.push(href);
      }
    }
    expect(broken).toEqual([]);
    expect(seen.size).toBeGreaterThan(8);
  }, 60_000);
});

// MARK: - The headline stands on one line, at every width

function browserPath(): string | undefined {
  if (process.env.SITE_BROWSER) return process.env.SITE_BROWSER;
  if (existsSync(chromium.executablePath())) return undefined;
  const brave = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
  return existsSync(brave) ? brave : undefined;
}

describe("layout", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await chromium.launch({ executablePath: browserPath() });
  }, 30_000);
  afterAll(async () => browser?.close());

  const widths: [number, number][] = [[1920, 1080], [1440, 900], [1024, 768], [390, 844], [320, 640]];
  for (const [width, height] of widths) {
    test(`at ${width} wide the headline is one line and nothing scrolls sideways`, async () => {
      const tab = await browser.newPage({ viewport: { width, height } });
      // The loops never finish loading; the words are what is measured.
      await tab.goto(origin, { waitUntil: "domcontentloaded" });
      await tab.waitForSelector("h1");
      const measure = await tab.evaluate(() => {
        const h1 = document.querySelector("h1")!;
        const range = document.createRange();
        range.selectNodeContents(h1);
        const lines = new Set([...range.getClientRects()].map((rect) => Math.round(rect.top)));
        const box = h1.getBoundingClientRect();
        const words = range.getBoundingClientRect();
        return {
          lines: lines.size,
          left: words.left,
          right: words.right,
          inside: box.width,
          page: document.documentElement.scrollWidth,
          viewport: window.innerWidth,
        };
      });
      expect(measure.lines).toBe(1);
      expect(measure.left).toBeGreaterThanOrEqual(0);
      expect(measure.right).toBeLessThanOrEqual(measure.viewport);
      expect(measure.page).toBeLessThanOrEqual(measure.viewport);
      await tab.close();
    }, 30_000);
  }
});
