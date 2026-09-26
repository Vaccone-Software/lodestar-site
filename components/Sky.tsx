"use client";

import { useEffect, useRef } from "react";

// The sky behind the whole site: plain stars on a near-black ground, and
// nothing drawn between them. It turns about the mark where a page has one
// (an element marked data-pole), as the night turns about the pole star,
// and about a point above the page everywhere else. One turn in twenty-four
// minutes, sixty times the true rate. Reduced motion draws the same sky,
// still.

type Star = {
  r: number;
  a: number;
  size: number;
  alpha: number;
  color: string;
  twinkle: number;
  phase: number;
};

const TURN = (2 * Math.PI) / (24 * 60);

/** A seeded generator, so the sky is the same on every visit. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tint(r: number): string {
  if (r < 0.22) return "214,224,255";
  if (r < 0.8) return "242,242,244";
  if (r < 0.93) return "248,234,212";
  return "250,214,178";
}

export default function Sky() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let cx = 0;
    let cy = 0;
    let stars: Star[] = [];
    let raf = 0;

    const seed = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const pole = document.querySelector("[data-pole]");
      if (pole) {
        const box = pole.getBoundingClientRect();
        cx = box.left + box.width / 2;
        cy = box.top + box.height / 2 + window.scrollY;
      } else {
        cx = width * 0.5;
        cy = -height * 0.2;
      }
      const reach =
        Math.max(
          Math.hypot(cx, cy),
          Math.hypot(width - cx, cy),
          Math.hypot(cx, height - cy),
          Math.hypot(width - cx, height - cy),
        ) + 20;
      const random = seeded(11);
      const count = Math.round((Math.PI * reach * reach) / 2300);
      stars = [];
      for (let i = 0; i < count; i++) {
        const magnitude = Math.pow(random(), 2.6);
        stars.push({
          r: Math.sqrt(random()) * reach,
          a: random() * Math.PI * 2,
          size: 0.45 + magnitude * 1.5,
          alpha: 0.28 + 0.6 * Math.pow(random(), 0.7),
          color: tint(random()),
          twinkle: 0.5 + random() * 1.2,
          phase: random() * Math.PI * 2,
        });
      }
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const theta = still ? 0 : TURN * t;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const angle = star.a + theta;
        const x = cx + star.r * Math.cos(angle);
        const y = cy + star.r * Math.sin(angle);
        if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
        const shimmer = still
          ? 1
          : 0.78 + 0.22 * Math.sin(star.twinkle * t + star.phase);
        context.fillStyle = `rgba(${star.color},${(star.alpha * shimmer).toFixed(3)})`;
        context.beginPath();
        context.arc(x, y, star.size, 0, Math.PI * 2);
        context.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };

    const restart = () => {
      cancelAnimationFrame(raf);
      seed();
      raf = requestAnimationFrame(draw);
    };
    restart();
    // The mark settles once the page has laid itself out; measure again.
    const settle = window.setTimeout(restart, 400);
    window.addEventListener("resize", restart);
    // A hidden tab has no sky to draw.
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else restart();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("resize", restart);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
