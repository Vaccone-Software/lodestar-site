"use client";

import { useEffect, useRef } from "react";
import { northernSky } from "@/data/northern-sky";

// Still the one motion on the page, and it means more than it did: this is
// the real northern sky. The named stars are plotted from their catalog
// coordinates, oriented to the visitor's clock, and the whole field wheels
// slowly around the celestial pole — which sits exactly behind the mark.
// Polaris, a degree off the pole, is hidden by the star drawn over it: the
// mark takes the lodestar's seat. Brightness follows real magnitudes,
// color follows real temperature, each star shimmers on its own compound
// rhythm, and once in a while a meteor falls in international orange.
// Reduced motion renders the same sky, still.

type Star = {
  r: number; // px from the pole
  a0: number; // minus right ascension, so screen angle = sky angle + a0
  size: number;
  alpha: number;
  color: string; // "r,g,b"
  glow: boolean;
  spike: boolean;
  twinkleAmp: number;
  twinkleFreq: number;
  twinklePhase: number;
  twinklePhase2: number;
};

type Meteor = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  start: number;
  duration: number;
};

const SIDEREAL = 7.292e-5; // rad/s, the true rate of the turning sky
const SPEED = 60; // a minute of sky per second; one wheel in ~24 min

// Local sidereal time, to the accuracy a timezone can give — enough that
// the sky over the page matches the sky over the visitor.
function siderealNow(): number {
  const days = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const gmst = 18.697374558 + 24.06570982441908 * days;
  const local = gmst - new Date().getTimezoneOffset() / 60;
  return ((local % 24) / 24) * Math.PI * 2;
}

// B−V color index to a quiet tint: blue-white, white, warm white, amber.
function tint(bv: number): string {
  if (bv < 0.1) return "223,230,248";
  if (bv < 0.55) return "242,243,245";
  if (bv < 1.1) return "246,234,214";
  return "244,220,186";
}

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lst0 = siderealNow();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let width = 0;
    let height = 0;
    let poleX = 0;
    let poleY = 0;
    let stars: Star[] = [];
    let meteor: Meteor | null = null;
    let meteorAt = performance.now() + 10000 + Math.random() * 14000;
    let disposed = false;

    const make = (r: number, a0: number, mag: number, bv: number): Star => ({
      r,
      a0,
      size: Math.max(0.5, 2.5 - 0.36 * mag),
      alpha: Math.min(0.95, Math.max(0.24, 1.04 - 0.1 * mag)),
      color: tint(bv),
      glow: mag <= 2.1,
      spike: mag <= 2.55,
      twinkleAmp: Math.min(0.5, 0.09 + 0.055 * mag),
      twinkleFreq: 0.4 + Math.random() * 0.9,
      twinklePhase: Math.random() * Math.PI * 2,
      twinklePhase2: Math.random() * Math.PI * 2,
    });

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

      // The pole sits behind the hero mark; the sky turns around the brand.
      const mark = parent.querySelector('svg[aria-label="Lodestar"]');
      if (mark) {
        const m = mark.getBoundingClientRect();
        const p = parent.getBoundingClientRect();
        poleX = m.left + m.width / 2 - p.left;
        poleY = m.top + m.height / 2 - p.top;
      } else {
        poleX = width / 2;
        poleY = height * 0.4;
      }

      // Fit sixty degrees of declination between the pole and the farthest
      // corner, so both Dippers and Cassiopeia land on screen at any size.
      const corner = Math.max(
        Math.hypot(poleX, poleY),
        Math.hypot(width - poleX, poleY),
        Math.hypot(poleX, height - poleY),
        Math.hypot(width - poleX, height - poleY),
      );
      const pxPerDeg = corner / 60;

      stars = northernSky.map(([ra, dec, mag, bv]) =>
        make((90 - dec) * pxPerDeg, -ra * (Math.PI / 12), mag, bv),
      );

      // An anonymous background field, faint and magnitude-weighted, seeded
      // over the whole turning disk so the corners never empty out.
      const rMax = corner + 24;
      const count = Math.round((Math.PI * rMax * rMax) / 13000);
      for (let i = 0; i < count; i++) {
        const mag = 4.1 + 2.4 * Math.sqrt(Math.random());
        const bv = Math.random() < 0.72 ? 0.3 : Math.random() < 0.5 ? 0.8 : 1.3;
        stars.push(
          make(
            Math.sqrt(Math.random()) * rMax,
            Math.random() * Math.PI * 2,
            mag,
            bv,
          ),
        );
      }
    };

    const draw = (now: number) => {
      const t = now / 1000;
      const theta = lst0 + (still ? 0 : SIDEREAL * SPEED * t);
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        const angle = theta + star.a0;
        const x = poleX - star.r * Math.sin(angle);
        const y = poleY - star.r * Math.cos(angle);
        if (x < -24 || x > width + 24 || y < -24 || y > height + 24) continue;
        // Two incommensurate sines so the shimmer wanders instead of
        // ticking; a still sky rests at the midpoint.
        const shimmer = still
          ? 0.5
          : 0.65 *
              (0.5 + 0.5 * Math.sin(star.twinkleFreq * t + star.twinklePhase)) +
            0.35 *
              (0.5 +
                0.5 *
                  Math.sin(star.twinkleFreq * 2.7 * t + star.twinklePhase2));
        const alpha = star.alpha * (1 - star.twinkleAmp * shimmer);
        if (star.glow) {
          // The halo breathes with the star.
          const reach = star.size * (6.5 + 1.5 * (1 - shimmer));
          const halo = context.createRadialGradient(x, y, 0, x, y, reach);
          halo.addColorStop(
            0,
            `rgba(${star.color},${(alpha * 0.32).toFixed(3)})`,
          );
          halo.addColorStop(1, `rgba(${star.color},0)`);
          context.globalAlpha = 1;
          context.fillStyle = halo;
          context.beginPath();
          context.arc(x, y, reach, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = alpha;
        context.fillStyle = `rgb(${star.color})`;
        context.beginPath();
        context.arc(x, y, star.size, 0, Math.PI * 2);
        context.fill();
        if (star.spike) {
          // The same four cardinals as the mark, on the brightest few —
          // enough that the Dipper's bowl and Cassiopeia's W glint as
          // shapes.
          const arm = 4 + star.size * 3;
          context.globalAlpha = alpha * 0.4;
          context.strokeStyle = `rgb(${star.color})`;
          context.lineWidth = 0.8;
          context.beginPath();
          context.moveTo(x - arm, y);
          context.lineTo(x + arm, y);
          context.moveTo(x, y - arm);
          context.lineTo(x, y + arm);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
    };

    const spawnMeteor = (now: number) => {
      const travel = 150 + Math.random() * 90;
      const angle = Math.PI * (0.22 + Math.random() * 0.23);
      const sign = Math.random() < 0.5 ? -1 : 1;
      meteor = {
        x: width * (0.12 + Math.random() * 0.76),
        y: height * (0.06 + Math.random() * 0.3),
        dx: Math.sin(angle) * travel * sign,
        dy: Math.cos(angle) * travel,
        start: now,
        duration: 700 + Math.random() * 500,
      };
    };

    const drawMeteor = (now: number) => {
      if (!meteor) return;
      const p = (now - meteor.start) / meteor.duration;
      if (p >= 1) {
        meteor = null;
        meteorAt = now + 14000 + Math.random() * 20000;
        return;
      }
      const fade = Math.sin(Math.PI * p);
      const hx = meteor.x + meteor.dx * p;
      const hy = meteor.y + meteor.dy * p;
      const norm = Math.hypot(meteor.dx, meteor.dy);
      const tx = hx - (meteor.dx / norm) * 90;
      const ty = hy - (meteor.dy / norm) * 90;
      const trail = context.createLinearGradient(tx, ty, hx, hy);
      trail.addColorStop(0, "rgba(255,79,0,0)");
      trail.addColorStop(1, `rgba(255,79,0,${(0.5 * fade).toFixed(3)})`);
      context.strokeStyle = trail;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(tx, ty);
      context.lineTo(hx, hy);
      context.stroke();
      context.globalAlpha = 0.85 * fade;
      context.fillStyle = "#ffd9c2";
      context.beginPath();
      context.arc(hx, hy, 1, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
    };

    const tick = (now: number) => {
      draw(now);
      if (!meteor && now >= meteorAt) spawnMeteor(now);
      drawMeteor(now);
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
    draw(performance.now());
    if (!still) raf = requestAnimationFrame(tick);
    const resize = () => {
      seed();
      draw(performance.now());
    };
    // The pole is measured off the mark, so re-measure once fonts settle.
    document.fonts?.ready.then(() => {
      if (!disposed) resize();
    });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0" aria-hidden="true" />;
}
