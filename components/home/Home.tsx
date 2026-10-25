"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import DownloadPill from "@/components/DownloadPill";
import Foot from "@/components/Foot";
import Key, { Keys } from "@/components/Key";
import { KeepDoor, SpeakDoor, SwitchDoor, WriteDoor, type RowKeys } from "@/components/home/Doors";
import Mark from "@/components/home/Mark";
import { useMedia, useReducedMotion } from "@/components/home/hooks";
import { namedHeight, tiles as layTiles, type Tile } from "@/components/home/wall";
import { doors } from "@/data/doors";
import { facts, features, headline, subline, type Feature } from "@/data/home";
import styles from "./Home.module.css";

// The homepage is the launcher. "Where to?" finds the four doors, the guide,
// the changelog and every feature on the wall; ↑↓ chooses, ⏎ opens, and ⏎
// with nothing chosen downloads. A door is still until it is chosen, by its
// row or by the pointer resting on it, and then it plays. Stacked (narrow or
// short), a row takes you down to its card instead.

type Slug = "write" | "switch" | "keep" | "speak";

type Row = {
  id: string;
  kind: "door" | "site" | "feature";
  name: string;
  line: string;
  href: string;
  alias: string[];
};

const icons: Record<string, React.ReactNode> = {
  write: <path d="M4 16.5h14M5 13.5c2-3 3-6 6-6s2 4 4 4 2-2 3-3" />,
  switch: (
    <>
      <rect x="3" y="6" width="11" height="9" rx="2.4" />
      <rect x="8" y="3" width="11" height="9" rx="2.4" />
    </>
  ),
  keep: (
    <>
      <rect x="3" y="4" width="7" height="6" rx="1.6" />
      <rect x="12" y="4" width="7" height="6" rx="1.6" />
      <rect x="3" y="12" width="7" height="6" rx="1.6" />
      <rect x="12" y="12" width="7" height="6" rx="1.6" />
    </>
  ),
  speak: <path d="M5 9v4M8 6v10M11 8v6M14 4v14M17 9v4" />,
  download: <path d="M11 3v11M6.5 9.5 11 14l4.5-4.5M4 18h14" />,
  guide: <path d="M4 4.5h5.5a2 2 0 0 1 2 2V18a2 2 0 0 0-2-2H4zM18 4.5h-5.5a2 2 0 0 0-2 2V18a2 2 0 0 1 2-2H18z" />,
  changelog: <path d="M5 5h12M5 11h12M5 17h8" />,
  feature: (
    <>
      <rect x="3.5" y="4.5" width="15" height="13" rx="3" />
      <path d="M3.5 8.5h15" />
    </>
  ),
};

const doorRows: Row[] = doors.map((door) => ({
  id: door.slug,
  kind: "door",
  name: door.name,
  line: door.what,
  href: `/${door.slug}`,
  alias: [door.slug, ...door.description.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)],
}));

const siteRows = (download: string): Row[] => [
  { id: "download", kind: "site", name: "Download Lodestar", line: facts, href: download, alias: ["download", "get", "install", "free", "lodestar"] },
  { id: "guide", kind: "site", name: "Guide", line: "Every key and every option", href: "/guide", alias: ["guide", "help", "keys", "how"] },
  { id: "changelog", kind: "site", name: "Changelog", line: "What changed in each release", href: "/changelog", alias: ["changelog", "release", "notes", "new", "version"] },
];

const featureRows: Row[] = features.map((f) => ({
  id: f.id,
  kind: "feature",
  name: f.name,
  line: f.line,
  href: `/guide/${f.guide}`,
  alias: [f.id, ...f.name.toLowerCase().split(" "), ...f.alias],
}));

function find(query: string, download: string): Row[] {
  const q = query.trim().toLowerCase();
  if (!q) return doorRows;
  // A name that starts with what you typed first, then a word of the name,
  // then a word it is found by.
  const rank = (r: Row) => {
    const name = r.name.toLowerCase();
    if (name.startsWith(q) || name.startsWith(`the ${q}`)) return 0;
    if (name.split(" ").some((w) => w.startsWith(q))) return 1;
    return r.alias.some((a) => a.startsWith(q)) ? 2 : 3;
  };
  return [...doorRows, ...siteRows(download), ...featureRows]
    .map((row, i) => ({ row, i, rank: rank(row) }))
    .filter((r) => r.rank < 3)
    .sort((a, b) => a.rank - b.rank || a.i - b.i)
    .slice(0, 4)
    .map((r) => r.row);
}

/** The keys on a row: a door's as its loop presses them, a feature's as
    typed. */
function RowKeysOf({ row, down, letter }: { row: Row; down: Record<string, boolean>; letter: string }) {
  const k = (name: string, legend: string) => (
    <Key down={!!down[name]}>{legend}</Key>
  );
  switch (row.id) {
    case "write":
      return <span className="inline-flex gap-1">{k("write-1", "lode")}{k("write-2", "⇥")}</span>;
    case "switch":
      return <span className="inline-flex gap-1">{k("switch-1", "lode")}{k("switch-2", letter)}</span>;
    case "keep":
      return <span className="inline-flex gap-1">{k("keep-1", "⇧⌘V")}</span>;
    case "speak":
      return <span className="inline-flex gap-1">{k("speak-1", "lode")}{k("speak-2", ".")}</span>;
  }
  const f = features.find((x) => x.id === row.id);
  return f ? <FeatureKeys feature={f} /> : null;
}

function FeatureKeys({ feature, quiet = false }: { feature: Feature; quiet?: boolean }) {
  if (!feature.keys) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <Keys keys={feature.keys} quiet={quiet} />
      {feature.also ? <Keys keys={feature.also} quiet={quiet} /> : null}
    </span>
  );
}

const doorPictures: Record<Slug, (props: { active: boolean; rows: RowKeys }) => React.ReactNode> = {
  write: WriteDoor,
  switch: SwitchDoor,
  keep: KeepDoor,
  speak: SpeakDoor,
};

export default function Home({ tag, nav, download }: { tag: string | null; nav: React.ReactNode; download: string }) {
  const wide = useMedia("(min-width: 1180px) and (min-height: 740px)");
  const phone = useMedia("(max-width: 640px)");
  const reduced = useReducedMotion();

  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(-1);
  const [pinned, setPinned] = useState<Slug | null>(null);
  const [down, setDown] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState("m");
  const [flash, setFlash] = useState<string | null>(null);
  const [wall, setWall] = useState<Tile[]>([]);
  // Too short for the eight round the bar: they stand beneath it, and the
  // page scrolls to them.
  const [short, setShort] = useState(false);

  const stage = useRef<HTMLElement>(null);
  const center = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const get = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => find(query, download), [query, download]);
  const chosen = shown[sel];
  const active: Slug | null = chosen?.kind === "door" ? (chosen.id as Slug) : pinned;
  const lifted = chosen?.kind === "feature" ? chosen.id : null;

  const rows: RowKeys = useMemo(
    () => ({ hold: (name, d) => setDown((s) => (s[name] === d ? s : { ...s, [name]: d })), letter: setLetter }),
    [],
  );
  // A door put away lets go of every key on its row.
  useEffect(() => setDown({}), [active]);

  // The wall is drawn round the bar and the doors wherever they stand.
  useLayoutEffect(() => {
    if (!wide) {
      setShort(false);
      return void setWall([]);
    }
    const draw = () => {
      const s = stage.current?.getBoundingClientRect();
      const c = center.current?.getBoundingClientRect();
      const l = left.current?.getBoundingClientRect();
      const r = right.current?.getBoundingClientRect();
      if (!s || !c || !l || !r) return;
      // Room round the bar's row on one screen, between the bar and the foot.
      const margin = (window.innerHeight - 52 - 36 - c.height) / 2;
      const below = margin < 140;
      setShort(below);
      setWall(
        layTiles({
          width: s.width,
          height: s.height,
          top: c.top - s.top,
          bottom: c.bottom - s.top,
          left: l.left - s.left,
          door: l.width,
          bar: c.left - s.left,
          barWidth: c.width,
          right: r.left - s.left,
          mode: below ? "below" : "around",
        }),
      );
    };
    draw();
    const observer = new ResizeObserver(draw);
    if (stage.current) observer.observe(stage.current);
    if (center.current) observer.observe(center.current);
    return () => observer.disconnect();
  }, [wide, short]);

  // Stacked, a door stops when it leaves the screen.
  useEffect(() => {
    if (wide || !pinned) return;
    const card = document.getElementById(`door-${pinned}`);
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setPinned(null);
      },
      { threshold: 0.15 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [wide, pinned]);

  const downloadNow = useCallback(() => get.current?.querySelector<HTMLElement>("a, button")?.click(), []);

  const go = useCallback(
    (el: Element | null) => el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }),
    [reduced],
  );

  const open = useCallback(
    (row: Row) => {
      if (row.id === "download") return downloadNow();
      if (!wide && row.kind === "door") {
        go(document.getElementById(`door-${row.id}`));
        setSel(-1);
        setPinned(row.id as Slug);
        return;
      }
      if (!wide && row.kind === "feature") {
        go(document.getElementById(`more-${row.id}`));
        setSel(-1);
        setFlash(row.id);
        window.setTimeout(() => setFlash((f) => (f === row.id ? null : f)), 2400);
        return;
      }
      window.location.href = row.href;
    },
    [wide, go, downloadNow],
  );

  // Typing anywhere goes to the bar, as in the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const typing = document.activeElement === input.current;
      if (!typing && document.activeElement instanceof HTMLInputElement) return;
      if (!typing && event.key.length === 1 && /\S/.test(event.key)) input.current?.focus();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const n = shown.length;
        if (!n) return;
        setSel((s) => (s < 0 ? (event.key === "ArrowDown" ? 0 : n - 1) : (s + (event.key === "ArrowDown" ? 1 : -1) + n) % n));
      } else if (event.key === "Enter" && (typing || document.activeElement === document.body)) {
        event.preventDefault();
        if (shown[sel]) open(shown[sel]);
        else if (!query) downloadNow();
      } else if (event.key === "Escape") {
        setQuery("");
        setSel(-1);
        input.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, sel, query, open, downloadNow]);

  const rest = () => {
    if (!query) setSel(-1);
  };

  return (
    <div className={`${styles.page} ${short ? styles.short : ""}`} style={{ "--named": `${namedHeight}px` } as React.CSSProperties}>
      {nav}
      <main id="main" ref={stage} className={styles.stage}>
        <div className={styles.wall} aria-hidden="true">
          {wall.map((tile, i) => (
            <WallTile key={i} tile={tile} lifted={!!tile.feature && tile.feature.id === lifted} />
          ))}
        </div>

        <div ref={center} className={styles.center}>
          <section className={styles.hero} aria-label="Lodestar">
            <Mark size={phone ? 52 : 64} />
            <div>
              <h1 className={styles.headline}>{headline}</h1>
              <p className={styles.subline}>{subline}</p>
            </div>
            <div ref={get} className={styles.get}>
              <DownloadPill fallback={tag} />
              <span className={styles.facts}>{facts}</span>
            </div>
          </section>

          <section className={styles.launcher} aria-label="Where to?" onMouseLeave={rest}>
            <label className={`${styles.field} well`} data-typed={query ? "" : undefined}>
              <span className={styles.fakeCaret} aria-hidden="true" />
              <input
                ref={input}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSel(e.target.value.trim() ? 0 : -1);
                }}
                placeholder="Where to?"
                aria-label="Where to?"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <ul className={styles.rows} role="listbox" aria-label="Places">
              {shown.length ? (
                shown.map((row, i) => (
                  <li
                    key={row.id}
                    role="option"
                    aria-selected={i === sel}
                    className={`${styles.row} ${i === sel ? `${styles.chosen} clay` : ""}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => open(row)}
                  >
                    <span className={styles.rowIcon}>
                      <svg viewBox="0 0 22 22" aria-hidden="true">
                        {icons[row.kind === "feature" ? "feature" : row.id]}
                      </svg>
                    </span>
                    <span className={styles.rowText}>
                      <span className={styles.rowName}>{row.name}</span>
                      <span className={styles.rowLine}>{row.line}</span>
                    </span>
                    <span className={styles.rowTrail}>
                      <RowKeysOf row={row} down={down} letter={letter} />
                      <Key lit className={styles.enter}>
                        ⏎
                      </Key>
                      {row.kind !== "site" ? (
                        <span className={styles.go} aria-hidden="true">
                          ↓
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))
              ) : (
                <li className={styles.none}>Nothing by that name. Try breaths, meetings or the coach</li>
              )}
            </ul>
            <div className={styles.barFoot}>
              <span>
                <Key>↑</Key>
                <Key>↓</Key>
                <span>choose</span>
                <Key>⏎</Key>
                <span>open</span>
                <Key>esc</Key>
                <span>clear</span>
              </span>
              <span>Type breaths, meetings or the coach</span>
            </div>
          </section>
        </div>

        <div ref={left} className={styles.left}>
          {(["write", "speak"] as const).map((slug) => (
            <DoorCard key={slug} slug={slug} active={active === slug} rows={rows} wide={wide} choose={setSel} shown={shown} query={query} pinned={pinned} setPinned={setPinned} rest={rest} />
          ))}
        </div>
        <div ref={right} className={styles.right}>
          {(["switch", "keep"] as const).map((slug) => (
            <DoorCard key={slug} slug={slug} active={active === slug} rows={rows} wide={wide} choose={setSel} shown={shown} query={query} pinned={pinned} setPinned={setPinned} rest={rest} />
          ))}
        </div>

        <section className={styles.more} aria-labelledby="more-h">
          <h2 id="more-h">Also in Lodestar</h2>
          <ul className={styles.moreList}>
            {features.map((f) => (
              <li key={f.id}>
                <a id={`more-${f.id}`} href={`/guide/${f.guide}`} className={`${styles.moreItem} ${flash === f.id ? styles.lit : ""}`}>
                  <span className={styles.moreName}>{f.name}</span>
                  <p>{f.line}</p>
                  <FeatureKeys feature={f} quiet />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Foot className="h-9 flex-none items-center px-4 md:px-6" />
    </div>
  );
}

function DoorCard({
  slug,
  active,
  rows,
  wide,
  choose,
  shown,
  query,
  pinned,
  setPinned,
  rest,
}: {
  slug: Slug;
  active: boolean;
  rows: RowKeys;
  wide: boolean;
  choose: (i: number) => void;
  shown: Row[];
  query: string;
  pinned: Slug | null;
  setPinned: (slug: Slug | null) => void;
  rest: () => void;
}) {
  const door = doors.find((d) => d.slug === slug)!;
  const Picture = doorPictures[slug];
  return (
    <a
      id={`door-${slug}`}
      href={`/${slug}`}
      data-door={slug}
      aria-label={`${door.name}: ${door.what}`}
      className={`${styles.door} ${active ? `${styles.chosen} clay` : ""}`}
      onMouseEnter={() => {
        if (!wide || query) return;
        choose(shown.findIndex((r) => r.id === slug));
      }}
      onMouseLeave={() => wide && rest()}
      onClick={(event) => {
        // Stacked, a tap plays the door; side by side, the click opens its page.
        if (wide) return;
        event.preventDefault();
        setPinned(pinned === slug ? null : slug);
      }}
    >
      <span className={styles.doorName}>{door.name}</span>
      <Picture active={active} rows={rows} />
    </a>
  );
}

function WallTile({ tile, lifted }: { tile: Tile; lifted: boolean }) {
  const f = tile.feature;
  const style = { left: tile.x, top: tile.y, width: tile.w, height: tile.h };
  const wire = (
    <div className={styles.tileBody} style={f ? (tile.low ? { top: 0, bottom: 120 } : { top: 120, bottom: 0 }) : { top: 36, bottom: 0 }}>
      {tile.wire.map((p, i) =>
        p.kind === "r" ? (
          <i key={i} className={styles.r} style={{ left: p.x }} />
        ) : (
          <i key={i} className={styles[p.kind]} style={{ left: p.x, top: p.y, width: p.w, height: p.kind === "b" ? p.h : undefined }} />
        ),
      )}
    </div>
  );
  if (!f) {
    return (
      <div className={styles.tile} style={style}>
        <div className={styles.tileTitle}>
          <span className={styles.tileDots}>
            <i />
            <i />
            <i />
          </span>
        </div>
        {wire}
      </div>
    );
  }
  return (
    <div
      className={`${styles.tile} ${tile.low ? styles.low : ""} ${lifted ? styles.lift : ""}`}
      style={style}
      data-feature={f.id}
      onClick={() => (window.location.href = `/guide/${f.guide}`)}
    >
      {wire}
      <div className={styles.tileHead}>
        <div className={styles.tileTitle}>{f.name}</div>
        <div className={styles.tileAbout}>
          <p>{f.line}</p>
          <FeatureKeys feature={f} quiet />
        </div>
      </div>
    </div>
  );
}
