import type { Metadata } from "next";
import Foot from "@/components/Foot";
import GuideSearch from "@/components/GuideSearch";
import Nav from "@/components/Nav";
import { doors } from "@/data/doors";
import { guide, type GuidePage } from "@/data/guide";
import { stableRelease } from "@/lib/server/stable";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guide: Every Feature and Keyboard Shortcut for Mac",
  description:
    "The Lodestar guide: every feature and keyboard shortcut, one page per destination, each lesson shown before it is described, with the setting behind it.",
  path: "/guide",
  social: "Lodestar · Everything Lodestar does, and the keys for it",
});

// The guide is read by destination, and found by door: each door names
// the pages that teach it, and everything past the doors follows.
const byDoor: Record<string, string[]> = {
  write: ["write"],
  switch: ["application", "layout"],
  keep: ["clipboard"],
  speak: ["say"],
};

// A page of the guide, as a row in a pane: its name, what it covers, and
// how much is in it. The row the pointer rests on stands on the key step.
function Row({ page }: { page: GuidePage }) {
  const n = guide.indexOf(page) + 1;
  const lessons = 1 + page.ready.length;
  const few = [page.first, ...page.ready].filter((l) => l.hidden).length;
  return (
    <li>
      <a
        href={`/guide/${page.slug}`}
        className="hover:bg-raised grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-3 rounded-[10px] px-4 py-4 transition-colors"
      >
        <span className="text-faint text-[13px] font-medium tabular-nums">
          {String(n).padStart(2, "0")}
        </span>
        <span>
          <span className="text-ink block text-[18px] font-semibold tracking-[-0.01em]">
            {page.name}
          </span>
          <span className="text-dim mt-1 block text-[16px] leading-[1.45]">
            {page.blurb}
          </span>
          <span className="text-faint mt-2 block text-[13px]">
            {lessons} lessons
            {few ? ` · ${few} few know` : ""}
            {page.options.length ? ` · ${page.options.length} settings` : ""}
          </span>
        </span>
        <span aria-hidden="true" className="text-faint text-[16px]">
          →
        </span>
      </a>
    </li>
  );
}

/** The rows of one group, on one pane. */
function Group({ pages, className = "" }: { pages: GuidePage[]; className?: string }) {
  return (
    <ol className={`pane mt-3 grid gap-0.5 p-2 ${className}`.trim()}>
      {pages.map((page) => (
        <Row key={page.slug} page={page} />
      ))}
    </ol>
  );
}

export default async function GuideIndex() {
  const { tag } = await stableRelease();
  const inDoors = new Set(Object.values(byDoor).flat());
  const rest = guide.filter((p) => !inDoors.has(p.slug));
  const hidden = guide.reduce(
    (n, p) => n + [p.first, ...p.ready].filter((l) => l.hidden).length,
    0,
  );
  return (
    <>
      <Nav tag={tag} current="guide" />
      <main id="main" className="mx-auto max-w-[1080px] px-4 pt-10 pb-16 md:px-7">
        <h1 className="font-display max-w-[18ch] text-[clamp(36px,4.6vw,56px)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
          Everything Lodestar does, and the keys for it
        </h1>
        <p className="text-dim mt-5 max-w-[56ch] text-[18px] leading-[1.5]">
          One page per destination. Each starts with the first minute, then the
          lessons for when you are ready, the fine print nobody finds by
          pressing keys, and the settings behind it.
        </p>

        <div className="mt-8 max-w-[720px]">
          <GuideSearch />
        </div>

        <section className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2">
          {doors.map((door) => (
            <div key={door.slug}>
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-ink text-[18px] font-semibold">{door.name}</h2>
                <a href={`/${door.slug}`} className="text-dim hover:text-ink text-[13px] transition-colors">
                  The {door.name} page
                </a>
              </div>
              <Group
                pages={byDoor[door.slug]
                  .map((slug) => guide.find((p) => p.slug === slug))
                  .filter((p): p is GuidePage => !!p)}
              />
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-ink px-1 text-[18px] font-semibold">Everything else</h2>
          <Group pages={rest} className="md:grid-cols-2" />
        </section>

        <p className="text-faint mt-10 text-[13px]">
          {guide.length} pages · {hidden} things few know · the{" "}
          <a
            href="https://github.com/Vaccone-Software/lodestar/blob/main/GUIDE.md"
            className="text-dim underline underline-offset-4"
          >
            terse reference
          </a>{" "}
          in the repository, for the hand that wants it all on one screen
        </p>
        <Foot className="border-hairline mt-12 border-t pt-6" />
      </main>
    </>
  );
}
