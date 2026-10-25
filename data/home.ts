// What the homepage says, in Lodestar's voice: the line, the facts under the
// download, and the eight things Lodestar does beyond the four doors, which
// stand on the wall around the launcher. Sentence case, no full stop on a
// line, no dash or semicolon.

export const headline = "Everything one key away";
export const subline = "Write, switch, keep and speak, anywhere on your Mac";
export const facts = "Free · macOS 27 or later · Apple silicon";

/** The wireframe a wall window draws beneath its words. */
export type Kind = "sidebar" | "browser" | "code" | "calendar" | "photos" | "term";

export type Feature = {
  id: string;
  name: string;
  line: string;
  /** The gesture, as typed; "×2" is a double tap of the key before it. */
  keys?: string[];
  /** A second gesture, where the feature has two. */
  also?: string[];
  /** The guide page that explains it. */
  guide: string;
  /** Words it is found by in the launcher, beyond its name. */
  alias: string[];
  kind: Kind;
};

/** In wall order: the row above the launcher, then the row below, each left
    to right. */
export const features: Feature[] = [
  {
    id: "breaths",
    name: "Breaths",
    line: "Save the windows you have open and bring them back with a letter",
    keys: ["lode", "'", "w"],
    guide: "layout",
    alias: ["layout", "layouts", "windows", "save"],
    kind: "sidebar",
  },
  {
    id: "menus",
    name: "Menu commands",
    line: "Run anything in the menu bar by typing part of its name",
    keys: ["lode", "-"],
    guide: "button",
    alias: ["menu", "menus", "commands", "command"],
    kind: "code",
  },
  {
    id: "browser",
    name: "The browser",
    line: "Open a site, a search or a saved link in the right profile",
    keys: ["lode", "⏎"],
    guide: "page",
    alias: ["web", "site", "search", "profile", "ask", "links"],
    kind: "browser",
  },
  {
    id: "click",
    name: "Click and scroll",
    line: "Press any button by its letter and scroll without the mouse",
    keys: ["lode", ";"],
    also: ["lode", "`"],
    guide: "button",
    alias: ["click", "scroll", "buttons", "mouse", "links"],
    kind: "browser",
  },
  {
    id: "select",
    name: "Select text",
    line: "Highlight any text on screen by typing a few letters of it",
    keys: ["lode", "/"],
    guide: "text",
    alias: ["text", "highlight", "copy"],
    kind: "term",
  },
  {
    id: "meetings",
    name: "Meetings",
    line: "A chip appears before each call, and a double tap joins it",
    keys: ["lode", "×2"],
    guide: "coach",
    alias: ["calendar", "zoom", "call", "join"],
    kind: "calendar",
  },
  {
    id: "coach",
    name: "The coach",
    line: "Notices what you do the long way and offers a shortcut",
    keys: ["lode", "×2"],
    guide: "coach",
    alias: ["shortcuts", "learn", "suggest"],
    kind: "term",
  },
  {
    id: "health",
    name: "Health record",
    line: "Track your progress and get a clearer view of your own metrics",
    guide: "coach",
    alias: ["health", "progress", "metrics", "data", "insight"],
    kind: "photos",
  },
];
