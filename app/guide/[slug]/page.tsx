import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import GuideScene from "@/components/GuideScene";
import { Keys as KeyCaps } from "@/components/Key";
import Options from "@/components/Options";
import Permalink from "@/components/Permalink";
import Reveal from "@/components/Reveal";
import { guide, type Lesson } from "@/data/guide";
import { latestRelease } from "@/lib/releases";

export function generateStaticParams() {
  return guide.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = guide.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: page.name,
    description: `${page.name} in Lodestar: ${page.blurb}`,
    alternates: { canonical: `/guide/${slug}` },
  };
}

function anchor(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** The lit keys for a lesson with no scene: what it names, lowercased,
    with lode as the hold and compound chords split. */
function litFor(lesson: Lesson): string[] {
  if (lesson.lit) return lesson.lit;
  return lesson.keys.flatMap((k) => {
    if (k === "lode") return ["lode"];
    if (k === "⇧⌘V") return ["⇧", "⌘", "v"];
    if (k.length === 2 && k[0] === "⇧") return ["⇧", k[1]];
    return [k];
  });
}

/** The keys, said aloud, for a lesson with nothing to animate. */
const names: Record<string, string> = {
  "⇧": "shift", "⌘": "command", "⌃": "control", "⌥": "option",
  "⏎": "return", "⌫": "delete", "⇥": "tab", "←": "left arrow", "→": "right arrow",
  space: "space", esc: "esc", lode: "lode",
};
function say(key: string): string {
  if (names[key]) return names[key];
  if (key.length > 1 && /^[⇧⌘⌃⌥]+/.test(key)) {
    const mods = key.match(/^[⇧⌘⌃⌥]+/)![0].split("").map((m) => names[m]);
    return [...mods, key.slice(mods.length)].join(" ");
  }
  return key;
}
function spoken(keys: string[]): string {
  if (keys.length === 0) return "";
  const parts = keys.map((k, i) => (k === "lode" && i === 0 ? "hold lode" : say(k)));
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const [first, ...rest] = parts;
  return `${first.charAt(0).toUpperCase() + first.slice(1)}, then ${rest.join(", then ")}`;
}

function LessonBlock({ lesson, n }: { lesson: Lesson; n: string }) {
  return (
    <Reveal
      as="li"
      className="border-hairline grid items-start gap-x-14 gap-y-7 border-t py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div id={anchor(lesson.title)} className="scroll-mt-24">
        <p className="text-faint text-[12px] font-semibold tabular-nums">
          <span className="text-accent">{n}</span>
          {lesson.hidden ? (
            <span className="text-accent ml-3">Few know this</span>
          ) : null}
          <Permalink anchor={anchor(lesson.title)} />
        </p>
        <h3 className="text-ink mt-2.5 text-[clamp(1.45rem,2.4vw,1.9rem)] leading-[1.1] font-semibold tracking-[-0.025em]">
          {lesson.title}
        </h3>
        {lesson.keys.length ? (
          <div className="mt-4 text-[17px]">
            <KeyCaps keys={lesson.keys} />
          </div>
        ) : null}
        <p className="text-dim mt-4 max-w-[46ch] text-[16px] leading-[1.6]">
          {lesson.rule}
        </p>
      </div>
      <div>
        {lesson.table ? (
          <dl className="border-hairline border-t">
            {lesson.table.map(([keys, meaning]) => (
              <div
                key={keys}
                className="border-hairline grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b py-3"
              >
                <dt className="font-mono text-[13px] font-medium text-white/90">{keys}</dt>
                <dd className="text-dim text-[15px] leading-[1.55]">{meaning}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <GuideScene scene={lesson.scene} lit={litFor(lesson)} caption={spoken(lesson.keys)} />
        )}
      </div>
    </Reveal>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = guide.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const page = guide[index];
  const prev = guide[index - 1];
  const next = guide[index + 1];
  const { tag } = await latestRelease();
  const lessons = [page.first, ...page.ready];
  const section = (n: string, label: string) => (
    <p className="text-faint text-[12px] font-semibold tracking-[0.14em] uppercase">
      <span className="text-accent">{n}</span>
      <span className="mx-2">·</span>
      {label}
    </p>
  );
  const h2 = "text-ink mt-3 max-w-[18ch] text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.06] font-semibold tracking-[-0.03em]";
  return (
    <>
      <Nav tag={tag} current="guide" />
      <main id="main" className="mx-auto max-w-[1240px] px-4 pt-8 pb-16 md:px-7">
        <p className="text-faint text-[12px] font-semibold tracking-[0.14em] uppercase">
          <a href="/guide" className="text-accent hover:text-[#ff7a3d]">Guide</a>
          <span className="mx-2">·</span>
          {String(index + 1).padStart(2, "0")} of {guide.length}
        </p>
        <h1 className="over-sky mt-3 text-[clamp(38px,5vw,64px)] leading-[1] font-semibold tracking-[-0.04em]">
          {page.name}
        </h1>
        <p className="text-dim mt-4 max-w-[52ch] text-[18px] leading-[1.55]">
          {page.blurb}
        </p>

        {/* At a glance: every lesson on the page, with its keys, one line
            each, for the hand that only needs reminding. */}
        <nav aria-label="Lessons" className="border-hairline mt-10 rounded-[14px] border bg-white/[0.025] p-2">
          <ol className="grid md:grid-cols-2">
            {lessons.map((lesson, i) => (
              <li key={lesson.title}>
                <a
                  href={`#${anchor(lesson.title)}`}
                  className="grid grid-cols-[1.9rem_1fr_auto] items-center gap-2 rounded-[10px] px-3 py-2.5 hover:bg-white/[0.04]"
                >
                  <span className="text-faint text-[12px] font-semibold tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[14.5px] leading-snug">{lesson.title}</span>
                  <span className="text-[14px]">
                    {lesson.keys.length ? <KeyCaps keys={lesson.keys} /> : null}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <section className="mt-14">
          {section("01", "The first minute")}
          <ol className="mt-4">
            <LessonBlock lesson={page.first} n="01" />
          </ol>
        </section>

        <section className="mt-10">
          {section("02", "When you are ready")}
          <ol className="mt-4">
            {page.ready.map((lesson, i) => (
              <LessonBlock key={lesson.title} lesson={lesson} n={String(i + 2).padStart(2, "0")} />
            ))}
          </ol>
        </section>

        <section className="border-hairline mt-10 grid gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal>
            {section("03", "The fine print")}
            <h2 className={h2}>What nobody finds by pressing keys</h2>
          </Reveal>
          <Reveal delay={80}>
            <ul className="border-hairline border-t">
              {page.finePrint.map((line) => (
                <li key={line} className="border-hairline text-dim border-b py-3.5 text-[15.5px] leading-[1.6]">
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="border-hairline mt-10 grid gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal>
            {section("04", "Why")}
            <h2 className={h2}>Why it works this way</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-dim max-w-[60ch] text-[17px] leading-[1.6]">{page.why}</p>
          </Reveal>
        </section>

        <section className="border-hairline mt-10 border-t pt-10">
          <Reveal>
            {section("05", "Settings")}
            <h2 className={h2}>The settings behind this page</h2>
            <p className="text-dim mt-3 max-w-[60ch] text-[15.5px] leading-[1.6]">
              Read from the schema Lodestar itself emits. The settings window
              shows the same rows, and each wears the path it writes.
            </p>
          </Reveal>
          <Options keys={page.options} />
        </section>

        <nav className="mt-14 flex items-baseline justify-between text-[14px] font-medium">
          {prev ? (
            <a href={`/guide/${prev.slug}`} className="text-dim hover:text-ink">
              ← {prev.name}
            </a>
          ) : (
            <a href="/guide" className="text-dim hover:text-ink">← Guide</a>
          )}
          {next ? (
            <a href={`/guide/${next.slug}`} className="text-dim hover:text-ink">
              {next.name} →
            </a>
          ) : (
            <a href="/guide" className="text-dim hover:text-ink">Guide →</a>
          )}
        </nav>
        <Foot className="border-hairline mt-10 border-t pt-6" />
      </main>
    </>
  );
}
