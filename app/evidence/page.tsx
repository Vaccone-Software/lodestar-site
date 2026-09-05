import type { Metadata } from "next";
import Header from "@/components/Header";
import Permalink from "@/components/Permalink";

export const metadata: Metadata = {
  title: "Evidence",
  description:
    "Every claim on the Lodestar front page, and the measurement behind it: keyboard navigation timing, practice versus re-encoding, misfire rates, and the research behind the coach. One hand, fourteen days, seventy thousand events.",
  alternates: { canonical: "/evidence" },
};

// The results section to the front page's abstract. Every number here
// was read from the event log Lodestar keeps on its author's Mac, and
// every one is stated with the method that produced it and the reason it
// might be wrong. The page exists because the voice rule requires it:
// a claim about the reader carries its evidence or is not made.

type Result = {
  n: string;
  claim: string;
  measurement: string;
  method: string;
  reading: string;
};

const results: Result[] = [
  {
    n: "01",
    claim: "Window navigation is a small share of the day, even for a practised hand.",
    measurement:
      "On one fully instrumented day of 280 active minutes: typing 70.5 min, pointing 17.5 min, window navigation 2.6 min. Navigation is 2.8% of input time. Backspaces alone, at a 13.5% rate, cost 9.6 min, 3.7 times the navigation budget.",
    method:
      "Health pulse, one row per quarter hour of keystroke, click, and scroll counts, with no key identities; navigation timed directly from the gesture log.",
    reading:
      "The navigation problem is finished for this hand. What remains to win is elsewhere, which is why the coach is built to look elsewhere.",
  },
  {
    n: "02",
    claim: "Practice does not make a gesture faster. Giving it a shorter address does.",
    measurement:
      "A power law of practice fitted to each of 15 chains (98.4% of gestures) gives a mean exponent of −0.020 and a median R² of 0.0025: flat. The one accepted shortening on August 23 moved the median gesture from 152.8 ms to 97.0 ms (p = 0.0005), and no individual chain improved. A newly created bare letter ran 76 ms in its first 189 uses, faster than a chain with 3,798.",
    method:
      "Time from lode down to the last key, per chain, over the fourteen days; the shortening compared as before and after with a two-sample test.",
    reading:
      "Fluency is encoded, not practised. This is why the coach offers single letters first and why it will offer to flatten a chain that keeps stumbling.",
  },
  {
    n: "03",
    claim: "A bare letter under lode misfires at zero. A chain does not.",
    measurement:
      "Failure to complete the intended gesture: 0.00% for bare letters, 7.9% for chains under b, 11.2% under e, 41.1% under v (n = 124).",
    method:
      "A start counted as a misfire when the chain was abandoned or corrected within the same hold.",
    reading:
      "Depth is a tax paid in errors. The coach's flatten offer reads exactly this gradient.",
  },
  {
    n: "04",
    claim: "The hand knows the whole chord before the first key.",
    measurement:
      "Timed only on the first keypress, the same letter b took 73.4 ms when the chain was bx, 141.9 ms for bd, and 173.1 ms for bg.",
    method:
      "First-key latency from lode down, grouped by the chain that followed.",
    reading:
      "The suffix decides the speed of the prefix. Gestures are motor programs, not sequences of decisions, once they are learned.",
  },
  {
    n: "05",
    claim: "Most visits to an application are glances.",
    measurement:
      "Dwell time is a two-component mixture (ΔBIC −2753): 42.6% of visits are glances averaging 1.14 s, 57.4% are work averaging 18.5 s. 44% of visits account for 2.2% of foreground time.",
    method:
      "Foreground durations from focus events, fitted as a mixture of two log-normal components against one.",
    reading:
      "A navigation that is priced by visits overprices glances. The coach prices by the seconds a change would return.",
  },
  {
    n: "06",
    claim: "Where you go next is partly predictable, and one address would cover half of it.",
    measurement:
      "The predictability ceiling of the transition sequence is 79.9%; a first-order model reaches 46.3%. A single back address would cover 49.2% of switches, and the three most recent applications cover 81.3%.",
    method:
      "Fano bound and a Markov model over application-to-application transitions.",
    reading:
      "This is the case for the launcher ranking by recency, and the reason a back gesture is on the list.",
  },
  {
    n: "07",
    claim: "Selecting text by typing it is bound by keystrokes, not by choosing.",
    measurement:
      "Time to a selection scales with keys typed (R² 0.49) and barely with the number of candidates (R² 0.13), at about 410 ms per key.",
    method:
      "Regression of selection time on query length and on candidate count over the select gesture log.",
    reading:
      "The way to make select faster is fewer keys, not smarter ranking, which decided its floor of two characters.",
  },
  {
    n: "08",
    claim: "Arranging two windows side by side dropped from seconds to under one.",
    measurement:
      "Before the chord, a beside arrangement took 2.1 s median from the first summon to the split standing. On the chord's first day, the whole phrase took 757 ms median, and joins fell from about 1 s to under 200 ms within twenty minutes of use.",
    method:
      "Event timestamps from lode down to the layout settling, matched to the graph chains within 1.5 s; screen-locked intervals excluded.",
    reading:
      "Eliminating a navigation beats accelerating one, which is the whole case for layouts as destinations.",
  },
  {
    n: "09",
    claim: "A drawn selection needs a second opinion.",
    measurement:
      "Of 69 verified copies over two days, the application was asked to confirm the span 50 times: 22 approved, 17 overruled, 11 gave no answer. Twelve of the seventeen overrules were one terminal that takes a press without a position, fixed the next day.",
    method:
      "The copy ledger: every held span with the app's own selection compared to the pixels, up to the confusable glyphs.",
    reading:
      "Pixels aim and the app confirms. Neither is trusted alone, and the ledger says why.",
  },
  {
    n: "10",
    claim: "Closing the old path is what makes a hand switch. A nudge does not.",
    measurement:
      "In Grossman, Dragicevic and Balakrishnan (CHI 2007, n = 42), expert-path use was 28.9% when both paths stayed open and 72.8% when the slow one was disabled. Seven of fourteen control participants never used the fast path at all. A purely visual cue tested below control.",
    method:
      "Published between-subjects study; not this hand.",
    reading:
      "This is the evidence behind the coach reshaping the road on accept rather than reminding, and behind pricing the escape hatch in one deliberate confirm.",
  },
];

export default function EvidencePage() {
  return (
    <main className="min-h-svh px-[5vw] pt-28 pb-24 lg:px-8">
      <Header />
      <div className="mx-auto max-w-[880px]">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          Evidence
        </p>
        <h1 className="font-display mt-4 max-w-[18ch] text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-normal tracking-[-0.02em]">
          Every claim, and its measurement
        </h1>

        <section className="border-hairline mt-12 grid gap-x-12 gap-y-6 border-t pt-8 lg:grid-cols-[10rem_1fr]">
          <h2 className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
            Method
          </h2>
          <div className="text-dim max-w-[62ch] space-y-4 text-[17px] leading-[1.6]">
            <p>
              Lodestar keeps an append-only log of how it is used, on the
              Mac it runs on: which gesture, when, how long from the key
              going down to the destination arriving, and what was
              corrected. It never keeps content: no window titles, no
              addresses, no text. The same file the coach reads is the file
              these numbers were read from.
            </p>
            <p>
              The sample is one hand, the author&apos;s, over fourteen days
              in August 2026: between seventy and seventy-five thousand
              events. The typing and pointing minutes in the first result
              come from two days of the health pulse and are estimates from
              measured counts; navigation is timed directly. One day with a
              logging artefact is excluded from rhythm figures. Result 10 is
              a published study, not this hand.
            </p>
            <p className="text-ink">
              A sample of one says nothing about people in general. It says
              a great deal about whether the mechanisms Lodestar is built on
              are real, because each was measured on the hand that built
              them before it shipped.
            </p>
          </div>
        </section>

        <ol className="border-hairline mt-16 border-t">
          {results.map((r) => (
            <li
              key={r.n}
              id={`result-${r.n}`}
              className="border-hairline grid scroll-mt-24 gap-x-12 gap-y-4 border-b py-10 lg:grid-cols-[10rem_1fr]"
            >
              <span className="text-faint font-mono text-[11px] tracking-[0.2em]">
                <span className="glint">✦</span> {r.n}
                <Permalink anchor={`result-${r.n}`} />
              </span>
              <div className="max-w-[62ch]">
                <h3 className="font-display text-ink text-[clamp(1.4rem,2.4vw,1.85rem)] leading-[1.15] tracking-[-0.01em]">
                  {r.claim}
                </h3>
                <dl className="mt-5 space-y-4 text-[16px] leading-[1.6]">
                  <div>
                    <dt className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                      Measurement
                    </dt>
                    <dd className="text-ink/90 mt-1">{r.measurement}</dd>
                  </div>
                  <div>
                    <dt className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                      Method
                    </dt>
                    <dd className="text-dim mt-1">{r.method}</dd>
                  </div>
                  <div>
                    <dt className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                      Reading
                    </dt>
                    <dd className="text-dim mt-1">{r.reading}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-16 grid gap-x-12 gap-y-6 lg:grid-cols-[10rem_1fr]">
          <h2 className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
            References
          </h2>
          <ul className="text-dim max-w-[62ch] space-y-3 text-[15.5px] leading-[1.6]">
            <li>
              Grossman, T., Dragicevic, P., and Balakrishnan, R. Strategies
              for accelerating on-line learning of hotkeys. CHI 2007.
            </li>
            <li>
              Lally, P., van Jaarsveld, C., Potts, H., and Wardle, J. How are
              habits formed: modelling habit formation in the real world.
              European Journal of Social Psychology, 2010.
            </li>
            <li>
              The instrument itself: the observation layer is documented in
              the repository&apos;s{" "}
              <a
                href="https://github.com/Vaccone-Software/lodestar/blob/main/DESIGN.md"
                className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                design specification
              </a>{" "}
              and its platform findings in{" "}
              <a
                href="https://github.com/Vaccone-Software/lodestar/blob/main/FINDINGS.md"
                className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                the engineering ledger
              </a>
              .
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
