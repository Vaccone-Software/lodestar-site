import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import GuideScene from "@/components/GuideScene";
import { Keys as KeyCaps } from "@/components/Key";
import Options from "@/components/Options";
import Reveal from "@/components/Reveal";
import { guide, type Lesson } from "@/data/guide";

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

function LessonBlock({ lesson, n }: { lesson: Lesson; n: string }) {
  return (
    <Reveal
      as="li"
      className="border-hairline grid items-start gap-x-14 gap-y-8 border-t py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <div id={anchor(lesson.title)} className="scroll-mt-24">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em]">
          <span className="glint">✦</span> {n}
          {lesson.hidden ? (
            <span className="glint ml-3 normal-case tracking-normal">few know this</span>
          ) : null}
        </p>
        <h3 className="font-display text-ink mt-3 text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.08] tracking-[-0.02em]">
          {lesson.title}
        </h3>
        {lesson.keys.length ? (
          <div className="mt-4 text-[17px]">
            <KeyCaps keys={lesson.keys} />
          </div>
        ) : null}
        <p className="text-dim mt-5 max-w-[46ch] text-[clamp(1rem,1.2vw,1.12rem)] leading-[1.6]">
          {lesson.rule}
        </p>
      </div>
      <div>
        <GuideScene scene={lesson.scene} lit={litFor(lesson)} caption={lesson.title} />
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
  return (
    <main className="min-h-svh px-[5vw] pt-28 pb-24 lg:px-8">
      <Header />
      <div className="mx-auto max-w-[1240px]">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          <a href="/guide" className="hover:text-dim">Guide</a>
          <span className="mx-2">·</span>
          {String(index + 1).padStart(2, "0")} of {guide.length}
        </p>
        <h1 className="font-display mt-4 text-[clamp(2.4rem,5.4vw,4.2rem)] leading-[1.0] font-normal tracking-[-0.025em]">
          {page.name}
        </h1>
        <p className="text-dim mt-5 max-w-[52ch] text-[18px] leading-[1.6]">
          {page.blurb}
        </p>

        {/* The first minute */}
        <section className="mt-16">
          <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
            <span className="glint">01</span>
            <span className="mx-2">·</span>
            The first minute
          </p>
          <ol className="mt-6">
            <LessonBlock lesson={page.first} n="01" />
          </ol>
        </section>

        {/* When you are ready */}
        <section className="mt-12">
          <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
            <span className="glint">02</span>
            <span className="mx-2">·</span>
            When you are ready
          </p>
          <ol className="mt-6">
            {page.ready.map((lesson, i) => (
              <LessonBlock key={lesson.title} lesson={lesson} n={String(i + 2).padStart(2, "0")} />
            ))}
          </ol>
        </section>

        {/* The fine print */}
        <section className="border-hairline mt-12 grid gap-x-16 gap-y-8 border-t pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal>
            <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="glint">03</span>
              <span className="mx-2">·</span>
              The fine print
            </p>
            <h2 className="font-display text-ink mt-4 max-w-[16ch] text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
              What nobody finds by pressing keys
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <ul className="border-hairline border-t">
              {page.finePrint.map((line) => (
                <li key={line} className="border-hairline text-dim border-b py-4 text-[16px] leading-[1.6]">
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Why */}
        <section className="border-hairline mt-12 grid gap-x-16 gap-y-8 border-t pt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal>
            <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="glint">04</span>
              <span className="mx-2">·</span>
              Why
            </p>
            <h2 className="font-display text-ink mt-4 max-w-[16ch] text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
              Why it works this way
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-dim max-w-[60ch] text-[clamp(1.05rem,1.25vw,1.2rem)] leading-[1.6]">
              {page.why}
            </p>
          </Reveal>
        </section>

        {/* Its lines */}
        <section className="border-hairline mt-12 border-t pt-12">
          <Reveal>
            <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="glint">05</span>
              <span className="mx-2">·</span>
              Its lines
            </p>
            <h2 className="font-display text-ink mt-4 max-w-[20ch] text-[clamp(1.8rem,3.4vw,2.6rem)] leading-[1.05] tracking-[-0.02em]">
              The config behind this page
            </h2>
            <p className="text-dim mt-4 max-w-[60ch] text-[16px] leading-[1.6]">
              Read from the schema Lodestar itself emits. The settings window
              shows the same rows, and each wears the path it writes.
            </p>
          </Reveal>
          <Options keys={page.options} />
        </section>

        {/* Next */}
        <nav className="mt-16 flex items-baseline justify-between font-mono text-[12px]">
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
            <a href="/" className="text-accent">Download →</a>
          )}
        </nav>
      </div>
    </main>
  );
}
