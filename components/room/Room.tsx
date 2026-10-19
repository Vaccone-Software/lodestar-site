"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import AccentPicker from "@/components/room/AccentPicker";
import Door from "@/components/room/Door";
import Headline from "@/components/room/Headline";
import Mark from "@/components/room/Mark";
import Panel from "@/components/room/Panel";
import DownloadPill from "@/components/DownloadPill";
import {
  useAccent,
  useHover,
  useNight,
  useReducedMotion,
} from "@/components/room/hooks";
import { doors } from "@/data/doors";
import { downloading, facts, health } from "@/data/room";
import { wear } from "@/lib/room/accent";
import {
  arrange,
  opensOnLeft,
  type Layout,
  type Slug,
} from "@/lib/room/layout";
import { standing, type Lean } from "@/lib/room/mark";
import styles from "./Room.module.css";

/** The light-up of a download, from the first face to the last. */
const lighting = 2600;

type Notice = { title: string; line: string };

/** How long a notice is read for: longer for longer words. */
function reading({ title, line }: Notice): number {
  return Math.min(4000, 1400 + Math.max(0, (title + line).length - 20) * 50);
}

/** The panel opens opposite its door, so the door stays in view; on a phone
    it is a sheet from the bottom. */
function panelStyle(layout: Layout, slug: Slug): React.CSSProperties {
  if (layout.phone) {
    return {
      left: 12,
      right: 12,
      bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
      width: "auto",
    };
  }
  const top = Math.max(70, layout.cy - 220);
  return opensOnLeft(slug)
    ? { top, left: Math.max(16, layout.cx - layout.dx - 170) }
    : {
        top,
        right: Math.max(16, layout.cx * 2 - (layout.cx + layout.dx + 170)),
      };
}

/** The homepage: a Lodestar room. The mark is the one light in it, four
    doors stand on a hairline ring round it, each with the app's own picture
    of its place in Settings, and everything is drawn from the app's rules
    (DESIGN.md, "Objects in One Light"). No scrolling: the room fits the
    window and the window is all of it. */
export default function Room({ tag }: { tag: string | null }) {
  const night = useNight();
  const hover = useHover();
  const reduced = useReducedMotion();
  const { accent, detected, choose } = useAccent();
  const worn = wear(accent, night);

  const [layout, setLayout] = useState<Layout | null>(null);
  const [raised, setRaised] = useState<Slug | null>(null);
  const [opened, setOpened] = useState<Slug | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const stage = useRef<HTMLElement>(null);
  const voice = useRef<HTMLDivElement>(null);
  const buy = useRef<HTMLDivElement>(null);
  const progress = useRef(standing);
  const noticeTimer = useRef(0);

  // The doors take whatever the headline and the download leave.
  useLayoutEffect(() => {
    const room = stage.current;
    const above = voice.current;
    const below = buy.current;
    if (!room || !above || !below) return;
    const measure = () => {
      const box = room.getBoundingClientRect();
      setLayout(
        arrange(
          room.clientWidth,
          above.getBoundingClientRect().bottom - box.top + 14,
          below.getBoundingClientRect().top - box.top - 14,
        ),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    for (const element of [room, above, below]) observer.observe(element);
    // The voice changes height when its face arrives.
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  const say = (message: Notice) => {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(
      () => setNotice(null),
      reading(message),
    );
  };

  // Health is not a door; it speaks once, as it would on your Mac.
  useEffect(() => {
    const timer = window.setTimeout(() => say(health), health.after);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  // The mark is the progress: it lights face by face while the real download
  // starts, which the link does by itself.
  const running = useRef(false);
  const frame = useRef(0);
  const settle = useRef(0);
  const download = () => {
    if (running.current) return;
    running.current = true;
    progress.current = 0;
    const began = performance.now();
    const step = (now: number) => {
      progress.current = reduced ? 1 : Math.min(1, (now - began) / lighting);
      if (progress.current < 1) {
        frame.current = requestAnimationFrame(step);
        return;
      }
      say(downloading);
      settle.current = window.setTimeout(() => {
        progress.current = standing;
        running.current = false;
      }, 900);
    };
    frame.current = requestAnimationFrame(step);
  };
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(settle.current);
    },
    [],
  );

  // A digit opens its door and escape closes it, as in the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Escape") setOpened(null);
      const door = doors[Number(event.key) - 1];
      if (door) setOpened(door.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The mark leans toward the door you come to.
  let toward: Lean = [0, 0];
  const near = raised && layout ? layout.doors[raised].away : null;
  if (near) {
    const length = Math.hypot(near.x, near.y) || 1;
    toward = [(near.y / length) * 0.2, (near.x / length) * 0.3];
  }

  const index = doors.findIndex((door) => door.slug === opened);
  const colours = {
    ["--accent" as string]: worn.ui,
    ["--on-accent" as string]: worn.on,
    ["--accent-top" as string]: worn.top,
    ["--accent-lip" as string]: worn.lip,
  };

  return (
    <div className={styles.room} style={colours}>
      <header className={styles.nav}>
        <a href="/" className={styles.brand}>
          Lodestar
        </a>
        <nav aria-label="Main" className={styles.links}>
          <a href="/guide">Guide</a>
          <a href="/changelog">Changelog</a>
        </nav>
        <DownloadPill
          fallback={tag}
          label="Download"
          small
          onDownload={download}
        />
      </header>

      <main id="main" ref={stage} className={styles.stage}>
        <Headline
          ref={voice}
          // Write acts on the headline, and only where a pointer can rest.
          mending={raised === "write" && opened === null && hover}
        />

        {layout?.ring ? (
          <svg className={styles.ring} aria-hidden="true">
            <ellipse
              cx={layout.cx}
              cy={layout.cy}
              rx={layout.ring.rx}
              ry={layout.ring.ry}
            />
          </svg>
        ) : null}
        {layout ? (
          <Mark
            className={styles.mark}
            size={layout.mark.size}
            accent={accent}
            night={night}
            toward={toward}
            progress={progress}
            // Placed by its own centre.
            style={{
              left: layout.mark.x - layout.mark.size / 2,
              top: layout.mark.y - layout.mark.size / 2,
            }}
          />
        ) : null}

        {doors.map((door, i) => (
          <Door
            key={door.slug}
            door={door}
            index={i}
            placement={layout?.doors[door.slug] ?? null}
            picture={layout?.picture ?? null}
            accent={accent}
            night={night}
            raised={raised === door.slug}
            opened={opened === door.slug}
            dimmed={opened !== null && opened !== door.slug}
            onRaise={(on) =>
              setRaised(
                on
                  ? door.slug
                  : (current) => (current === door.slug ? null : current),
              )
            }
            onOpen={() => setOpened(opened === door.slug ? null : door.slug)}
          />
        ))}

        <div ref={buy} className={styles.buy}>
          <DownloadPill
            fallback={tag}
            label="Download Lodestar"
            onDownload={download}
          />
          <span className={styles.facts}>{facts}</span>
          <AccentPicker accent={accent} detected={detected} onPick={choose} />
        </div>

        {opened && layout ? (
          <Panel
            key={opened}
            door={doors[index]}
            index={index}
            style={panelStyle(layout, opened)}
            onClose={() => setOpened(null)}
          />
        ) : null}

        <div
          role="status"
          aria-live="polite"
          className={`${styles.flash} ${notice ? styles.on : ""}`}
        >
          {notice ? (
            <>
              <b>{notice.title}</b>
              <span>{notice.line}</span>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
