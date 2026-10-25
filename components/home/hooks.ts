"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

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

const still = watch("(prefers-reduced-motion: reduce)");

/** Whether motion is asked to be left out. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(still.subscribe, still.snapshot, () => false);
}

/** Whether a media query matches; the server answers `fallback`. */
export function useMedia(query: string, fallback = false): boolean {
  const media = useRef(watch(query));
  return useSyncExternalStore(
    media.current.subscribe,
    media.current.snapshot,
    () => fallback,
  );
}

/** Calls back every frame with the seconds since it began, until the
    component goes. The callback may change between frames. */
export function useFrames(frame: (seconds: number) => void, running = true) {
  const latest = useRef(frame);
  useEffect(() => {
    latest.current = frame;
  });
  useEffect(() => {
    if (!running) return;
    const began = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      latest.current((now - began) / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
}

/** What a script waits with: resolves after the delay, and never once the
    script has been put away. */
export type Wait = (ms: number) => Promise<void>;

/** Plays a script, over and over, while it is active. The script sets its
    own state as it goes; put away, it stops where it is, and the caller
    draws its still. Under reduced motion it never starts. */
export function useScript(
  play: (wait: Wait) => Promise<void>,
  active: boolean,
) {
  const reduced = useReducedMotion();
  const latest = useRef(play);
  useEffect(() => {
    latest.current = play;
  });
  useEffect(() => {
    if (!active || reduced) return;
    let live = true;
    const timers = new Set<number>();
    const wait: Wait = (ms) =>
      new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          if (live) resolve();
        }, ms);
        timers.add(timer);
      });
    (async () => {
      while (live) await latest.current(wait);
    })();
    return () => {
      live = false;
      timers.forEach(window.clearTimeout);
    };
  }, [active, reduced]);
}
