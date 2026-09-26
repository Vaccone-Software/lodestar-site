import type { Metadata } from "next";
import Foot from "@/components/Foot";
import GuideSearch from "@/components/GuideSearch";
import Nav from "@/components/Nav";
import { doors } from "@/data/doors";
import { guide, type GuidePage } from "@/data/guide";
import { latestRelease } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "The Lodestar guide: one page per destination, each lesson shown before it is described, with the parts nobody finds by pressing keys and the config line behind every behaviour.",
  alternates: { canonical: "/guide" },
};

// The guide is read by destination, and found by door: each door names
// the pages that teach it, and everything past the doors follows.
const byDoor: Record<string, string[]> = {
  write: ["write"],
  switch: ["application", "layout"],
  keep: ["clipboard"],
  speak: ["say"],
};

function Row({ page }: { page: GuidePage }) {
  const n = guide.indexOf(page) + 1;
  const lessons = 1 + page.ready.length;
  const few = [page.first, ...page.ready].filter((l) => l.hidden).length;
  return (
    <li className="border-hairline border-b">
      <a
        href={`/guide/${page.slug}`}
        className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-3 py-4"
      >
        <span className="text-faint text-[12px] font-semibold tabular-nums">
          {String(n).padStart(2, "0")}
        </span>
        <span>
          <span className="text-ink block text-[19px] font-semibold tracking-[-0.01em]">
            {page.name}
          </span>
          <span className="text-dim mt-0.5 block text-[14.5px] leading-[1.5]">
            {page.blurb}
          </span>
          <span className="text-faint mt-1.5 block text-[12px]">
            {lessons} lessons
            {few ? ` · ${few} few know` : ""}
            {page.options.length ? ` · ${page.options.length} settings` : ""}
          </span>
        </span>
        <span className="text-accent text-[18px] transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
    </li>
  );
}

export default async function GuideIndex() {
  const { tag } = await latestRelease();
  const inDoors = new Set(Object.values(byDoor).flat());
  const rest = guide.filter((p) => !inDoors.has(p.slug));
  const hidden = guide.reduce(
    (n, p) => n + [p.first, ...p.ready].filter((l) => l.hidden).length,
    0,
  );
  return (
    <>
      <Nav tag={tag} current="guide" />
      <main id="main" className="mx-auto max-w-[1080px] px-4 pt-8 pb-16 md:px-7">
        <p className="text-accent text-[12px] font-semibold tracking-[0.16em] uppercase">
          Guide
        </p>
        <h1 className="over-sky mt-3 max-w-[18ch] text-[clamp(38px,5vw,60px)] leading-[1] font-semibold tracking-[-0.04em]">
          Everything Lodestar does, and the keys for it
        </h1>
        <p className="text-dim mt-5 max-w-[56ch] text-[17px] leading-[1.55]">
          One page per destination. Each starts with the first minute, then the
          lessons for when you are ready, the fine print nobody finds by
          pressing keys, and the settings behind it.
        </p>

        <div className="mt-8 max-w-[720px]">
          <GuideSearch />
        </div>

        <section className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {doors.map((door) => (
            <div key={door.slug}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-[13px] font-semibold tracking-[0.14em] uppercase">
                  <span className="text-accent">{door.name}</span>
                </h2>
                <a href={`/${door.slug}`} className="text-faint hover:text-dim text-[12.5px]">
                  The {door.name} page →
                </a>
              </div>
              <ol className="border-hairline mt-3 border-t">
                {byDoor[door.slug]
                  .map((slug) => guide.find((p) => p.slug === slug))
                  .filter((p): p is GuidePage => !!p)
                  .map((page) => (
                    <Row key={page.slug} page={page} />
                  ))}
              </ol>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="text-faint text-[13px] font-semibold tracking-[0.14em] uppercase">
            Everything else
          </h2>
          <ol className="border-hairline mt-3 grid border-t md:grid-cols-2 md:gap-x-10">
            {rest.map((page) => (
              <Row key={page.slug} page={page} />
            ))}
          </ol>
        </section>

        <p className="text-faint mt-10 text-[12.5px]">
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
