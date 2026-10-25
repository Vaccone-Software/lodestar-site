import type { Metadata } from "next";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import Permalink from "@/components/Permalink";
import { stableRelease } from "@/lib/server/stable";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Lodestar records how a person's hands type and point, every day, for as long as they use it: every keystroke's timing, the pointer's movement, daily rhythm and voice, on the Mac. For clinical researchers following each person's own change over time.",
  alternates: { canonical: "/research" },
};

// The page a clinical partner reads: what Lodestar records, why a tool
// people use for its own sake can record for years, and exactly how far
// the measures have been validated. A sibling of /evidence, in its
// pattern: every claim with its measurement, its method and its reading.
// "One person, measured" will be generated from the record; until then its
// numbers are placeholders and say so.

const label = "text-dim text-[13px] font-semibold";
const link = "text-ink decoration-ink/40 hover:decoration-ink underline underline-offset-4";

/** What the record holds, as of Lodestar 0.54. Everything is kept on the
    Mac, sealed. */
const layers: { name: string; what: string; grain: string }[] = [
  {
    name: "Every keystroke",
    what: "When each key went down and how long it was held, from the keyboard event's own stamp, in microseconds. The hand, the finger and the kind of key, never which key.",
    grain: "Every press",
  },
  {
    name: "Typing windows",
    what: "Hold time quantiles, the log fluctuation index, flight and overlap, split by hand and by direction (left to left, left to right, right to left, right to right).",
    grain: "90 seconds",
  },
  {
    name: "The pointer",
    what: "Every movement's own deltas: motion that ends in a click, motion that comes to rest, and drags. Clicks with their source, the device and Force Touch pressure, how long each press is held, and each scroll's deltas.",
    grain: "Every report",
  },
  {
    name: "Speed profiles",
    what: "Peak speed, submovements, and power in the 1 to 3, 4 to 7 and 8 to 12 Hz bands.",
    grain: "Every movement",
  },
  {
    name: "Daily rhythm",
    what: "Interdaily stability, intradaily variability, the most active ten hours and least active five, onset, offset and midpoint. Bouts of work, and the drift within each.",
    grain: "Day and bout",
  },
  {
    name: "Voice",
    what: "For each dictation: pitch and its spread, loudness, jitter, shimmer, harmonics to noise, pauses, speech rate and articulation rate. Never the audio.",
    grain: "Every dictation",
  },
  {
    name: "Kind of app",
    what: "Browser, terminal, chat and so on, beside the app's name, so a measure can be compared within the same kind of work.",
    grain: "Every window",
  },
  {
    name: "Context",
    what: "The keyboards attached and the report interval each one states, the screens, power and the lid.",
    grain: "Whenever it changes",
  },
  {
    name: "Provenance",
    what: "When the instrument could not see: secure input, the tap off, the Mac asleep, Lodestar not running. Every change of build or device.",
    grain: "Whenever it changes",
  },
  {
    name: "About the person",
    what: "Year of birth, sex, dominant hand and whether they touch type. All optional, all sealed.",
    grain: "Once",
  },
];

/** The published keyboard and mouse studies, and what of each the record
    keeps. Every feature they used can be recomputed from the raw layer. */
const studies: { study: string; used: string; kept: string }[] = [
  {
    study: "Giancardo et al. 2016",
    used: "Hold times while typing, in a clinic",
    kept: "Every hold, at home, every day",
  },
  {
    study: "Arroyo-Gallego et al. 2018",
    used: "Hold times from natural typing at home",
    kept: "Every hold, with the keyboard that produced it",
  },
  {
    study: "Lan and Yeo 2019",
    used: "The fluctuation of hold times",
    kept: "The same index in every typing window, reproduced",
  },
  {
    study: "Adams 2017 (Tappy)",
    used: "Hold, latency and flight, by hand and direction",
    kept: "The same, by hand and by all four directions",
  },
  {
    study: "Gajos et al. 2020",
    used: "Mouse movement kinematics",
    kept: "Every movement's deltas, speed profiles and tremor bands",
  },
  {
    study: "Zulueta et al. 2018 (BiAffect)",
    used: "Keystroke timing and corrections on a phone",
    kept: "Every keystroke's timing, corrections by kind of key, daily rhythm",
  },
];

type Result = {
  n: string;
  claim: string;
  measurement: string;
  method: string;
  reading: string;
};

const validation: Result[] = [
  {
    n: "01",
    claim: "The instrument measures its own timing.",
    measurement:
      "Lateness against the keyboard event's own stamp is about 3 ms. Coverage, the holds seen against the keys struck, is 99%. Every span where it could not see is recorded with its start and end.",
    method:
      "Timing is taken from the event stamp the system attaches when the key goes down, not from when Lodestar hears about it, and the difference is kept beside every quarter hour.",
    reading:
      "This is verification: the sensor measures what it says it measures, and says how well, continuously rather than once.",
  },
  {
    n: "02",
    claim: "Its feature code matches a published definition.",
    measurement:
      "Replaying the MIT neuroQWERTY dataset (PhysioNet) through Lodestar's own feature code gives an AUC of 0.743 for Lan and Yeo's index, against their 0.741.",
    method:
      "The replay runs in continuous integration on every change, against a pinned copy of the dataset. No model is trained.",
    reading:
      "This is analytical validation of one feature, and nothing more. It shows the code computes the index as published.",
  },
  {
    n: "03",
    claim: "Clinical validation has not been done.",
    measurement:
      "So far the record is one person, the author. There are no diagnosed participants and no clinical labels.",
    method: "Not yet measured.",
    reading:
      "Whether these measures follow a clinical state is the open question, and the reason for a partnership. Nothing on this page claims diagnosis or early detection.",
  },
  {
    n: "04",
    claim: "An accuracy check against a hardware reference is planned.",
    measurement: "Planned, not run.",
    method:
      "A device that sends known keypresses and known pointer motion, so the recorded timing and movement can be compared with the truth.",
    reading: "This closes verification with an external reference rather than the instrument's own stamps.",
  },
];

/** One person, measured: generated from the record later. Until then,
    placeholders, and labelled as such. */
const measured: { name: string; value: string; note: string }[] = [
  { name: "Days recorded", value: "000", note: "Since the raw record began" },
  { name: "Keystrokes", value: "0,000,000", note: "Each with its hold time" },
  { name: "Typing windows", value: "00,000", note: "90 seconds, at least 30 presses" },
  { name: "Pointer movements", value: "000,000", note: "Each with its speed profile" },
  { name: "Median hold time", value: "00 ms", note: "Both hands, all windows" },
  { name: "Time unseen", value: "0.0%", note: "Blind spans against time awake" },
];

const designs: { name: string; line: string }[] = [
  {
    name: "Enriched cohorts",
    line: "People with REM sleep behaviour disorder convert to a neurodegenerative syndrome at about 6.3% a year. Over two years of daily measurement, each person who converts brings a baseline from before the diagnosis.",
  },
  {
    name: "Progression and treatment response",
    line: "In people already diagnosed, a measure taken every day over months can change sooner and with less noise than a clinic score taken a few times a year.",
  },
  {
    name: "Swings within the day",
    line: "Typing windows across a whole working day can follow motor state around medication, such as levodopa or stimulants, where a clinic visit samples it once.",
  },
];

const explore = ["ADHD", "Autism", "Essential tremor", "Multiple sclerosis", "Mood disorders", "Fatigue"];

function Row({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-hairline mt-14 grid scroll-mt-24 gap-x-12 gap-y-4 border-t pt-10 md:px-8 lg:grid-cols-[9rem_1fr]">
      <h2 className={label}>{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function ResearchPage() {
  const { tag } = await stableRelease();
  return (
    <>
      <Nav tag={tag} />
      <main id="main" className="min-h-svh px-4 pt-10 pb-16 md:px-6">
        <div className="mx-auto max-w-[920px]">
          <p className={label}>Research</p>
          <h1 className="font-display mt-3 max-w-[20ch] text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            Years of the hands, measured while people work
          </h1>
          <div className="text-dim mt-6 max-w-[65ch] space-y-4 text-[18px] leading-[1.55]">
            <p>
              Lodestar is a free Mac app people use all day for its own sake. While they do, it records how
              their hands type and point, and how their voice sounds when they dictate, in more detail than the
              published studies used, for as long as they keep using it.
            </p>
            <p>
              It is built for research that follows each person&apos;s own change over time. It is not a
              diagnostic, and clinical validation has not been done. That is what a partnership is for.
            </p>
          </div>

          <section className="pane mt-12 grid gap-x-12 gap-y-4 p-6 md:p-8 lg:grid-cols-[9rem_1fr]">
            <h2 className={label}>Two arguments</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-[18px] font-semibold">Duration</h3>
                <p className="text-dim mt-2 text-[16px] leading-[1.55]">
                  There is no task to do, so measurement lasts as long as the person keeps using a tool they
                  chose. Studies built on tasks lose people within days.
                </p>
              </div>
              <div>
                <h3 className="text-[18px] font-semibold">Breadth</h3>
                <p className="text-dim mt-2 text-[16px] leading-[1.55]">
                  It keeps the raw record, a superset of what the published keyboard and mouse studies measured,
                  so the research can find which measures matter. The findings are often unintuitive.
                </p>
              </div>
            </div>
          </section>

          <Row title="Duration" id="duration">
            <div className="max-w-[65ch] space-y-4 text-[16px] leading-[1.6]">
              <p className="text-ink">
                Across eight remote smartphone studies and more than 100,000 participants, half had stopped
                taking part by 5.5 days. In mPower, the largest Parkinson&apos;s study of its kind, the median
                was 5 days. Even people referred by a clinician, in mPower and ElevateMS, stayed a median of 44
                days.
              </p>
              <p className="text-dim">
                Pratap et al., npj Digital Medicine 2020. Each of those studies asked people to do something.
                Lodestar asks for nothing beyond using the Mac the way they already do, so a record can run for
                years.
              </p>
            </div>
          </Row>

          <Row title="Breadth" id="breadth">
            <p className="text-dim max-w-[65ch] text-[16px] leading-[1.6]">
              Every feature these studies used can be recomputed from Lodestar&apos;s raw record, and so can
              features nobody has proposed yet. Partners get the raw record, not reduced summaries.
            </p>
            <div className="pane mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[14px] leading-[1.45]">
                <thead>
                  <tr className="text-dim text-[13px]">
                    <th className="px-5 pt-5 pb-3 font-semibold">Study</th>
                    <th className="px-5 pt-5 pb-3 font-semibold">What it used</th>
                    <th className="px-5 pt-5 pb-3 font-semibold">What Lodestar keeps</th>
                  </tr>
                </thead>
                <tbody>
                  {studies.map((s) => (
                    <tr key={s.study} className="border-hairline border-t">
                      <td className="px-5 py-3 font-medium whitespace-nowrap">{s.study}</td>
                      <td className="text-dim px-5 py-3">{s.used}</td>
                      <td className="px-5 py-3">{s.kept}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Row>

          <Row title="What it records" id="record">
            <p className="text-dim max-w-[65ch] text-[16px] leading-[1.6]">
              As of Lodestar 0.54, all of it on the Mac, sealed.
            </p>
            <ul className="mt-6 grid gap-2">
              {layers.map((l) => (
                <li key={l.name} className="bg-raised grid gap-x-6 gap-y-1 rounded-[14px] px-5 py-4 md:grid-cols-[11rem_1fr_8rem]">
                  <b className="text-[15px] font-semibold">{l.name}</b>
                  <span className="text-dim text-[14px] leading-[1.5]">{l.what}</span>
                  <span className="text-faint text-[13px] md:text-right">{l.grain}</span>
                </li>
              ))}
            </ul>
            <p className="text-ink mt-6 max-w-[65ch] text-[16px] leading-[1.6]">
              The keystroke record never names a key, but the pattern of hand, finger and kind of key can
              partly reconstruct what was typed. Treat the raw layer as sensitive.
            </p>
          </Row>

          <Row title="Validation" id="validation">
            <p className="text-dim max-w-[65ch] text-[16px] leading-[1.6]">
              In the three steps clinical partners use for a digital measure: verification, analytical
              validation, and clinical validation.
            </p>
          </Row>
          <ol className="mt-2">
            {validation.map((r) => (
              <li
                key={r.n}
                id={`validation-${r.n}`}
                className="border-hairline grid scroll-mt-24 gap-x-12 gap-y-3 border-b py-10 md:px-8 lg:grid-cols-[9rem_1fr]"
              >
                <span className="text-dim text-[13px] font-semibold tabular-nums">
                  {r.n}
                  <Permalink anchor={`validation-${r.n}`} />
                </span>
                <div className="max-w-[65ch]">
                  <h3 className="text-ink text-[clamp(1.25rem,2vw,1.4375rem)] leading-[1.25] font-semibold tracking-[-0.01em] text-balance">
                    {r.claim}
                  </h3>
                  <dl className="mt-5 space-y-4 text-[16px] leading-[1.6]">
                    <div>
                      <dt className={label}>Measurement</dt>
                      <dd className="text-ink mt-1">{r.measurement}</dd>
                    </div>
                    <div>
                      <dt className={label}>Method</dt>
                      <dd className="text-dim mt-1">{r.method}</dd>
                    </div>
                    <div>
                      <dt className={label}>Reading</dt>
                      <dd className="text-dim mt-1">{r.reading}</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>

          <Row title="One person, measured" id="measured">
            <p className="text-dim max-w-[65ch] text-[16px] leading-[1.6]">
              The author&apos;s own record, which will be generated here from the data. These numbers are
              placeholders.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {measured.map((m) => (
                <div key={m.name} className="pane p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-dim text-[13px] font-semibold">{m.name}</span>
                    <span className="text-faint rounded-[var(--control)] px-2 py-0.5 text-[11px] font-medium shadow-[inset_0_0_0_0.5px_currentColor]">
                      Placeholder
                    </span>
                  </div>
                  <div className="font-display text-faint mt-3 text-[28px] font-semibold tabular-nums">{m.value}</div>
                  <div className="text-dim mt-1 text-[13px]">{m.note}</div>
                </div>
              ))}
            </div>
          </Row>

          <Row title="Study designs" id="designs">
            <ul className="grid gap-6">
              {designs.map((d) => (
                <li key={d.name} className="max-w-[65ch]">
                  <h3 className="text-[18px] font-semibold">{d.name}</h3>
                  <p className="text-dim mt-1 text-[16px] leading-[1.6]">{d.line}</p>
                </li>
              ))}
            </ul>
            <p className="text-dim mt-8 max-w-[65ch] text-[16px] leading-[1.6]">
              The same record can be explored in other conditions without forcing a conclusion:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {explore.map((e) => (
                <li key={e} className="bg-raised rounded-[var(--control)] px-3 py-1.5 text-[14px]">
                  {e}
                </li>
              ))}
            </ul>
          </Row>

          <Row title="How a study runs" id="study">
            <div className="text-dim max-w-[65ch] space-y-4 text-[16px] leading-[1.6]">
              <p>
                A partner recruits participants and installs Lodestar for them. The people who already use
                Lodestar are not a clinical cohort, and are not the sample.
              </p>
              <p>
                Enrollment, research consent and export arrive later as an opt-in update, designed with the
                partner around the protocol. Nothing about that is fixed yet, so the first step is a
                conversation.
              </p>
            </div>
          </Row>

          <Row title="Trust" id="trust">
            <ul className="grid max-w-[65ch] gap-4 text-[16px] leading-[1.6]">
              <li>
                <b className="font-semibold">Consent first.</b>{" "}
                <span className="text-dim">Nothing reaches a study without the participant agreeing to that study.</span>
              </li>
              <li>
                <b className="font-semibold">Kept only as long as the protocol says.</b>{" "}
                <span className="text-dim">
                  A study&apos;s copy is deleted at withdrawal and at the end of the study. The person&apos;s own
                  record on their Mac stays theirs.
                </span>
              </li>
              <li>
                <b className="font-semibold">Never sold.</b>{" "}
                <span className="text-dim">No data brokers, no advertising, no one outside the study.</span>
              </li>
            </ul>
          </Row>

          <section className="pane mt-14 grid gap-x-12 gap-y-4 p-6 md:p-8 lg:grid-cols-[9rem_1fr]">
            <h2 className={label}>Talk to us</h2>
            <div className="max-w-[65ch] text-[16px] leading-[1.6]">
              <p className="text-ink">
                If you study movement, speech or behaviour over time and want a record that lasts, we would like
                to design a study with you.
              </p>
              <p className="text-faint mt-3 text-[13px]">Contact details to come. This is a prototype.</p>
            </div>
          </section>

          <Row title="References" id="references">
            <ul className="text-dim max-w-[65ch] space-y-3 text-[16px] leading-[1.6]">
              <li>Adams, W. High-accuracy detection of early Parkinson&apos;s disease using multiple characteristics of finger movement while typing. PLoS One 12(11), 2017.</li>
              <li>Arroyo-Gallego, T. et al. Detecting motor impairment in early Parkinson&apos;s disease via natural typing interaction with keyboards. Journal of Medical Internet Research 20(3), 2018.</li>
              <li>Gajos, K. et al. Computer mouse use captures ataxia and parkinsonism. Movement Disorders, 2020.</li>
              <li>Giancardo, L. et al. Computer keyboard interaction as an indicator of early Parkinson&apos;s disease. Scientific Reports 6, 2016.</li>
              <li>Lan, K. and Yeo, R. PLoS One 14(6), 2019. Dataset: MIT neuroQWERTY, PhysioNet.</li>
              <li>Postuma, R. et al. Risk and predictors of dementia and parkinsonism in idiopathic REM sleep behaviour disorder. Brain 142(3), 2019.</li>
              <li>Pratap, A. et al. Indicators of retention in remote digital health studies: a cross-study evaluation of 100,000 participants. npj Digital Medicine 3, 2020.</li>
              <li>Zulueta, J. et al. Predicting mood disturbance severity with mobile phone keystroke metadata: a BiAffect digital phenotyping study. Journal of Medical Internet Research 20(7), 2018.</li>
              <li>
                The instrument itself: the observation layer is documented in the repository&apos;s{" "}
                <a href="https://github.com/Vaccone-Software/lodestar/blob/main/DESIGN.md" className={link}>
                  design specification
                </a>
                .
              </li>
            </ul>
          </Row>
          <Foot className="border-hairline mt-14 border-t pt-6" />
        </div>
      </main>
    </>
  );
}
