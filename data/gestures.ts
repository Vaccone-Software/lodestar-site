export type Gesture = { keys: string; meaning: string };
export type Group = { label: string; gestures: Gesture[] };

export const specification: Group[] = [
  {
    label: "Going places",
    gestures: [
      {
        keys: "lode space",
        meaning:
          "The searcher. Type, land full screen. Ranks by what you actually use.",
      },
      {
        keys: "lode A…Z",
        meaning:
          "Graph chains. Letters you chose, walked to any app or browser profile.",
      },
      {
        keys: "lode ⇥",
        meaning: "Window chooser for the focused app, most recent first.",
      },
      {
        keys: "lode ⏎",
        meaning:
          "The web bar. Links, domains, and searches, each routed to the right profile.",
      },
      {
        keys: "lode 1…9",
        meaning: "Jump to a window by its position. 9 is always the last.",
      },
      {
        keys: "lode X · ⇧X",
        meaning: "Back and forward through the attention timeline.",
      },
    ],
  },
  {
    label: "The layout",
    gestures: [
      {
        keys: "⇧ on a summon",
        meaning: "Beside me. An equal split instead of full screen.",
      },
      { keys: "lode O", meaning: "Flip the split, horizontal to vertical." },
      {
        keys: "lode ⇧1…9",
        meaning: "Slide the focused window to that position.",
      },
      {
        keys: "lode [ · ]",
        meaning: "Throw the focused window to the previous or next display.",
      },
      {
        keys: "lode Z · ⇧Z",
        meaning: "Undo and redo the layout, one global timeline.",
      },
      {
        keys: "lode 0 · ⇧0",
        meaning:
          "The focused window fills the display and joins the layout. ⇧0 puts it beside instead.",
      },
    ],
  },
  {
    label: "Inside the app",
    gestures: [
      {
        keys: "lode ,",
        meaning:
          "Scroll mode. j k for lines, d u for half pages, gg and ⇧G for the ends.",
      },
      {
        keys: "lode .",
        meaning: "Menu search. The frontmost app's entire menu bar, fuzzy.",
      },
      {
        keys: "lode ;",
        meaning:
          "Click hints. Every pressable element wears a label. Type it to click.",
      },
      {
        keys: "lode ⇧;",
        meaning: "Chain clicks. Each click relabels the window. esc leaves.",
      },
    ],
  },
  {
    label: "What you copied",
    gestures: [
      {
        keys: "⇧⌘V",
        meaning:
          "The clipboard. Recent clips run along the bottom under the home row, five pinned slots climb the left.",
      },
      {
        keys: "a…l · ⇧a…l",
        meaning:
          "Paste that card. With ⇧ it pastes exactly as it was copied, formatting and all.",
      },
      {
        keys: "1…5",
        meaning:
          "The pins. A slot means the same thing next week as it does today, so the paste needs no looking.",
      },
      {
        keys: "⌘ on a card",
        meaning:
          "Its actions. Pin it, delete it, save an image, or never save from that app again.",
      },
      {
        keys: "/",
        meaning: "Search the history. Matches stay under the same letters.",
      },
    ],
  },
  {
    label: "Saved worlds",
    gestures: [
      {
        keys: "lode ' A…Z",
        meaning:
          "Breaths. Whole saved layouts, restored across restarts. Apps relaunch.",
      },
      {
        keys: "lode ' '",
        meaning: "Update the latest breath to the current world.",
      },
    ],
  },
  {
    label: "The system teaches itself",
    gestures: [
      {
        keys: "hold lode",
        meaning:
          "Peek the map. The graph and every window's index, while held.",
      },
      {
        keys: "lode ?",
        meaning:
          "The cheat sheet. Every gesture and your live bindings, one sheet.",
      },
      { keys: "esc", meaning: "Clear anything." },
    ],
  },
];
