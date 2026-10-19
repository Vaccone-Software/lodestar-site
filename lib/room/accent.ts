// The room's colour: the Mac's accent presets and the rules the app derives
// everything else from, so a pick is one hex and the rest is arithmetic.
// Safe in the browser and on the server; only macAccent() reads the page.

export type Rgb = readonly [number, number, number];

export type Preset = { name: string; hex: string };

/** The Mac's own accents, International Orange first: Lodestar's, and the
    one the room wears when the Mac does not say. */
export const presets: readonly Preset[] = [
  { name: "International Orange", hex: "#ff4f00" },
  { name: "Blue", hex: "#007aff" },
  { name: "Purple", hex: "#a550a7" },
  { name: "Pink", hex: "#f74f9e" },
  { name: "Red", hex: "#ff5257" },
  { name: "Orange", hex: "#f7821b" },
  { name: "Yellow", hex: "#ffc600" },
  { name: "Green", hex: "#62ba46" },
  { name: "Graphite", hex: "#8c8c8c" },
];

export const orange = presets[0].hex;

export function parseHex(hex: string): Rgb {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return [r, g, b];
}

export function toHex(color: Rgb): string {
  return (
    "#" +
    color
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function luminance(color: Rgb): number {
  const [r, g, b] = color.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: Rgb, b: Rgb): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (light + 0.05) / (dark + 0.05);
}

const white: Rgb = [255, 255, 255];
const black: Rgb = [0, 0, 0];
const ink: Rgb = [20, 20, 20];

/** The deeper orange the app draws on clay, where the true colour sits
    under the cursor floor. */
const clayOrange = "#c43b00";

/** What a pick becomes on the page: the colour as the interface draws it,
    the ink over it as a fill, and the keycap's lit top and shadowed lip. */
export type Accent = { ui: string; on: string; top: string; lip: string };

export function wear(hex: string, night: boolean): Accent {
  const ui = parseHex(hex === orange && !night ? clayOrange : hex);
  return {
    ui: toHex(ui),
    // White or near-black, whichever contrasts more with the fill itself:
    // white fails on International Orange, so no second colour is stored.
    on: contrast(ui, white) >= contrast(ui, ink) ? "#fff" : "#141414",
    top: toHex(mix(ui, white, 0.4)),
    lip: toHex(mix(ui, black, 0.44)),
  };
}

/** What a browser answers when it only knows its own default and has not
    read the Mac. */
const browserDefaults = ["0,117,255", "0,96,223", "0,0,0"];

/** The preset nearest a colour, among those the Mac offers, if any is near. */
function nearest(color: Rgb): string | null {
  let best: string | null = null;
  let reach = 70;
  for (const { hex } of presets.slice(1)) {
    const p = parseHex(hex);
    const d = Math.hypot(p[0] - color[0], p[1] - color[1], p[2] - color[2]);
    if (d < reach) {
      reach = d;
      best = hex;
    }
  }
  return best;
}

/** The Mac's own accent, where the browser will say it, snapped to the
    nearest preset; otherwise null, and the room is International Orange. */
export function macAccent(): string | null {
  for (const word of ["-apple-system-control-accent", "AccentColor"]) {
    try {
      if (!CSS.supports("color", word)) continue;
      const probe = document.createElement("i");
      probe.style.color = word;
      document.body.append(probe);
      const found = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g);
      probe.remove();
      if (!found) continue;
      const [r, g, b] = found.slice(0, 3).map(Number);
      const color: Rgb = [r, g, b];
      if (browserDefaults.includes(color.join(","))) continue;
      const preset = nearest(color);
      if (preset) return preset;
    } catch {}
  }
  return null;
}
