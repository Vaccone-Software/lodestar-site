// The room's arithmetic: the accent rules, the mark's geometry and the
// layout. Pure functions, so no browser and no build.

import { describe, expect, test } from "bun:test";
import { orange, parseHex, presets, toHex, wear } from "@/lib/room/accent";
import { arrange } from "@/lib/room/layout";
import { faces, lit, standing } from "@/lib/room/mark";

describe("the accent", () => {
  test("International Orange leads the Mac's presets", () => {
    expect(presets[0].hex).toBe(orange);
    expect(presets).toHaveLength(9);
  });

  test("hex survives a round trip", () => {
    for (const { hex } of presets) expect(toHex(parseHex(hex))).toBe(hex);
  });

  test("orange is deepened on clay and true on night, as the app draws it", () => {
    expect(wear(orange, false).ui).toBe("#c43b00");
    expect(wear(orange, true).ui).toBe("#ff4f00");
  });

  test("ink over a fill is whichever of white and near-black contrasts more", () => {
    expect(wear("#a550a7", true).on).toBe("#fff");
    expect(wear("#ffc600", true).on).toBe("#141414");
    // White fails on International Orange only on the true colour.
    expect(wear(orange, true).on).toBe("#141414");
  });
});

describe("the mark", () => {
  test("shows the faces turned toward you, none of them hidden behind another", () => {
    const seen = faces(0.6, [0, 0]);
    expect(seen.length).toBeGreaterThan(20);
    expect(seen.length).toBeLessThan(60);
    for (const face of seen) expect(face.normal[2]).toBeGreaterThan(0);
  });

  test("a download lights the faces in order, none, some, then all", () => {
    const seen = faces(0.6, [0, 0]);
    expect(lit(seen, 0).size).toBe(0);
    expect(lit(seen, 0.5).size).toBe(Math.floor(seen.length / 2));
    expect(lit(seen, 1).size).toBe(seen.length);
    expect(standing).toBeLessThan(0);
  });
});

describe("the layout", () => {
  for (const [width, height] of [
    [1440, 900],
    [1280, 720],
    [768, 1024],
    [390, 844],
  ]) {
    test(`at ${width} by ${height} every door stands inside the room`, () => {
      const room = arrange(width, 120, height - 190);
      for (const door of Object.values(room.doors)) {
        expect(door.x - room.picture / 2).toBeGreaterThanOrEqual(0);
        expect(door.x + room.picture / 2).toBeLessThanOrEqual(width);
        expect(door.y).toBeGreaterThanOrEqual(0);
      }
      expect(room.phone).toBe(width < 760);
      expect(room.ring === null).toBe(room.phone);
    });
  }
});
