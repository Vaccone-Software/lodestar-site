import type { Metadata } from "next";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import { stableRelease } from "@/lib/server/stable";

export const metadata: Metadata = {
  title: "Research",
  description:
    "What Lodestar records for research: every keystroke's timing, every pointer movement, voice features when dictating and daily rhythm, on the Mac, for as long as a person uses it.",
  alternates: { canonical: "/research" },
};

// For clinical researchers meeting Lodestar for the first time: what it is,
// what it records, and how far that has been checked. Short on purpose, and
// every claim that is not Lodestar's own carries its source.

const label = "text-dim text-[13px] font-semibold";
const link = "text-ink decoration-ink/40 hover:decoration-ink underline underline-offset-4";

const sources = {
  pratap: "https://doi.org/10.1038/s41746-020-0224-8",
  giancardo: "https://doi.org/10.1038/srep34468",
  physionet: "https://physionet.org/content/nqmitcsxpd/1.0.0/",
  lanYeo: "https://doi.org/10.1371/journal.pone.0219114",
  design: "https://github.com/Vaccone-Software/lodestar/blob/main/DESIGN.md",
};

/** What the record holds, as of Lodestar 0.54, grouped as a researcher
    would look for it. */
const record: { name: string; items: string[] }[] = [
  {
    name: "Keyboard",
    items: [
      "Every keystroke: when the key went down and how long it was held, in microseconds, from the keyboard event's own stamp",
      "The hand, the finger and the kind of key (letter, space, backspace and so on), never which key",
      "Every 90 seconds of typing: hold time quantiles, the log fluctuation index, flight and overlap, by hand and by direction",
    ],
  },
  {
    name: "Pointer",
    items: [
      "Every movement as the device reports it: motion that ends in a click, motion that comes to rest, and drags",
      "Every click, with its source, the device, Force Touch pressure and how long it was held",
      "Every scroll",
      "Each movement's speed profile: peak speed, submovements, and power in the 1 to 3, 4 to 7 and 8 to 12 Hz bands",
    ],
  },
  {
    name: "Voice, when dictating",
    items: [
      "Pitch and its spread, loudness, jitter, shimmer and harmonics to noise",
      "Pauses, speech rate and articulation rate",
      "Never the audio",
    ],
  },
  {
    name: "Daily rhythm",
    items: [
      "Interdaily stability and intradaily variability",
      "The most active ten hours and least active five, onset, offset and midpoint",
      "Bouts of work, and the drift within each",
    ],
  },
  {
    name: "Context",
    items: [
      "The kind of app (browser, terminal, chat and so on) and its name",
      "The keyboards attached and the report interval of each, the screens, power and the lid",
      "When it could not see (secure input, asleep, not running), and every change of build or device",
    ],
  },
  {
    name: "About the person",
    items: ["Year of birth, sex, dominant hand and whether they touch type", "All optional"],
  },
];

export default async function ResearchPage() {
  const { tag } = await stableRelease();
  return (
    <>
      <Nav tag={tag} />
      <main id="main" className="min-h-svh px-4 pt-10 pb-16 md:px-6">
        <div className="mx-auto max-w-[920px]">
          <p className={label}>Research</p>
          <h1 className="font-display mt-3 max-w-[20ch] text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            What Lodestar records
          </h1>
          <p className="text-dim mt-6 max-w-[62ch] text-[18px] leading-[1.55]">
            Lodestar is a free Mac app people use all day for its own sake. While they do, it records how
            their hands type and point, on their Mac, for as long as they use it. It is built for research
            that follows each person&apos;s own change over time. It is not a diagnostic.
          </p>

          <section className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="pane p-6">
              <h2 className="text-[18px] font-semibold">Duration</h2>
              <p className="text-dim mt-2 text-[16px] leading-[1.55]">
                There is no task to do, so the record runs as long as the person keeps using it. Across
                eight remote smartphone studies of more than 100,000 people, half had stopped within 5.5 days
                (
                <a href={sources.pratap} className={link}>
                  Pratap et al. 2020
                </a>
                ).
              </p>
            </div>
            <div className="pane p-6">
              <h2 className="text-[18px] font-semibold">Breadth</h2>
              <p className="text-dim mt-2 text-[16px] leading-[1.55]">
                It keeps every keystroke and every pointer movement, not summaries, so the published keyboard
                and mouse measures can be recomputed from it, and so can ones nobody has proposed yet.
              </p>
            </div>
          </section>

          <section className="border-hairline mt-14 border-t pt-10">
            <h2 className="text-[23px] font-semibold tracking-[-0.01em]">What it records</h2>
            <p className="text-dim mt-2 max-w-[62ch] text-[16px] leading-[1.6]">
              As of Lodestar 0.54. Everything stays on the Mac, sealed.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {record.map((group) => (
                <section key={group.name} className="pane p-6">
                  <h3 className="text-[16px] font-semibold">{group.name}</h3>
                  <ul className="mt-3 grid gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-dim flex gap-3 text-[14px] leading-[1.5]">
                        <span aria-hidden="true" className="bg-faint mt-[9px] h-1 w-1 flex-none rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <p className="text-ink mt-6 max-w-[62ch] text-[16px] leading-[1.6]">
              The keystroke record never names a key, but the pattern of hand, finger and kind of key can
              partly reconstruct what was typed. Treat it as sensitive.
            </p>
          </section>

          <section className="border-hairline mt-14 border-t pt-10">
            <h2 className="text-[23px] font-semibold tracking-[-0.01em]">How far it has been checked</h2>
            <dl className="mt-6 grid max-w-[65ch] gap-6 text-[16px] leading-[1.6]">
              <div>
                <dt className="font-semibold">The MIT typing study</dt>
                <dd className="text-dim mt-1">
                  The MIT neuroQWERTY study found that how long keys are held during ordinary typing can tell
                  people with early Parkinson&apos;s disease from people without it (
                  <a href={sources.giancardo} className={link}>
                    Giancardo et al. 2016
                  </a>
                  ). Lodestar records the same signal. Replaying the study&apos;s{" "}
                  <a href={sources.physionet} className={link}>
                    published data
                  </a>{" "}
                  through Lodestar&apos;s own code gives an AUC of 0.743 for Lan and Yeo&apos;s index, against
                  their 0.741 (
                  <a href={sources.lanYeo} className={link}>
                    Lan and Yeo 2019
                  </a>
                  ). This shows the code computes the measure as published, nothing more.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Its own timing</dt>
                <dd className="text-dim mt-1">
                  Lodestar measures itself as it records: it hears each key about 3 ms after the keyboard
                  event&apos;s own stamp, and sees the hold of 99% of the keys struck.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Clinical validation</dt>
                <dd className="text-dim mt-1">
                  Not done. So far the record is one person, with no diagnosed participants and no clinical
                  labels. That is what working with researchers is for.
                </dd>
              </div>
            </dl>
          </section>

          <section className="pane mt-14 p-6 md:p-8">
            <h2 className="text-[18px] font-semibold">Talk to us</h2>
            <p className="text-dim mt-2 max-w-[62ch] text-[16px] leading-[1.6]">
              If you study movement, speech or behaviour over time, we would like to hear what you would
              measure. The full design of the record is in the{" "}
              <a href={sources.design} className={link}>
                design specification
              </a>
              .
            </p>
            <p className="text-faint mt-3 text-[13px]">Contact details to come. This is a prototype.</p>
          </section>

          <Foot className="border-hairline mt-14 border-t pt-6" />
        </div>
      </main>
    </>
  );
}
