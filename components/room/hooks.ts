"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { macAccent, orange } from "@/lib/room/accent";

function watch(query: string) {
  return {
    subscribe(notify: () => void) {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    snapshot: () => window.matchMedia(query).matches,
  };
}

const dark = watch("(prefers-color-scheme: dark)");
const still = watch("(prefers-reduced-motion: reduce)");
const hover = watch("(hover: hover)");

/** Whether the Mac is in its night appearance. The server draws the day. */
export function useNight(): boolean {
  return useSyncExternalStore(dark.subscribe, dark.snapshot, () => false);
}

/** Whether motion is asked to be left out. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(still.subscribe, still.snapshot, () => false);
}

/** Whether the pointer can rest on a thing without pressing it. */
export function useHover(): boolean {
  return useSyncExternalStore(hover.subscribe, hover.snapshot, () => false);
}

/** Calls back every frame with the seconds since it began, until the
    component goes. The callback may change between frames. */
export function useFrames(frame: (seconds: number) => void) {
  const latest = useRef(frame);
  useEffect(() => {
    latest.current = frame;
  });
  useEffect(() => {
    const began = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      latest.current((now - began) / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

const storeKey = "lodestar.accent";

// Storage can be missing or refuse (a private window, blocked site data), and
// the room is just as right without it.
function recall(): string | null {
  try {
    return localStorage.getItem(storeKey);
  } catch {
    return null;
  }
}

function remember(hex: string) {
  try {
    localStorage.setItem(storeKey, hex);
  } catch {}
}

/** The room's accent: what you chose, else your Mac's, else International
    Orange. Read after mount, so the page the server draws is the orange one. */
export function useAccent(): {
  accent: string;
  detected: string | null;
  choose: (hex: string) => void;
} {
  const [accent, setAccent] = useState(orange);
  const [detected, setDetected] = useState<string | null>(null);
  useEffect(() => {
    const found = macAccent();
    setDetected(found);
    setAccent(recall() ?? found ?? orange);
  }, []);
  return {
    accent,
    detected,
    choose: (hex) => {
      setAccent(hex);
      remember(hex);
    },
  };
}

/** What a script waits with: resolves after the delay, and never once the
    script has been put away. Under reduced motion there is no delay. */
export type Wait = (ms: number) => Promise<void>;

/** Plays a script while it is active: demos, and the mend on the headline.
    The script sets its own state and starts from its own beginning each
    time; put away, it stops where it is. With a gap it plays again after
    that many milliseconds, and under reduced motion it plays once and rests
    on its last frame. */
export function useScript(
  play: (wait: Wait) => Promise<void>,
  { active = true, gap }: { active?: boolean; gap?: number } = {},
) {
  const reduced = useReducedMotion();
  const latest = useRef(play);
  useEffect(() => {
    latest.current = play;
  });
  useEffect(() => {
    if (!active) return;
    let live = true;
    const timers = new Set<number>();
    const wait: Wait = (ms) =>
      new Promise((resolve) => {
        const timer = window.setTimeout(
          () => {
            timers.delete(timer);
            if (live) resolve();
          },
          reduced ? 0 : ms,
        );
        timers.add(timer);
      });
    (async () => {
      do {
        await latest.current(wait);
        if (gap === undefined || reduced) return;
        await wait(gap);
      } while (live);
    })();
    return () => {
      live = false;
      timers.forEach(window.clearTimeout);
    };
  }, [active, gap, reduced]);
}
