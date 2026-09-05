"use client";

import { useEffect, useRef } from "react";
import { northernSky } from "@/data/northern-sky";

// The sky behind the whole site. One fixed canvas under every page: the
// real northern sky, plotted from catalogue coordinates, oriented to the
// visitor's clock, wheeling around the celestial pole at its true rate
// sixty times over. The pole sits behind the hero's mark at the top of the
// page; the page scrolls over the sky the way a room scrolls under one.
//
// Three layers give it depth. The catalogue stars and the Milky Way are
// far and hold still. An anonymous near field drifts a little with the
// scroll. Hairline figures join the Dippers and Cassiopeia, so the claim
// that the sky is real can be checked by anyone who knows the shapes.
// Reduced motion renders the same sky, still.

type Star = {
  r: number;
  a0: number;
  size: number;
  alpha: number;
  color: string;
  glow: boolean;
  spike: boolean;
  twinkleAmp: number;
  twinkleFreq: number;
  twinklePhase: number;
  twinklePhase2: number;
};

type Meteor = { x: number; y: number; dx: number; dy: number; start: number; duration: number };

const SIDEREAL = 7.292e-5; // rad/s, the true rate of the turning sky
const SPEED = 60; // a minute of sky per second; one wheel in ~24 min

function siderealNow(): number {
  const days = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const gmst = 18.697374558 + 24.06570982441908 * days;
  const local = gmst - new Date().getTimezoneOffset() / 60;
  return ((local % 24) / 24) * Math.PI * 2;
}

function tint(bv: number): string {
  if (bv < 0.1) return "223,230,248";
  if (bv < 0.55) return "242,243,245";
  if (bv < 1.1) return "246,234,214";
  return "244,220,186";
}

// The figures, by catalogue position (J2000): the Big Dipper, the Little
// Dipper, and Cassiopeia's W. Hours and degrees, joined in order.
const figures: [number, number][][] = [
  // Ursa Major, the Dipper: Alkaid, Mizar, Alioth, Megrez, Phecda, Merak, Dubhe, back to Megrez
  [[13.792, 49.31], [13.399, 54.93], [12.900, 55.96], [12.257, 57.03], [11.897, 53.69], [11.031, 56.38], [11.062, 61.75], [12.257, 57.03]],
  // Ursa Minor: Polaris, Yildun, Epsilon, Zeta, Beta (Kochab), Gamma (Pherkad), Eta, Zeta
  [[2.530, 89.26], [17.537, 86.59], [16.766, 82.04], [15.734, 77.79], [14.845, 74.16], [15.345, 71.83], [16.292, 75.76], [15.734, 77.79]],
  // Cassiopeia: Caph, Schedar, Gamma, Ruchbah, Segin
  [[0.153, 59.15], [0.675, 56.54], [0.945, 60.72], [1.430, 60.24], [1.907, 63.67]],
];

// Galactic to equatorial (J2000), the transpose of the standard matrix,
// so the Milky Way can be drawn where it actually runs.
function galacticToEquatorial(l: number, b: number): [number, number] {
  const cl = Math.cos(l), sl = Math.sin(l), cb = Math.cos(b), sb = Math.sin(b);
  const gx = cb * cl, gy = cb * sl, gz = sb;
  const ex = -0.0548755604 * gx + 0.4941094279 * gy - 0.867666149 * gz;
  const ey = -0.8734370902 * gx - 0.44482963 * gy - 0.1980763734 * gz;
  const ez = -0.4838350155 * gx + 0.7469822445 * gy + 0.4559837762 * gz;
  const dec = Math.asin(ez);
  let ra = Math.atan2(ey, ex);
  if (ra < 0) ra += Math.PI * 2;
  return [(ra / (Math.PI * 2)) * 24, (dec * 180) / Math.PI];
}

export default function Sky() {
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
    let pxPerDeg = 1;
    let rMax = 0;
    let far: Star[] = [];
    let near: Star[] = [];
    let band: HTMLCanvasElement | null = null;
    let meteor: Meteor | null = null;
    let meteorAt = performance.now() + 9000 + Math.random() * 14000;
    let disposed = false;

    const make = (r: number, a0: number, mag: number, bv: number): Star => ({
      r,
      a0,
      size: Math.max(0.55, 2.8 - 0.36 * mag),
      alpha: Math.min(0.95, Math.max(0.3, 1.08 - 0.1 * mag)),
      color: tint(bv),
      glow: mag <= 2.1,
      spike: mag <= 2.55,
      twinkleAmp: Math.min(0.5, 0.09 + 0.055 * mag),
      twinkleFreq: 0.4 + Math.random() * 0.9,
      twinklePhase: Math.random() * Math.PI * 2,
      twinklePhase2: Math.random() * Math.PI * 2,
    });

    // The pole: behind the hero's mark when the page has one, measured at
    // the top of the document; a fixed point up and to the left otherwise.
    const findPole = () => {
      const mark = document.querySelector('svg[aria-label="Lodestar"]');
      if (mark) {
        const m = mark.getBoundingClientRect();
        poleX = m.left + m.width / 2;
        poleY = m.top + m.height / 2 + window.scrollY;
        if (poleY < height) return;
      }
      poleX = width * 0.12;
      poleY = height * 0.26;
    };

    const seed = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      findPole();

      // Fit sixty degrees of declination between the pole and the farthest
      // corner, so both Dippers and Cassiopeia land on screen at any size.
      const corner = Math.max(
        Math.hypot(poleX, poleY),
        Math.hypot(width - poleX, poleY),
        Math.hypot(poleX, height - poleY),
        Math.hypot(width - poleX, height - poleY),
      );
      pxPerDeg = corner / 60;
      rMax = corner + 40;

      far = northernSky.map(([ra, dec, mag, bv]) => make((90 - dec) * pxPerDeg, -ra * (Math.PI / 12), mag, bv));
      const count = Math.round((Math.PI * rMax * rMax) / 7000);
      for (let i = 0; i < count; i++) {
        const mag = 4.1 + 2.4 * Math.sqrt(Math.random());
        const bv = Math.random() < 0.72 ? 0.3 : Math.random() < 0.5 ? 0.8 : 1.3;
        far.push(make(Math.sqrt(Math.random()) * rMax, Math.random() * Math.PI * 2, mag, bv));
      }
      // The near field: fewer, a shade larger, and they drift with the scroll.
      near = [];
      for (let i = 0; i < Math.round(count / 6); i++) {
        const mag = 3.6 + 1.6 * Math.sqrt(Math.random());
        near.push(make(Math.sqrt(Math.random()) * rMax, Math.random() * Math.PI * 2, mag, 0.3));
      }
      band = paintBand();
    };

    // The Milky Way, painted once in the sky's own frame (pole at the
    // centre, sidereal angle zero) and turned with the sky each frame.
    const paintBand = (): HTMLCanvasElement => {
      const off = document.createElement("canvas");
      const side = Math.ceil(rMax * 2);
      off.width = side * dpr;
      off.height = side * dpr;
      const c = off.getContext("2d")!;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = side / 2, cy = side / 2;
      const place = (raH: number, dec: number) => {
        const r = (90 - dec) * pxPerDeg;
        const a = -raH * (Math.PI / 12);
        return [cx - r * Math.sin(a), cy - r * Math.cos(a)] as const;
      };
      // Haze along the galactic equator, only where it is within the drawn cap.
      for (let deg = 0; deg < 360; deg += 1.5) {
        const [ra, dec] = galacticToEquatorial((deg * Math.PI) / 180, 0);
        if (dec < 28) continue;
        const [x, y] = place(ra, dec);
        const reach = 26 * (pxPerDeg / 12) + 14;
        const g = c.createRadialGradient(x, y, 0, x, y, reach);
        g.addColorStop(0, "rgba(236,238,246,0.028)");
        g.addColorStop(1, "rgba(236,238,246,0)");
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, reach, 0, Math.PI * 2);
        c.fill();
      }
      // Dense faint stars within a few degrees of the band.
      for (let i = 0; i < 900; i++) {
        const l = Math.random() * Math.PI * 2;
        const b = ((Math.random() - 0.5) * 2 * 6 * Math.PI) / 180;
        const [ra, dec] = galacticToEquatorial(l, b);
        if (dec < 28) continue;
        const [x, y] = place(ra, dec);
        c.globalAlpha = 0.18 + Math.random() * 0.3;
        c.fillStyle = "rgb(240,242,248)";
        c.beginPath();
        c.arc(x, y, 0.35 + Math.random() * 0.5, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 1;
      // The figures: hairlines between named stars.
      c.strokeStyle = "rgba(242,243,245,0.11)";
      c.lineWidth = 0.8;
      for (const figure of figures) {
        c.beginPath();
        figure.forEach(([ra, dec], i) => {
          const [x, y] = place(ra, dec);
          if (i === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        });
        c.stroke();
      }
      return off;
    };

    const drawStars = (stars: Star[], t: number, theta: number, ox: number, oy: number) => {
      for (const star of stars) {
        const angle = theta + star.a0;
        const x = poleX - star.r * Math.sin(angle) + ox;
        const y = poleY - star.r * Math.cos(angle) + oy;
        if (x < -24 || x > width + 24 || y < -24 || y > height + 24) continue;
        const shimmer = still
          ? 0.5
          : 0.65 * (0.5 + 0.5 * Math.sin(star.twinkleFreq * t + star.twinklePhase)) +
            0.35 * (0.5 + 0.5 * Math.sin(star.twinkleFreq * 2.7 * t + star.twinklePhase2));
        const alpha = star.alpha * (1 - star.twinkleAmp * shimmer);
        if (star.glow) {
          const reach = star.size * (6.5 + 1.5 * (1 - shimmer));
          const halo = context.createRadialGradient(x, y, 0, x, y, reach);
          halo.addColorStop(0, `rgba(${star.color},${(alpha * 0.32).toFixed(3)})`);
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

    const draw = (now: number) => {
      const t = now / 1000;
      const theta = lst0 + (still ? 0 : SIDEREAL * SPEED * t);
      // The sky is fixed; the page scrolls over it. The pole was measured
      // at the top of the document, so it rides up with the scroll a
      // little, and the near field a little more: depth.
      const scroll = window.scrollY;
      const farY = -scroll * 0.04;
      const nearY = -scroll * 0.1;
      context.clearRect(0, 0, width, height);
      if (band) {
        context.save();
        context.translate(poleX, poleY + farY);
        context.rotate(-theta);
        context.drawImage(band, -rMax, -rMax, rMax * 2, rMax * 2);
        context.restore();
      }
      drawStars(far, t, theta, 0, farY);
      drawStars(near, t, theta, 0, nearY);
    };

    const spawnMeteor = (now: number) => {
      const travel = 150 + Math.random() * 90;
      const angle = Math.PI * (0.22 + Math.random() * 0.23);
      const sign = Math.random() < 0.5 ? -1 : 1;
      meteor = {
        x: width * (0.12 + Math.random() * 0.76),
        y: height * (0.06 + Math.random() * 0.5),
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

    const restart = () => {
      cancelAnimationFrame(raf);
      if (!still && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onScrollStill = () => {
      if (still) draw(performance.now());
    };

    seed();
    draw(performance.now());
    restart();
    const resize = () => {
      seed();
      draw(performance.now());
    };
    document.fonts?.ready.then(() => {
      if (!disposed) resize();
    });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScrollStill, { passive: true });
    document.addEventListener("visibilitychange", restart);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScrollStill);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
