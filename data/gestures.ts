// Every gesture, grouped the way the guide groups them. Kept in step with
// GUIDE.md in the product repository; that table is the truth.
export type Gesture = { keys: string; meaning: string };
export type Group = { label: string; gestures: Gesture[] };

export const specification: Group[] = [
  {
    label: "Going places",
    gestures: [
      {
        keys: "lode space",
        meaning: "The launcher. Type, return, arrive maximized. Ranked by use.",
      },
      {
        keys: "lode A…Z",
        meaning: "The graph. A letter, or a short chain of them, to an app.",
      },
      {
        keys: "lode ⏎",
        meaning: "Ask. A name, a domain, or a search, in the right profile.",
      },
      {
        keys: "lode ⇥",
        meaning: "The window chooser for the app you are in.",
      },
      {
        keys: "lode 1…8 · 9",
        meaning: "A window by its position. 9 is always the last.",
      },
      {
        keys: "lode ' A…Z",
        meaning: "Breaths. A saved layout restored, apps relaunched if needed.",
      },
      {
        keys: "hold lode",
        meaning: "The map. Your letters, drawn while the key is held.",
      },
    ],
  },
  {
    label: "The layout",
    gestures: [
      {
        keys: "⇧ on a summon",
        meaning: "Beside. An equal split instead of maximized.",
      },
      {
        keys: "lode G B",
        meaning: "The chord. Letters under one hold arrange side by side.",
      },
      { keys: "lode \\", meaning: "Flip the split, horizontal to vertical." },
      {
        keys: "lode ' ⇧A",
        meaning: "Save the current layout at that letter.",
      },
      {
        keys: "lode ⇧1…9",
        meaning: "Slide the focused window to that position.",
      },
      {
        keys: "lode 0 · ⇧0",
        meaning: "The focused window fills the display. ⇧0 joins beside.",
      },
      {
        keys: "lode [ · ]",
        meaning: "The focused window to the previous or next display.",
      },
      { keys: "lode ← · →", meaning: "Undo and redo the layout." },
    ],
  },
  {
    label: "Inside the window",
    gestures: [
      {
        keys: "lode ;",
        meaning: "Hints. A letter on every button, link and field.",
      },
      {
        keys: "lode /",
        meaning: "Select. Type what you see, mark the start and the end.",
      },
      {
        keys: "lode `",
        meaning: "Scroll from the keyboard: j k, half pages, ends, panes.",
      },
      {
        keys: "lode -",
        meaning: "Commands. The app's whole menu bar, searched and run.",
      },
      {
        keys: "lode .",
        meaning: "The draft. Speak and type into one cursor, ⏎ pastes.",
      },
      {
        keys: "lode ⇧.",
        meaning: "The draft, editing the field's own text, silent.",
      },
    ],
  },
  {
    label: "Beside the keyboard",
    gestures: [
      {
        keys: "⇧⌘V",
        meaning: "The clipboard. Every clip in its place, a letter pastes.",
      },
      {
        keys: "⌘K in a list",
        meaning: "Add to the graph, save a link, route a host. Written to config.",
      },
      { keys: "lode ?", meaning: "The cheat sheet, generated from your config." },
      { keys: "lode ,", meaning: "Settings." },
      { keys: "esc", meaning: "Clear a chain, close a surface." },
    ],
  },
];
