// The four doors: what people come to Lodestar for, one page each. The
// homepage names them over their loops, the bar links them from every page,
// and each door page is built from its entry here.

export type Keys = string[];

export type Door = {
  slug: "write" | "switch" | "keep" | "speak";
  name: string;
  /** The homepage's line under the name. One sentence, no period. */
  what: string;
  h1: string;
  /** The door page's line under the headline. One sentence, no period. */
  lede: string;
  steps: { title: string; line: string; keys?: Keys }[];
  never: string[];
  detailTitle: string;
  detail: { name: string; line: string; keys?: Keys }[];
  /** For search engines: the words the page is found by. */
  description: string;
};

export const doors: Door[] = [
  {
    slug: "write",
    name: "Write",
    what: "Checks your spelling and grammar as you type, in every app",
    h1: "Write without the typos",
    lede: "Spelling and grammar checked as you type, in every app, on your Mac",
    steps: [
      { title: "Write anywhere", line: "Mail, Slack, a browser, any app you type in" },
      { title: "See the line", line: "Spelling as each word ends, grammar as each sentence does" },
      { title: "Put it right", line: "Rest the pointer on the line, or use the keys", keys: ["lode", "⇥", "!A"] },
    ],
    never: [
      "Rewrite your sentences or change your tone",
      "Mark code, file paths or the names you use",
      "Read a password field",
      "Send your writing anywhere to be checked",
    ],
    detailTitle: "How closely it reads",
    detail: [
      { name: "Spelling", line: "Instant, on any Mac" },
      { name: "Minimal", line: "Apple’s model, with Apple Intelligence" },
      { name: "Standard", line: "A 3.6 GB model, for 16 GB of memory" },
      { name: "Full", line: "The most precise, for 64 GB of memory" },
    ],
    description:
      "A free spelling and grammar checker for Mac that works in every app, checked on your Mac. A thin line under what reads wrong, fixed with a click or a key.",
  },
  {
    slug: "switch",
    name: "Switch",
    what: "Switches to any app or window with one key and a letter",
    h1: "Get anywhere with a letter",
    lede: "Hold one key and press a letter, and the app you want comes to the front",
    steps: [
      { title: "Open anything", line: "Lode and space finds any app and opens it full screen", keys: ["lode", "space"] },
      { title: "Give it a letter", line: "Lodestar suggests letters for the apps you use most" },
      { title: "Press the letter", line: "The app comes forward, or opens if it is closed", keys: ["lode", "!M"] },
    ],
    never: [
      "Move a window you did not ask it to",
      "Touch your Spaces or system protections",
      "Need the mouse for any of it",
    ],
    detailTitle: "More, when you want it",
    detail: [
      { name: "Side by side", line: "Two letters in one hold", keys: ["lode", "G", "B"] },
      { name: "By position", line: "Every window has a number", keys: ["lode", "1…9"] },
      { name: "Layouts", line: "Save an arrangement, bring it back", keys: ["lode", "'", "W"] },
      { name: "The map", line: "Every letter you have", keys: ["lode", "?"] },
    ],
    description:
      "Switch to any app or window on your Mac with one key and a letter. A keyboard app switcher and launcher that opens apps full screen, with saved layouts.",
  },
  {
    slug: "keep",
    name: "Keep",
    what: "Keeps everything you copy, ready to find and paste again",
    h1: "Everything you copy, kept",
    lede: "Press ⇧⌘V for everything you copied, and a letter to paste it back",
    steps: [
      { title: "Copy as always", line: "Text, links, images and files are all kept", keys: ["⌘", "C"] },
      { title: "Open the strip", line: "Your recent copies, each with a letter", keys: ["⇧", "⌘", "V"] },
      { title: "Paste with a letter", line: "Or press slash and search by what it says", keys: ["!A", "then", "/"] },
    ],
    never: [
      "Keep what a password manager marks as secret",
      "Store your history anywhere but this Mac",
      "Reorder your list when you paste",
    ],
    detailTitle: "It reads what it keeps",
    detail: [
      { name: "Times", line: "A timestamp reads as six hours ago" },
      { name: "Colors", line: "#FF4F00 arrives as International Orange" },
      { name: "Units", line: "12 ft arrives with 3.66 m" },
      { name: "Sums", line: "Arithmetic arrives with its answer" },
    ],
    description:
      "Clipboard history for Mac: everything you copy is kept on your Mac, pasted back with a letter, and found by what it says.",
  },
  {
    slug: "speak",
    name: "Speak",
    what: "Turns what you say into text you can edit, then drops it in place",
    h1: "Say it, then shape it",
    lede: "Talk and type into one draft, and it lands where you were writing",
    steps: [
      { title: "Open the draft", line: "A soft note says it is listening", keys: ["lode", "."] },
      { title: "Talk, and type too", line: "Words arrive grey, then settle as they are understood" },
      { title: "Send it", line: "It lands where your cursor was, with a second note", keys: ["!⏎"] },
    ],
    never: [
      "Keep your audio",
      "Send your voice anywhere to be turned into text",
      "Type into your app before you press return",
    ],
    detailTitle: "Edit without the mouse",
    detail: [
      { name: "Edit", line: "Stop typing, start moving", keys: ["esc"] },
      { name: "Find", line: "Jump to a letter", keys: ["F", "b"] },
      { name: "Change", line: "Replace a word, keep talking", keys: ["c", "w"] },
      { name: "Send", line: "From anywhere in the draft", keys: ["⏎"] },
    ],
    description:
      "Dictation for Mac that you can edit before it lands: talk and type into one draft, turned into text on your Mac, and placed where your cursor was.",
  },
];
