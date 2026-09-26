"use client";

import { useEffect, useRef } from "react";

// A rendered loop with its background cut away. Safari plays HEVC with
// transparency, everything else VP9 in WebM; each would take the other's
// file and paint a black box, so the choice is made here rather than by
// <source> order. Reduced motion, or a browser that will not start a muted
// loop by itself, keeps the poster.
export default function Loop({
  src,
  className = "",
}: {
  /** The path without an extension: `${src}.webm`, `.mp4` and `.webp`. */
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ua = navigator.userAgent;
    const safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua);
    video.src = `${src}.${safari ? "mp4" : "webm"}`;
    const playing = video.play();
    if (playing) playing.catch(() => {});
  }, [src]);
  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={`${src}.webp`}
      aria-hidden="true"
      className={className}
    />
  );
}
