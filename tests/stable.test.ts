// GET /api/stable, called as Next calls it, with GitHub played by a
// stand-in fetch: the contract the app decodes, the cache header, and
// every way GitHub can fail. Runs without a build:
// `bun test tests/stable.test.ts`.

import { afterEach, describe, expect, mock, test } from "bun:test";
import { GET } from "@/app/api/stable/route";
import { iso } from "@/lib/server/stable";

const day = 86_400_000;
const realFetch = globalThis.fetch;
// To the second, as GitHub writes its dates.
const now = Math.floor(Date.now() / 1000) * 1000;
const ago = (days: number) => iso(now - days * day);

const release = (
  tag: string,
  published: string | null,
  extra: Record<string, unknown> = {},
) => {
  const version = tag.slice(1);
  const base = `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}`;
  return {
    tag_name: tag,
    name: `Lodestar ${version}`,
    draft: published === null,
    published_at: published,
    body: "notes the stable answer never reads",
    assets: [
      {
        name: `lodestar-${version}.zip`,
        browser_download_url: `${base}/lodestar-${version}.zip`,
        size: 1,
      },
      {
        name: `lodestar-${version}.dmg`,
        browser_download_url: `${base}/lodestar-${version}.dmg`,
        size: 1,
      },
    ],
    ...extra,
  };
};

// Newest first, as GitHub lists them.
const list = [
  release("v0.49.0", null),
  release("v0.48.1", ago(1 / 24)),
  release("v0.48.0", ago(2)),
  release("v0.47.0", ago(30)),
  release("v0.46.0", ago(31)),
];

let calls = 0;
const answer = (respond: () => Response | Promise<Response>) => {
  calls = 0;
  globalThis.fetch = mock(async () => {
    calls++;
    return respond();
  }) as unknown as typeof fetch;
};

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("/api/stable", () => {
  test("answers the contract, exactly", async () => {
    answer(() => Response.json(list));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      tag: "v0.47.0",
      version: "0.47.0",
      published: ago(30),
      zip: {
        name: "lodestar-0.47.0.zip",
        url: "https://github.com/Vaccone-Software/lodestar/releases/download/v0.47.0/lodestar-0.47.0.zip",
      },
      preview: { tag: "v0.48.1" },
      // The minor's clock started with 0.48.0; by the day it lands, the
      // patch has settled too, so the patch is what lands.
      pending: [
        {
          line: "0.48",
          kind: "minor",
          since: ago(2),
          promotes: iso(now + 5 * day),
          tag: "v0.48.1",
        },
      ],
      policy: { minorSoakDays: 7, patchSoakDays: 3, settleDays: 1 },
    });
    expect(Object.keys(body)).toEqual([
      "tag",
      "version",
      "published",
      "zip",
      "preview",
      "pending",
      "policy",
    ]);
    expect(body.published).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  });

  test("a good answer is cached at the edge", async () => {
    answer(() => Response.json(list));
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=60",
    );
  });

  test("GitHub out of reach is a 503, tried three times, never cached", async () => {
    answer(() => {
      throw new TypeError("fetch failed");
    });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(typeof (await response.json()).error).toBe("string");
    expect(calls).toBe(3);
  });

  test("a GitHub 5xx is tried again, then a 503", async () => {
    answer(() => new Response("unavailable", { status: 502 }));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(calls).toBe(3);
  });

  test("GitHub stumbling once is invisible", async () => {
    let first = true;
    answer(() => {
      if (first) {
        first = false;
        return new Response("unavailable", { status: 503 });
      }
      return Response.json(list);
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect((await response.json()).tag).toBe("v0.47.0");
    expect(calls).toBe(2);
  });

  test("a rate limit is a 503 and is not asked again", async () => {
    answer(
      () =>
        new Response(JSON.stringify({ message: "API rate limit exceeded" }), {
          status: 403,
          headers: { "x-ratelimit-remaining": "0" },
        }),
    );
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain("rate limit");
    expect(calls).toBe(1);
  });

  test("an answer that is not a releases list is a 502, not a guess", async () => {
    answer(() => Response.json({ message: "Moved Permanently" }));
    const response = await GET();
    expect(response.status).toBe(502);
    expect(calls).toBe(1);

    answer(() => Response.json([{ tag_name: "v0.47.0", draft: "no" }]));
    expect((await GET()).status).toBe(502);
  });

  test("a list with nothing stable is a 503", async () => {
    answer(() => Response.json([release("v0.47.0", null)]));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe("no release is stable yet");
  });
});
