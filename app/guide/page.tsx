import type { Metadata } from "next";
import Header from "@/components/Header";
import GuideSearch from "@/components/GuideSearch";
import { guide } from "@/data/guide";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "The Lodestar guide: one page per destination, each shown before it is described, with the parts nobody finds by pressing keys and the config line behind every behaviour.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  const hidden = guide.reduce(
    (n, p) => n + [p.first, ...p.ready].filter((l) => l.hidden).length,
    0,
  );
  return (
    <main className="min-h-svh px-[5vw] pt-28 pb-24 lg:px-8">
      <Header />
      <div className="mx-auto max-w-[880px]">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          Guide
        </p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-normal tracking-[-0.02em]">
          One page per destination
        </h1>
        <p className="text-dim mt-6 max-w-[56ch] text-[17px] leading-[1.6]">
          Every page has the same shape: the first minute, the lessons for
          when you are ready, the fine print nobody finds by pressing keys,
          the reason it works this way, and the config line behind it. Each
          lesson is shown before it is described.
        </p>

        <div className="mt-10">
          <GuideSearch />
        </div>

        <ol className="border-hairline mt-12 border-t">
          {guide.map((page, i) => {
            const count = 1 + page.ready.length;
            const secrets = [page.first, ...page.ready].filter((l) => l.hidden).length;
            return (
              <li key={page.slug} className="border-hairline border-b">
                <a
                  href={`/guide/${page.slug}`}
                  className="group grid grid-cols-[3rem_1fr] items-baseline gap-4 py-6"
                >
                  <span className="text-faint font-mono text-[11px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-display text-ink text-[24px] group-hover:underline group-hover:decoration-white/30 group-hover:underline-offset-4">
                      {page.name}
                    </span>
                    <span className="text-dim mt-1 block text-[15.5px] leading-[1.6]">
                      {page.blurb}
                    </span>
                    <span className="text-faint mt-2 block font-mono text-[11px]">
                      {count} lessons
                      {secrets ? ` · ${secrets} ${secrets === 1 ? "thing" : "things"} few know` : ""}
                      {` · ${page.options.length} lines`}
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <p className="text-faint mt-8 font-mono text-[11px]">
          {guide.length} pages · {hidden} things few know · the{" "}
          <a
            href="https://github.com/Vaccone-Software/lodestar/blob/main/GUIDE.md"
            className="text-dim underline underline-offset-4"
          >
            terse reference
          </a>{" "}
          in the repository, for the hand that wants it all on one screen
        </p>
      </div>
    </main>
  );
}
