// The dimmed desktop behind the launcher: columns of windows that line up
// with the doors and the bar and leave a clear gap round them, bleeding off
// every edge. Where the screen is tall enough, the windows touching the
// bar's row above and below name the eight features in order; where it is
// not, the eight stand in two rows beneath it. The rest are pattern. Pure
// arithmetic from where the bar and the doors stand, seeded, so a frame
// always draws the same wall.

import { features, type Feature, type Kind } from "@/data/home";

export type Mark =
  | { kind: "l"; x: number; y: number; w: number }
  | { kind: "b"; x: number; y: number; w: number; h: number }
  | { kind: "r"; x: number };

export type Tile = {
  x: number;
  y: number;
  w: number;
  h: number;
  feature?: Feature;
  /** Runs off the top, so it says what it is at its foot. */
  low: boolean;
  wire: Mark[];
};

export type Frame = {
  width: number;
  height: number;
  /** The top and bottom of the row the bar and the doors stand in. */
  top: number;
  bottom: number;
  /** The left door's column, and its width (every door's). */
  left: number;
  door: number;
  /** The bar's column. */
  bar: number;
  barWidth: number;
  /** The right door's column. */
  right: number;
  /** Around: four above the bar's row and four below. Below: two rows of
      four beneath it, on a screen too short for around. */
  mode: "around" | "below";
};

/** How tall a row of named windows stands when the eight are below. */
export const namedHeight = 172;

const gap = 24;
const kinds: Kind[] = ["sidebar", "browser", "code", "calendar", "photos", "term"];

function random(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function wireframe(kind: Kind, w: number, h: number, r: () => number): Mark[] {
  const marks: Mark[] = [];
  const line = (x: number, y: number, width: number) => marks.push({ kind: "l", x, y, w: Math.max(16, width) });
  const block = (x: number, y: number, width: number, height: number) => marks.push({ kind: "b", x, y, w: width, h: height });
  if (kind === "sidebar") {
    const side = Math.round(w * 0.32);
    marks.push({ kind: "r", x: side });
    for (let y = 16; y < h - 10; y += 22) line(14, y, side * (0.4 + r() * 0.4));
    for (let y = 18; y < h - 10; y += 34) {
      line(side + 16, y, (w - side - 32) * (0.5 + r() * 0.4));
      line(side + 16, y + 12, (w - side - 32) * (0.3 + r() * 0.4));
    }
  } else if (kind === "calendar") {
    const column = (w - 16) / 5;
    for (let c = 0; c < 5; c++) {
      if (c) marks.push({ kind: "r", x: 8 + c * column });
      for (let y = 12; y < h - 30; ) {
        const height = 26 + Math.round(r() * 30);
        if (r() > 0.4) block(8 + c * column + 6, y, column - 12, height);
        y += height + 10;
      }
    }
  } else if (kind === "code") {
    let indent = 0;
    for (let y = 14; y < h - 8; y += 18) {
      indent = Math.max(0, Math.min(3, indent + (r() > 0.7 ? 1 : r() > 0.75 ? -1 : 0)));
      if (r() > 0.12) line(16 + indent * 18, y, (w - 60 - indent * 18) * (0.25 + r() * 0.6));
    }
  } else if (kind === "photos") {
    const side = (w - 16) / 3;
    for (let y = 4; y < h; y += side + 4) for (let c = 0; c < 3; c++) block(4 + c * (side + 4), y, side, side);
  } else if (kind === "browser") {
    block(14, 10, w - 28, 22);
    for (let y = 52; y < h - 10; y += 20) line(24, y, (w - 48) * (y % 3 ? 0.9 : 0.6) * (0.6 + r() * 0.4));
  } else {
    for (let y = 14; y < h - 8; y += 18) if (r() > 0.2) line(16, y, (w - 40) * (0.2 + r() * 0.5));
  }
  return marks;
}

export function tiles(frame: Frame): Tile[] {
  const r = random(7);
  const out: Tile[] = [];
  const over = () => 60 + Math.round(r() * 120);

  /** Windows down a column from y0 to y1, the last one taking what is left;
      the first `fixed` of them stand at the named height. */
  const column = (x: number, w: number, y0: number, y1: number, fixed = 0): Tile[] => {
    const made: Tile[] = [];
    if (y1 - y0 < 70) return made;
    for (let y = y0; y < y1; ) {
      let h = made.length < fixed ? namedHeight : 180 + Math.round(r() * 140);
      if (y1 - (y + h) < 150) h = y1 - y;
      const tile: Tile = { x, y, w, h, low: false, wire: [] };
      made.push(tile);
      out.push(tile);
      y += h + gap;
    }
    return made;
  };

  const half = Math.round(frame.barWidth / 2) - gap / 2;
  const bands: [number, number][] = [
    [frame.left, frame.door],
    [frame.bar, half],
    [frame.bar + half + gap, frame.barWidth - half - gap],
    [frame.right, frame.door],
  ];
  const slots: (Tile | undefined)[] = [];
  if (frame.mode === "around") {
    const below: (Tile | undefined)[] = [];
    for (const [x, w] of bands) {
      slots.push(column(x, w, -over(), frame.top - gap).at(-1));
      below.push(column(x, w, frame.bottom + gap, frame.height + over())[0]);
    }
    slots.push(...below);
  } else {
    const second: (Tile | undefined)[] = [];
    for (const [x, w] of bands) {
      const made = column(x, w, frame.bottom + gap, frame.height + over(), 2);
      slots.push(made[0]);
      second.push(made[1]);
    }
    slots.push(...second);
  }
  for (let x = frame.left - gap - frame.door; x + frame.door > -frame.door / 2; x -= frame.door + gap)
    column(x, frame.door, -over(), frame.height + over());
  for (let x = frame.right + frame.door + gap; x < frame.width + frame.door / 2; x += frame.door + gap)
    column(x, frame.door, -over(), frame.height + over());

  // The eight take the windows touching the bar's row, where each can be
  // read whole; a window too little of which shows stays pattern.
  const seen = (t: Tile) => Math.min(t.y + t.h, frame.height) - Math.max(t.y, 0) >= 112;
  slots.forEach((tile, i) => {
    if (tile && seen(tile) && features[i]) {
      tile.feature = features[i];
      tile.low = tile.y < 0;
    }
  });

  for (const tile of out) {
    const words = tile.feature ? 120 : 36;
    tile.wire = wireframe(tile.feature?.kind ?? kinds[Math.floor(r() * kinds.length)], tile.w, Math.max(0, tile.h - words), r);
  }
  return out;
}
