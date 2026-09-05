import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Guide · Lodestar",
  description:
    "Every destination Lodestar reaches, one page each, written for a hand that has never held a key as a mode.",
};

// The guide's door, ahead of the guide. One page per destination, under the
// same names the landing page uses, so a reader who arrived through the
// argument finds the depth filed where the argument said it would be.
const pages: [string, string][] = [
  ["An application", "the launcher, the graph, letters and chains, beside"],
  ["A layout", "breaths, the chord, positions, displays, undo"],
  ["A page", "Ask, saved names, profiles, links clicked in other apps"],
  ["A button", "hints, chained hints, what counts as pressable"],
  ["Text on screen", "highlighting by typing, the start and the end, how the screen is read"],
  ["What you copied", "the clipboard, pins, images, plain and formatted"],
  ["What you say", "the draft, dictation, editing a field, and the dozen moves of vim it uses"],
  ["The coach", "what is recorded, how a suggestion is priced, saying no"],
  ["Settings", "the settings window, the config file, the schema"],
];

export default function GuidePage() {
  return (
    <main className="dust min-h-svh px-[5vw] pt-28 pb-24 lg:px-8">
      <Header />
      <div className="mx-auto max-w-[760px]">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          Guide
        </p>
        <h1 className="font-display mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-normal tracking-[-0.02em]">
          Every destination, one page each.
        </h1>
        <p className="text-dim mt-6 max-w-[56ch] text-[17px] leading-[1.6]">
          The guide is being written under the same names the front page
          uses, for a hand that has never held a key as a mode. Until it is
          complete, the reference in the repository holds every gesture and
          every setting.
        </p>
        <a
          href="https://github.com/Vaccone-Software/lodestar/blob/main/GUIDE.md"
          className="border-hairline mt-8 inline-flex items-center gap-3 border px-4 py-3 font-mono text-[12.5px] transition-colors hover:border-white/30"
        >
          <span>The reference, on GitHub</span>
          <span className="text-accent">↗</span>
        </a>

        <ol className="border-hairline mt-16 border-t">
          {pages.map(([title, blurb], i) => (
            <li
              key={title}
              className="border-hairline grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b py-5"
            >
              <span className="text-faint font-mono text-[11px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="font-display text-ink text-[22px]">
                  {title}.
                </span>
                <span className="text-dim ml-3 text-[15px]">{blurb}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
