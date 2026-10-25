import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import GuideScene from "@/components/GuideScene";
import { Keys as KeyCaps } from "@/components/Key";
import Options from "@/components/Options";
import Permalink from "@/components/Permalink";
import { guide, type Lesson } from "@/data/guide";
import { doors } from "@/data/doors";
import { stableRelease } from "@/lib/server/stable";
import { appId, breadcrumbs, graph, pageMetadata, site } from "@/lib/seo";

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
  return pageMetadata({
    title: page.title,
    description: page.description,
    path: `/guide/${slug}`,
  });
}

function anchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
  "⇧": "shift",
  "⌘": "command",
  "⌃": "control",
  "⌥": "option",
  "⏎": "return",
  "⌫": "delete",
  "⇥": "tab",
  "←": "left arrow",
  "→": "right arrow",
  space: "space",
  esc: "esc",
  lode: "lode",
};
function say(key: string): string {
  if (names[key]) return names[key];
  if (key.length > 1 && /^[⇧⌘⌃⌥]+/.test(key)) {
    const mods = key
      .match(/^[⇧⌘⌃⌥]+/)![0]
      .split("")
      .map((m) => names[m]);
    return [...mods, key.slice(mods.length)].join(" ");
  }
  return key;
}
function spoken(keys: string[]): string {
  if (keys.length === 0) return "";
  const parts = keys.map((k, i) =>
    k === "lode" && i === 0 ? "hold lode" : say(k),
  );
  if (parts.length === 1)
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const [first, ...rest] = parts;
  return `${first.charAt(0).toUpperCase() + first.slice(1)}, then ${rest.join(", then ")}`;
}

function LessonBlock({ lesson, n }: { lesson: Lesson; n: string }) {
  return (
    <li className="border-hairline grid items-start gap-x-14 gap-y-7 border-t py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div id={anchor(lesson.title)} className="scroll-mt-24">
        <p className="text-faint flex items-center text-[13px] font-medium tabular-nums">
          <span>{n}</span>
          {lesson.hidden ? (
            <span className="text-dim ml-3 rounded-[var(--control)] px-2 py-0.5 shadow-[inset_0_0_0_0.5px_currentColor]">
              Few know this
            </span>
          ) : null}
          <Permalink anchor={anchor(lesson.title)} />
        </p>
        <h3 className="font-display text-ink mt-3 text-[clamp(1.45rem,2.4vw,1.9rem)] leading-[1.1] font-bold tracking-[-0.02em]">
          {lesson.title}
        </h3>
        {lesson.keys.length ? (
          <div className="mt-4">
            <KeyCaps keys={lesson.keys} />
          </div>
        ) : null}
        <p className="text-dim mt-4 max-w-[46ch] text-[16px] leading-[1.6]">
          {lesson.rule}
        </p>
      </div>
      <div>
        {lesson.table ? (
          <dl className="pane grid p-2">
            {lesson.table.map(([keys, meaning]) => (
              <div
                key={keys}
                className="border-hairline grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b px-3 py-3 last:border-b-0"
              >
                <dt className="text-ink text-[13px] font-semibold">{keys}</dt>
                <dd className="text-dim text-[16px] leading-[1.5]">
                  {meaning}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <GuideScene
            scene={lesson.scene}
            lit={litFor(lesson)}
            caption={spoken(lesson.keys)}
          />
        )}
      </div>
    </li>
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
  const { tag } = await stableRelease();
  const lessons = [page.first, ...page.ready];
  const door = doors.find((d) => d.slug === page.door);
  const jsonLd = graph(
    {
      "@type": "TechArticle",
      headline: page.title,
      description: page.blurb,
      url: `${site}/guide/${page.slug}`,
      about: { "@id": appId },
      author: { "@type": "Organization", name: "Vaccone Software" },
    },
    breadcrumbs([
      { name: "Lodestar", path: "/" },
      { name: "Guide", path: "/guide" },
      { name: page.name, path: `/guide/${page.slug}` },
    ]),
  );
  // A section's name, said once, at the meta size in quiet ink: the page's
  // order is already its reading order, so it wears no number.
  const section = (_n: string, label: string) => (
    <p className="text-dim text-[13px] font-semibold">{label}</p>
  );
  const h2 =
    "font-display text-ink mt-2 max-w-[18ch] text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.06] font-bold tracking-[-0.025em]";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Nav tag={tag} current="guide" />
      <main
        id="main"
        className="mx-auto max-w-[1240px] px-4 pt-10 pb-16 md:px-7"
      >
        <p className="text-dim text-[13px] font-medium tabular-nums">
          <a
            href="/guide"
            className="text-ink hover:text-dim transition-colors"
          >
            Guide
          </a>
          <span className="mx-2">·</span>
          {String(index + 1).padStart(2, "0")} of {guide.length}
          {door ? (
            <>
              <span className="mx-2">·</span>
              <a
                href={`/${door.slug}`}
                className="hover:text-ink transition-colors"
              >
                Part of {door.name}
              </a>
            </>
          ) : null}
        </p>
        <h1 className="font-display mt-3 text-[clamp(38px,5vw,60px)] leading-[1.02] font-bold tracking-[-0.03em]">
          {page.name}
        </h1>
        <p className="text-dim mt-4 max-w-[52ch] text-[18px] leading-[1.5]">
          {page.blurb}
        </p>

        {/* At a glance: every lesson on the page, with its keys, one line
            each, for the hand that only needs reminding. */}
        <nav aria-label="Lessons" className="pane mt-10 p-2">
          <ol className="grid gap-0.5 md:grid-cols-2">
            {lessons.map((lesson, i) => (
              <li key={lesson.title}>
                <a
                  href={`#${anchor(lesson.title)}`}
                  className="hover:bg-raised grid min-h-[48px] grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-[10px] px-3 py-2 transition-colors"
                >
                  <span className="text-faint text-[13px] font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[16px] leading-snug">
                    {lesson.title}
                  </span>
                  <span>
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
              <LessonBlock
                key={lesson.title}
                lesson={lesson}
                n={String(i + 2).padStart(2, "0")}
              />
            ))}
          </ol>
        </section>

        <section className="border-hairline mt-10 grid gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            {section("03", "The fine print")}
            <h2 className={h2}>What nobody finds by pressing keys</h2>
          </div>
          <div>
            <ul className="border-hairline border-t">
              {page.finePrint.map((line) => (
                <li
                  key={line}
                  className="border-hairline text-dim border-b py-3.5 text-[16px] leading-[1.6]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-hairline mt-10 grid gap-x-16 gap-y-6 border-t pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            {section("04", "Why")}
            <h2 className={h2}>Why it works this way</h2>
          </div>
          <div>
            <p className="text-dim max-w-[60ch] text-[17px] leading-[1.6]">
              {page.why}
            </p>
          </div>
        </section>

        <section className="border-hairline mt-10 border-t pt-10">
          <div>
            {section("05", "Settings")}
            <h2 className={h2}>The settings behind this page</h2>
            <p className="text-dim mt-3 max-w-[60ch] text-[16px] leading-[1.6]">
              Read from the schema Lodestar itself emits. The settings window
              shows the same rows, and each wears the path it writes.
            </p>
          </div>
          <Options keys={page.options} />
        </section>

        <nav className="mt-14 flex items-baseline justify-between text-[16px] font-medium">
          {prev ? (
            <a href={`/guide/${prev.slug}`} className="text-dim hover:text-ink">
              ← {prev.name}
            </a>
          ) : (
            <a href="/guide" className="text-dim hover:text-ink">
              ← Guide
            </a>
          )}
          {next ? (
            <a href={`/guide/${next.slug}`} className="text-dim hover:text-ink">
              {next.name} →
            </a>
          ) : (
            <a href="/guide" className="text-dim hover:text-ink">
              Guide →
            </a>
          )}
        </nav>
        <Foot className="border-hairline mt-10 border-t pt-6" />
      </main>
    </>
  );
}
