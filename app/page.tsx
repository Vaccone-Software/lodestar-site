import CopyCommand from "@/components/CopyCommand";
import DownloadButton from "@/components/DownloadButton";
import Header from "@/components/Header";
import { Keys } from "@/components/Key";
import LatestVersion from "@/components/LatestVersion";
import Meridian from "@/components/Meridian";
import Mark from "@/components/Mark";
import {
  SceneApp,
  SceneButton,
  SceneClipboard,
  SceneCoach,
  SceneMoment,
  ScenePage,
  SceneSpeech,
  SceneText,
} from "@/components/Scenes";
import Reveal from "@/components/Reveal";
import Sidereal from "@/components/Sidereal";
import Starfield from "@/components/Starfield";
import { specification } from "@/data/gestures";

const repo = "https://github.com/Vaccone-Software/lodestar";

// Baked at build so the static page is right on deploy day; the client
// re-reads the API so it stays right between deploys.
//
// no-store is load bearing. Next keeps a persistent data cache between
// builds, and a cached answer here bakes whatever version was current the
// last time the cache was written.
async function latest(): Promise<{ tag: string; date: string }> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1",
      { cache: "no-store" },
    );
    const data = await response.json();
    const tag = data?.[0]?.tag_name;
    const date = data?.[0]?.published_at;
    if (typeof tag === "string" && tag.startsWith("v"))
      return { tag, date: typeof date === "string" ? date : "" };
  } catch {}
  return { tag: "v0.30.14", date: "" };
}

/** A numbered marker in the margin, the way the sky is charted. */
function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
      <span className="glint">{n}</span>
      <span className="mx-2">·</span>
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-ink mt-5 max-w-[22ch] text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.02] font-normal tracking-[-0.02em]">
      {children}
    </h2>
  );
}

function Prose({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-dim max-w-[58ch] space-y-5 text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.6] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

// One destination. The same three parts every time: what it is, the keys,
// and one sentence, with a drawn demonstration of the behaviour. The
// repetition is the argument.
const destinations: {
  what: string;
  keys: string[];
  sentence: string;
  scene: React.ReactNode;
}[] = [
  {
    what: "An application",
    keys: ["lode", "M"],
    sentence:
      "A letter you chose. Mail arrives maximized, the rest out of the way, launched if it has to be.",
    scene: <SceneApp />,
  },
  {
    what: "A page",
    keys: ["lode", "⏎"],
    sentence:
      "A name, a site, or a search, opened in the browser profile it belongs to. Work in work, personal in personal.",
    scene: <ScenePage />,
  },
  {
    what: "A button",
    keys: ["lode", ";"],
    sentence:
      "Every button, link, and field wears a letter. Press it, and it is pressed.",
    scene: <SceneButton />,
  },
  {
    what: "Text on screen",
    keys: ["lode", "/"],
    sentence:
      "Type a few characters of anything you can see, mark the start and the end, and it is highlighted. Any app, even a terminal.",
    scene: <SceneText />,
  },
  {
    what: "What you copied",
    keys: ["⇧⌘V", "S"],
    sentence:
      "Every clip, in the same place every time, each under a letter. Something from an hour ago is one press.",
    scene: <SceneClipboard />,
  },
  {
    what: "What you say",
    keys: ["lode", "."],
    sentence:
      "Speak, and the words appear. Fix one from the keys, and return puts the sentence where your cursor was. Nothing you say leaves your Mac.",
    scene: <SceneSpeech />,
  },
];

export default async function Page() {
  const release = await latest();
  const baked = release.tag;
  const version = baked.replace(/^v/, "");
  // What a search engine is told, in its own vocabulary: a free macOS
  // application, its version, and where the build lives.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lodestar",
    operatingSystem: "macOS 13 or later",
    applicationCategory: "UtilitiesApplication",
    description:
      "Keyboard navigation for macOS: an app launcher, window management, click-by-letter, text selection by typing, clipboard history, and on-device dictation under one key.",
    url: "https://lodestar.vaccone.software/",
    softwareVersion: version,
    downloadUrl: `${repo}/releases/download/${baked}/lodestar-${version}.dmg`,
    releaseNotes: "https://lodestar.vaccone.software/changelog",
    license: `${repo}/blob/main/LICENSE.md`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Vaccone Software" },
  };
  return (
    <main id="top" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      {/* 00 · The moment. The real northern sky, the product in it, and one
          press shown before it is described. */}
      <section className="relative flex min-h-svh flex-col overflow-hidden px-[5vw] pt-24 pb-14 lg:px-8">
        <Starfield />
        <div className="to-ground pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent" />

        <div className="relative mx-auto grid w-full max-w-[1240px] flex-1 items-center gap-x-16 gap-y-14 lg:grid-cols-[minmax(0,10fr)_minmax(0,11fr)]">
          <div>
            <Mark size={52} />
            <p className="text-faint mt-8 font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="glint">✦</span>
              <span className="mx-2">·</span>
              Keyboard navigation for macOS
            </p>
            <h1 className="font-display text-ink mt-4 max-w-[15ch] text-[clamp(2.7rem,5.6vw,4.9rem)] leading-[0.98] font-normal tracking-[-0.025em]">
              Name it, and you are there
            </h1>
            <p className="text-dim mt-7 max-w-[40ch] text-[clamp(1.1rem,1.45vw,1.3rem)] leading-[1.5]">
              Hold one key and press a letter. The app you want is in front,
              maximized. The same gesture reaches a page, a button, a line of
              text, something you copied, something you say.
            </p>
            <div className="mt-10 max-w-[380px]">
              <DownloadButton fallback={baked} />
              <p className="text-faint mt-2.5 font-mono text-[11px] leading-relaxed">
                macOS 13 or later ·{" "}
                <LatestVersion fallback={baked} fallbackDate={release.date} /> ·
                nothing leaves your Mac
              </p>
            </div>
          </div>
          <div className="lg:pl-2">
            <SceneMoment />
          </div>
        </div>

        <div className="relative mx-auto mt-14 flex w-full max-w-[1240px] items-baseline justify-between font-mono text-[11px] tracking-[0.08em] uppercase">
          <span className="text-faint normal-case tracking-normal">
            The sky is the real northern sky, turned to your clock. The mark
            sits at the pole.
            <Sidereal />
          </span>
          <a href="#premise" className="text-faint hover:text-dim shrink-0">
            <span className="glint">01</span> · the premise ↓
          </a>
        </div>
      </section>

      {/* Everything below the hero shares the still field. */}
      <div className="dust">
        {/* 01 · The premise */}
        <section
          id="premise"
          className="border-hairline scroll-mt-16 border-t py-[12vh]"
        >
          <div className="mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <Reveal>
              <Eyebrow n="01">The premise</Eyebrow>
              <H2>Destination over process</H2>
            </Reveal>
            <Reveal delay={80} className="mt-8">
              <Prose>
                <p>
                  Most of what a computer asks of you is process: find the
                  window, find the tab, find the button, find the line you
                  copied an hour ago. Lodestar replaces each with a
                  destination, a place you name, and are at.
                </p>
                <p>
                  A button is somewhere different on every page. The letter M
                  is always Mail. A destination has to be fixed to be learned,
                  and once it is learned the decision disappears.
                </p>
              </Prose>
            </Reveal>
          </div>
        </section>

        {/* 02 · Everything is a destination */}
        <section className="border-hairline border-t py-[12vh]">
          <div className="mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <Reveal>
              <Eyebrow n="02">The pattern</Eyebrow>
              <H2>Everything is a destination</H2>
              <Prose className="mt-6">
                <p>
                  One grammar under one key. Learn it once, and your hands
                  know it everywhere.
                </p>
              </Prose>
            </Reveal>

            <Meridian />
            <ol className="meridian relative mt-16 lg:pl-10">
              {destinations.map((d, i) => (
                <Reveal
                  as="li"
                  key={d.what}
                  className="border-hairline grid items-center gap-x-14 gap-y-8 border-t py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                >
                  <div className="relative">
                    <span className="text-faint absolute -top-9 left-0 font-mono text-[11px] tracking-[0.2em]">
                      <svg
                        className="star"
                        width="11"
                        height="11"
                        viewBox="-6 -6 12 12"
                        aria-hidden="true"
                      >
                        <path
                          d="M0,-6 L1.2,-1.2 L6,0 L1.2,1.2 L0,6 L-1.2,1.2 L-6,0 L-1.2,-1.2 Z"
                          fill="#ff4f00"
                        />
                      </svg>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-ink text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
                      {d.what}
                    </h3>
                    <div className="mt-5 text-[17px]">
                      <Keys keys={d.keys} />
                    </div>
                    <p className="text-dim mt-5 max-w-[46ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.6]">
                      {d.sentence}
                    </p>
                  </div>
                  <div>{d.scene}</div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* 03 · The coach */}
        <section className="border-hairline border-t py-[12vh]">
          <div className="mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <div className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <Reveal>
                <Eyebrow n="03">The coach</Eyebrow>
                <H2>It learns from you, and recommends improvements to your workflow</H2>
                <Prose className="mt-6">
                  <p>
                    Nothing to learn up front. When a shorter way would pay,
                    Lodestar offers it, with the seconds it will give back
                    each week. One quiet chip at a time.
                  </p>
                </Prose>
              </Reveal>
              <Reveal delay={120}>
                <SceneCoach />
              </Reveal>
            </div>

            <div className="border-hairline mt-16 grid gap-px border-t lg:grid-cols-3">
              {[
                [
                  "Measured, not guessed",
                  "Every offer is fitted to your own record, and ranked by what past offers actually did for you.",
                ],
                [
                  "A partner, not a reminder",
                  "Accept, and Lodestar reshapes the road with you, because seeing a shortcut changes nothing until the old path costs something.",
                ],
                [
                  "On your Mac, and only there",
                  "Every observation stays on your Mac, and none of it is content: no titles, no addresses, no text. One line turns it off.",
                ],
              ].map(([head, body], i) => (
                <Reveal key={head} delay={i * 80} className="py-8 lg:pr-10">
                  <h3 className="font-display text-ink text-[22px] leading-tight">
                    {head}
                  </h3>
                  <p className="text-dim mt-3 text-[15.5px] leading-[1.6]">
                    {body}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal className="border-hairline mt-4 border-t pt-8">
              <p className="text-dim max-w-[64ch] text-[15.5px] leading-[1.6]">
                <span className="text-ink">One measurement, from a year on one hand.</span>{" "}
                A bare letter under lode misfired at zero. A two-key chain
                misfired between eight and forty-one percent of the time.
                That is why Lodestar offers single letters first. The rest of
                the measurements are on the{" "}
                <a
                  href="/evidence"
                  className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white"
                >
                  evidence
                </a>{" "}
                page.
              </p>
            </Reveal>
          </div>
        </section>

        {/* 04 · The trade */}
        <section className="border-hairline border-t py-[12vh]">
          <div className="mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <Reveal>
              <Eyebrow n="04">The trade</Eyebrow>
              <H2>What you give, and what you get</H2>
            </Reveal>
            <div className="mt-12 grid gap-x-16 gap-y-14 lg:grid-cols-2">
              {[
                {
                  side: "You give",
                  items: [
                    [
                      "One key",
                      "Lodestar lives on your right ⌘ key. Hold it and the keyboard speaks to Lodestar; release it and the keyboard is yours. Configurable.",
                    ],
                    [
                      "One permission, two if you want them",
                      "Accessibility, to move windows and press what you aim at. Screen Recording only for the two gestures that read the screen. Calendar only if you turn meetings on.",
                    ],
                  ],
                },
                {
                  side: "You get",
                  items: [
                    [
                      "Nothing leaves your Mac",
                      "No account, no server. The only network request asks GitHub whether a newer version exists.",
                    ],
                    [
                      "Fair Source",
                      "The source is public. Read it, audit it, change it for yourself. Each release becomes MIT two years on.",
                    ],
                  ],
                },
              ].map((group, gi) => (
                <Reveal key={group.side} delay={gi * 80}>
                  <h3 className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                    {group.side}
                  </h3>
                  <div className="border-hairline mt-4 space-y-10 border-t pt-8">
                    {group.items.map(([head, body]) => (
                      <div key={head}>
                        <h4 className="font-display text-ink text-[24px] leading-tight">
                          {head}
                        </h4>
                        <p className="text-dim mt-3 max-w-[52ch] text-[16px] leading-[1.6]">
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 05 · Everything it does */}
        <section className="border-hairline border-t py-[12vh]">
          <div className="mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <Reveal>
              <Eyebrow n="05">The chart</Eyebrow>
              <H2>Everything it does</H2>
              <Prose className="mt-6">
                <p>
                  You do not need most of this today. The{" "}
                  <a
                    href="/guide"
                    className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    guide
                  </a>{" "}
                  takes each one further.
                </p>
              </Prose>
            </Reveal>
            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {specification.map((group, gi) => (
                <Reveal key={group.label} delay={gi * 60}>
                  <h3 className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                    {group.label}
                  </h3>
                  <ul className="border-hairline mt-3 border-t">
                    {group.gestures.map((g) => (
                      <li
                        key={g.keys}
                        className="border-hairline grid grid-cols-[9.5rem_1fr] items-baseline gap-4 border-b py-2.5"
                      >
                        <span className="font-mono text-[12.5px] text-white/85">
                          {g.keys}
                        </span>
                        <span className="text-dim text-[14.5px] leading-snug">
                          {g.meaning}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The promise, under the sky again, and the download. */}
        <section
          id="download"
          className="border-hairline relative scroll-mt-16 overflow-hidden border-t py-[14vh]"
        >
          <Starfield />
          <div className="from-deep pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent" />
          <div className="relative mx-auto max-w-[1240px] px-[5vw] lg:px-8">
            <div className="grid items-end gap-x-16 gap-y-12 lg:grid-cols-2">
              <Reveal>
                <Mark size={52} />
                <Eyebrow n="06">The promise</Eyebrow>
                <h2 className="font-display text-ink mt-5 max-w-[18ch] text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.02] font-normal tracking-[-0.02em]">
                  Built to the standard space demands
                </h2>
                <Prose className="mt-6">
                  <p>
                    Aerospace is the one place where excellence is not a
                    preference. A suit that mostly works is a failure.
                    Lodestar is built in that spirit: a gesture has to land
                    every time, a claim has to carry its evidence, and a
                    promise about your data has to be structural. That is
                    the standard, and it is the promise.
                  </p>
                </Prose>
              </Reveal>
              <Reveal delay={100} className="w-full max-w-[520px] lg:justify-self-end">
                <p className="text-dim mb-5 max-w-[44ch] text-[16px] leading-[1.6]">
                  The first minute is a short walk: grant Accessibility, hold
                  the key, take three letters. The rest arrives as you are
                  ready.
                </p>
                <DownloadButton fallback={baked} />
                <div className="mt-3">
                  <CopyCommand command="brew install --cask vaccone-software/tap/lodestar" />
                </div>
                <p className="text-faint mt-4 font-mono text-[11px] leading-relaxed">
                  macOS 13 or later ·{" "}
                  <LatestVersion fallback={baked} fallbackDate={release.date} />{" "}
                  · Fair Source ·{" "}
                  <a
                    href={repo}
                    className="text-dim underline underline-offset-4"
                  >
                    source
                  </a>{" "}
                  ·{" "}
                  <a
                    href="/guide"
                    className="text-dim underline underline-offset-4"
                  >
                    guide
                  </a>{" "}
                  ·{" "}
                  <a
                    href="/evidence"
                    className="text-dim underline underline-offset-4"
                  >
                    evidence
                  </a>{" "}
                  ·{" "}
                  <a
                    href="/changelog"
                    className="text-dim underline underline-offset-4"
                  >
                    changelog
                  </a>
                </p>
              </Reveal>
            </div>
            <p className="text-faint mt-20 font-mono text-[11px] tracking-[0.08em] uppercase">
              Vaccone Software
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
