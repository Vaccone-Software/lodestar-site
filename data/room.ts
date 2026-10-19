// What the homepage says, in Lodestar's voice. The four lines under the
// doors are the app's own (Walk's welcome draws the same four), and each
// door's panel says what the app does and nothing it does not: the demos in
// components/room/Demos.tsx were checked against DESIGN.md and the source.
// "You", never "I" or "we"; sentence case; no full stop on a title.

import type { Slug } from "@/lib/room/layout";

export const headline = "Everything one key away";
export const subline = "Write, switch, keep and speak, anywhere on your Mac";
export const facts =
  "Free · macOS 27 or later · Apple silicon · your clipboard history and health record are encrypted on this Mac";

/** One thing the foot of a panel shows: a key, or the word between keys. */
export type Foot = { key: string; lit?: boolean } | { word: string };

export type Chapter = {
  /** The app's line for the door, under its picture. */
  line: string;
  /** What the panel says, then how. */
  say: string;
  body: string;
  foot: Foot[];
};

export const chapters: Record<Slug, Chapter> = {
  write: {
    line: "Checks your spelling and grammar as you type",
    say: "A thin line under a word, in any app, and a letter puts it right",
    body: "Mail, Slack, Notes and the web. Nothing you write leaves your Mac, and no line means what you wrote reads clean.",
    foot: [{ key: "lode", lit: true }, { key: "⇥" }, { key: "A" }],
  },
  switch: {
    line: "Any app or window, with one key and a letter",
    say: "Every app and window, a letter or two away",
    body: "Give each app a letter of your choosing. Hold lode and press it, and the app comes forward, or opens.",
    foot: [{ key: "lode", lit: true }, { word: "and your letter" }],
  },
  keep: {
    line: "Everything you copy, ready to paste again",
    say: "Everything you copy is kept, ready to paste again",
    body: "Text, links, images and files. Open the strip and every recent copy wears a letter; press it and it pastes where you were.",
    foot: [{ key: "⇧" }, { key: "⌘" }, { key: "V" }],
  },
  speak: {
    line: "Say it, shape it, and it lands where you were",
    say: "Say it, shape it, and it lands where you were",
    body: "Talk and type into one draft. Words arrive grey while they are heard, then settle, and nothing lands until you press return.",
    foot: [{ key: "lode", lit: true }, { key: "." }],
  },
};

/** Health is not a door; it speaks once, as it does on your Mac, where the
    walk comes after thirty minutes without a break. */
export const health = {
  after: 45_000,
  title: "Forty five seconds without a break",
  line: "On your Mac it waits thirty minutes, then asks you to walk for two",
};

/** The download's own notice, when the key is pressed. */
export const downloading = {
  title: "Lodestar is on its way",
  line: "Open it from your Downloads, and it asks for the one thing it needs",
};
