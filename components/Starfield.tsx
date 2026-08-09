"use client";

import { useEffect, useRef } from "react";

// The one motion on the page, and the only one that means something: the
// product is named for a guiding star. Sparse, slow, three depth layers,
// the occasional beacon in international orange. Reduced motion renders a
// still sky.
type Star = { x: number; y: number; z: number; r: number; beacon: boolean };

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((width * height) / 11000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.35 + Math.random() * 0.65,
        r: Math.random() < 0.12 ? 1.4 : Math.random() < 0.5 ? 1.0 : 0.7,
        beacon: Math.random() < 0.045,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        context.globalAlpha = 0.3 + star.z * 0.6;
        context.fillStyle = star.beacon ? "#ff4f00" : "#f2f3f5";
        context.beginPath();
        context.arc(star.x, star.y, star.r * star.z, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const tick = () => {
      for (const star of stars) {
        star.x += 0.016 * star.z;
        star.y -= 0.006 * star.z;
        if (star.x > width + 2) star.x = -2;
        if (star.y < -2) star.y = height + 2;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!still) {
        raf = requestAnimationFrame(tick);
      }
    };

    seed();
    draw();
    if (!still) raf = requestAnimationFrame(tick);
    const resize = () => {
      seed();
      draw();
    };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
