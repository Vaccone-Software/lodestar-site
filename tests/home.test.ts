// The homepage's arithmetic and words: the mark's geometry, the wall round
// the launcher, the eight features in the copy voice, and keys drawn as
// typed. Pure functions, so no browser and no build.

import { describe, expect, test } from "bun:test";
import { band, legend } from "@/components/Key";
import { tiles, type Frame } from "@/components/home/wall";
import { features, headline, subline } from "@/data/home";
import { faces, parseHex, toHex } from "@/lib/mark";

describe("the mark", () => {
  test("shows the faces turned toward you, none of them hidden behind another", () => {
    const seen = faces(0.6, [0, 0]);
    expect(seen.length).toBeGreaterThan(20);
    expect(seen.length).toBeLessThan(60);
    for (const face of seen) expect(face.normal[2]).toBeGreaterThan(0);
  });

  test("its orange survives a round trip through hex", () => {
    expect(toHex(parseHex("#fa5617"))).toBe("#fa5617");
  });
});

// The frames the launcher and the doors make, as the page lays them: a
// 1920 by 1080 window has room for the eight round the bar's row; a 1440 by
// 900 one is too short, and they stand in two rows beneath it.
const around: Frame = {
  width: 1920,
  height: 992,
  top: 181,
  bottom: 811,
  left: 286,
  door: 300,
  bar: 610,
  barWidth: 700,
  right: 1334,
  mode: "around",
};
const below: Frame = {
  width: 1440,
  height: 1118,
  top: 32,
  bottom: 662,
  left: 46,
  door: 300,
  bar: 370,
  barWidth: 700,
  right: 1094,
  mode: "below",
};

for (const frame of [around, below]) {
  describe(`the wall, ${frame.mode} the bar`, () => {
    const wall = tiles(frame);

    test("names each of the eight once, in order", () => {
      const named = wall.filter((t) => t.feature);
      const order = frame.mode === "around" ? named : [...named].sort((p, q) => p.y - q.y || p.x - q.x);
      expect(order.map((t) => t.feature!.id).sort()).toEqual(features.map((f) => f.id).sort());
      expect(named).toHaveLength(8);
    });

    test("keeps a clear gap round the launcher and the doors", () => {
      const row = { x0: frame.left, x1: frame.right + frame.door, y0: frame.top, y1: frame.bottom };
      for (const t of wall) {
        const across = t.x < row.x1 + 24 && t.x + t.w > row.x0 - 24;
        const down = t.y < row.y1 + 24 && t.y + t.h > row.y0 - 24;
        expect(across && down).toBe(false);
      }
    });

    test("a named window shows enough of itself to be read", () => {
      for (const t of wall.filter((t) => t.feature)) {
        expect(Math.min(t.y + t.h, frame.height) - Math.max(t.y, 0)).toBeGreaterThanOrEqual(112);
      }
    });

    test("draws the same wall for the same frame", () => {
      expect(JSON.stringify(tiles(frame))).toBe(JSON.stringify(wall));
    });
  });
}

describe("the words", () => {
  // The copy voice: a name or a line on a surface ends without a period and
  // carries no dash or semicolon.
  test("every line keeps the voice", () => {
    for (const line of [headline, subline, ...features.flatMap((f) => [f.name, f.line])]) {
      expect(line).not.toMatch(/\.$/);
      expect(line).not.toMatch(/[—–;]/);
    }
  });

  test("the eight are eight, each with a guide page", () => {
    expect(features).toHaveLength(8);
    expect(new Set(features.map((f) => f.id)).size).toBe(8);
    for (const f of features) expect(f.guide).toMatch(/^[a-z]+$/);
  });
});

describe("a key", () => {
  test("a bare keystroke is drawn as typed, a chord keeps its capital", () => {
    expect(legend("M")).toBe("m");
    expect(legend("⇧W")).toBe("⇧W");
    expect(legend("⌘K")).toBe("⌘K");
    expect(legend("lode")).toBe("lode");
  });

  test("a legend stands on its band", () => {
    expect(band("lode")).toBe("x");
    expect(band("a")).toBe("x");
    expect(band("⇧⌘V")).toBe("");
    expect(band("'")).toBe("punct");
    expect(band("`")).toBe("punct");
  });
});
