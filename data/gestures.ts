export type Gesture = { keys: string; meaning: string };
export type Group = { label: string; gestures: Gesture[] };

export const specification: Group[] = [
  {
    label: "Going places",
    gestures: [
      {
        keys: "hyper space",
        meaning:
          "The searcher. Type, land full screen. Ranks by what you actually use.",
      },
      {
        keys: "hyper A…Z",
        meaning:
          "Graph chains. Letters you chose, walked to any app or browser profile.",
      },
      {
        keys: "hyper ⇥",
        meaning: "Window chooser for the focused app, most recent first.",
      },
      {
        keys: "hyper ⏎",
        meaning:
          "The web bar. Links, domains, and searches, each routed to the right profile.",
      },
      {
        keys: "hyper 1…9",
        meaning: "Jump to a window by its position. 9 is always the last.",
      },
      {
        keys: "hyper X · ⇧X",
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
      { keys: "hyper O", meaning: "Flip the split, horizontal to vertical." },
      {
        keys: "hyper ⇧1…9",
        meaning: "Slide the focused window to that position.",
      },
      {
        keys: "hyper [ · ]",
        meaning: "Throw the focused window to the previous or next display.",
      },
      {
        keys: "hyper Z · ⇧Z",
        meaning: "Undo and redo the layout, one global timeline.",
      },
      {
        keys: "hyper 0",
        meaning: "Sweep every background window out of sight. Never dialogs.",
      },
    ],
  },
  {
    label: "Inside the app",
    gestures: [
      {
        keys: "hyper ,",
        meaning:
          "Scroll mode. j k for lines, d u for half pages, gg and ⇧G for the ends.",
      },
      {
        keys: "hyper .",
        meaning: "Menu search. The frontmost app's entire menu bar, fuzzy.",
      },
      {
        keys: "hyper ;",
        meaning:
          "Click hints. Every pressable element wears a label. Type it to click.",
      },
      {
        keys: "hyper ⇧;",
        meaning: "Chain clicks. Each click relabels the window. esc leaves.",
      },
    ],
  },
  {
    label: "Saved worlds",
    gestures: [
      {
        keys: "hyper ` A…Z",
        meaning: "Marks. Letter addresses for specific windows, bound with ⇧.",
      },
      {
        keys: "hyper ' A…Z",
        meaning:
          "Breaths. Whole saved layouts, restored across restarts. Apps relaunch.",
      },
      {
        keys: "hyper ' '",
        meaning: "Update the latest breath to the current world.",
      },
    ],
  },
  {
    label: "The system teaches itself",
    gestures: [
      {
        keys: "hold hyper",
        meaning:
          "Peek the map. The graph and every window's index, while held.",
      },
      {
        keys: "hyper ?",
        meaning:
          "The cheat sheet. Every gesture and your live bindings, one sheet.",
      },
      { keys: "esc", meaning: "Clear anything." },
    ],
  },
];
