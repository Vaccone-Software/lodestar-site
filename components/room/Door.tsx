"use client";

import { useEffect, useRef } from "react";
import { compose, pictureFor } from "@/components/room/pictures";
import { useFrames, useReducedMotion } from "@/components/room/hooks";
import type { Door as DoorData } from "@/data/doors";
import { chapters } from "@/data/room";
import { aspect, type Placement } from "@/lib/room/layout";
import styles from "./Room.module.css";

/** Every picture's shadow falls straight away from the mark, as on the
    Settings overview, and a raised door's falls longer. Night draws none
    until a door is raised. */
function shadow(away: Placement["away"], raised: boolean, night: boolean) {
  if (night && !raised) return "none";
  const length = Math.hypot(away.x, away.y) || 1;
  const reach = raised ? 22 : 12;
  const x = (away.x / length) * reach;
  const y = (away.y / length) * reach + (raised ? 14 : 8);
  const alpha = night ? 0.6 : raised ? 0.42 : 0.34;
  const blur = raised ? 26 : 16;
  return `drop-shadow(${x.toFixed(1)}px ${y.toFixed(1)}px ${blur}px rgb(var(--shade) / ${alpha}))`;
}

/** The gentle sway the site's loops have: each picture floats a little, out
    of step with its neighbours. */
function sway(seconds: number, index: number): string {
  const w = (seconds / 8) * Math.PI * 2 + index * 1.7;
  const x = Math.sin(w) * 1.2;
  const y = Math.sin(w * 0.5 + 1) * 1.6;
  const lift = Math.sin(w + 0.6) * 3;
  return `perspective(900px) rotateX(${x.toFixed(2)}deg) rotateY(${y.toFixed(2)}deg) translateY(${lift.toFixed(1)}px)`;
}

/** One door of the ring: its picture, a keycap digit, its name and the
    app's line for it. A link to the door's own page, which a click opens as
    a panel instead. */
export default function Door({
  door,
  index,
  placement,
  picture,
  accent,
  night,
  raised,
  opened,
  dimmed,
  onRaise,
  onOpen,
}: {
  door: DoorData;
  index: number;
  /** Where it stands; none until the room has measured itself, and the link
      waits out of sight. */
  placement: Placement | null;
  /** The picture's width in pixels. */
  picture: number | null;
  /** The accent the picture is tinted with. */
  accent: string;
  night: boolean;
  /** The pointer or the focus is on it. */
  raised: boolean;
  /** Its panel is open. */
  opened: boolean;
  /** Another door's panel is open. */
  dimmed: boolean;
  onRaise: (on: boolean) => void;
  onOpen: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const height = (picture ?? 0) * aspect;
  const up = raised || opened;

  // Composed again when the accent, the ground or the size changes.
  useEffect(() => {
    const element = canvas.current;
    if (!element || !picture) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.round(picture * dpr);
    element.height = Math.round(height * dpr);
    let current = true;
    pictureFor(door.slug, night)
      .then((loaded) => current && compose(element, loaded, accent))
      .catch((error) => console.error(error));
    return () => {
      current = false;
    };
  }, [door.slug, night, accent, picture, height]);

  useFrames((seconds) => {
    if (canvas.current && !reduced)
      canvas.current.style.transform = sway(seconds, index);
  });

  return (
    <a
      href={`/${door.slug}`}
      aria-keyshortcuts={String(index + 1)}
      aria-expanded={opened}
      className={`${styles.door} ${raised ? styles.up : ""} ${dimmed ? styles.dimmed : ""}`}
      style={
        placement
          ? { left: placement.x, top: placement.y }
          : { visibility: "hidden" }
      }
      onMouseEnter={() => onRaise(true)}
      onMouseLeave={() => onRaise(false)}
      onFocus={() => onRaise(true)}
      onBlur={() => onRaise(false)}
      onClick={(event) => {
        // A modified click is asking for the page itself.
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onOpen();
      }}
    >
      <canvas
        ref={canvas}
        aria-hidden="true"
        style={{
          width: picture ?? 0,
          height,
          filter: placement ? shadow(placement.away, up, night) : undefined,
        }}
      />
      <span className={styles.name}>
        <span aria-hidden="true" className={`key ${up ? "lit" : ""}`}>
          {index + 1}
        </span>
        {door.name}
      </span>
      <span className={styles.line}>{chapters[door.slug].line}</span>
    </a>
  );
}
