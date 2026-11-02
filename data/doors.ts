// The four doors: what people come to Lodestar for, one page each. The
// homepage names them over their loops, the bar links them from every page,
// and each door page is built from its entry here.

export type Keys = string[];

export type Question = { q: string; a: string };

export type Door = {
  slug: "write" | "switch" | "keep" | "speak";
  name: string;
  /** What kind of tool it is, in a search's words: said beside the name
      above the headline, so the page says what it is before it says it
      well. No period. */
  kind: string;
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
  /** The page's title in search results and the tab, in the words a search
      is typed in. The headline keeps its own voice. */
  title: string;
  /** The guide pages that go deeper, the first one linked from the page. */
  guide: string[];
  /** What people ask before they download, each answered in its first
      sentence. The questions every door shares follow these. */
  questions: Question[];
};

/** Asked on every door, after its own. */
export const shared: Question[] = [
  {
    q: "What does it cost, and which Macs run it?",
    a: "Nothing. Lodestar is free, with no account and no subscription. It runs on macOS 27 or later on Apple silicon.",
  },
  {
    q: "Can I install it with Homebrew?",
    a: "Yes. Run brew install --cask vaccone-software/tap/lodestar, and Lodestar keeps itself up to date from then on.",
  },
];

export const doors: Door[] = [
  {
    slug: "write",
    title: "Free Grammar and Spell Checker for Mac",
    guide: ["write"],
    name: "Write",
    kind: "Grammar and spell checker",
    questions: [
      {
        q: "Does my writing leave my Mac?",
        a: "No. Every sentence is checked on your Mac and none of it is kept. Lodestar records only counts, such as how many marks you fixed in each app.",
      },
      {
        q: "Which apps does it work in?",
        a: "Mail, Slack, Notes, Messages and text fields on the web. Google Docs is not read yet, because it draws its own text and keeps it from other apps. Any app can be skipped in Settings.",
      },
      {
        q: "How is it different from Grammarly?",
        a: "It corrects spelling and grammar and stops there. It never rewrites a sentence or changes your tone, it needs no account, and your text is never sent to a server to be checked.",
      },
      {
        q: "Which English does it check?",
        a: "The one your Mac is set to. American, British, Canadian, Australian, New Zealand, Indian, South African and Singapore English are each held to their own spelling.",
      },
    ],
    what: "Checks your spelling and grammar as you type",
    h1: "Write without the typos",
    lede: "Spelling and grammar checked as you type, on your Mac",
    steps: [
      {
        title: "Write where you write",
        line: "Mail, Slack, Notes, Messages and fields on the web",
      },
      {
        title: "See the line",
        line: "Spelling as each word ends, grammar as each sentence does",
      },
      {
        title: "Put it right",
        line: "Rest the pointer on the line, or use the keys",
        keys: ["lode", "⇥", "!A"],
      },
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
      "A free spelling and grammar checker for Mac that works across your apps, checked on your Mac. A thin line under what reads wrong, fixed with a click or a key.",
  },
  {
    slug: "switch",
    title: "Keyboard App Switcher and Launcher for Mac",
    guide: ["application", "layout"],
    name: "Switch",
    kind: "App switcher and launcher",
    questions: [
      {
        q: "What is the lode key?",
        a: "Right ⌘, unless you choose left ⌘ in Settings. Hold it and press a letter, or tap it and press the letter within a second.",
      },
      {
        q: "How is it different from ⌘Tab?",
        a: "⌘Tab walks a list in the order you last used things, so the keys change with where you have been. A letter in Lodestar always means the same app, and it opens the app if it is closed.",
      },
      {
        q: "Does it work across displays and Spaces?",
        a: "Yes, and it leaves your Spaces alone. An app already showing on another display is focused where it is, and anything hidden or newly opened arrives on the display you are using.",
      },
      {
        q: "What permission does it need?",
        a: "Accessibility, which macOS asks for once. Turning it on in System Settings takes an administrator's password.",
      },
    ],
    what: "Switches to any app or window with one key and a letter",
    h1: "Get anywhere with a letter",
    lede: "Hold one key and press a letter, and the app you want comes to the front",
    steps: [
      {
        title: "Open anything",
        line: "Lode and space finds any app and opens it full screen",
        keys: ["lode", "space"],
      },
      {
        title: "Give it a letter",
        line: "Lodestar suggests letters for the apps you use most",
      },
      {
        title: "Press the letter",
        line: "The app comes forward, or opens if it is closed",
        keys: ["lode", "!M"],
      },
    ],
    never: [
      "Move a window you did not ask it to",
      "Touch your Spaces or system protections",
      "Need the mouse for any of it",
    ],
    detailTitle: "More, when you want it",
    detail: [
      {
        name: "Side by side",
        line: "Two letters in one hold",
        keys: ["lode", "G", "B"],
      },
      {
        name: "By position",
        line: "Every window has a number",
        keys: ["lode", "1…9"],
      },
      {
        name: "Layouts",
        line: "Save an arrangement, bring it back",
        keys: ["lode", "'", "W"],
      },
      { name: "The map", line: "Every letter you have", keys: ["lode", "?"] },
    ],
    description:
      "Switch to any app or window on your Mac with one key and a letter. A keyboard app switcher and launcher that opens apps full screen, with saved layouts.",
  },
  {
    slug: "keep",
    title: "Free Clipboard Manager and History for Mac",
    guide: ["clipboard"],
    name: "Keep",
    kind: "Clipboard history",
    questions: [
      {
        q: "Does it keep my passwords?",
        a: "No. Anything a password manager marks as concealed is never recorded, and you can exclude whole apps or any phrase.",
      },
      {
        q: "Where is my history kept, and how much?",
        a: "Only on your Mac, readable only by you and left out of backups. It keeps up to 500 MB by default and drops the oldest clips first. Pins are never dropped.",
      },
      {
        q: "What does it keep?",
        a: "Text, links, images and files. Images are read as they are kept, so a screenshot can be found by the words in it.",
      },
    ],
    what: "Keeps everything you copy, ready to find and paste again",
    h1: "Everything you copy, kept",
    lede: "Press ⇧⌘V for everything you copied, and a letter to paste it back",
    steps: [
      {
        title: "Copy as always",
        line: "Text, links, images and files are all kept",
        keys: ["⌘", "C"],
      },
      {
        title: "Open the strip",
        line: "Your recent copies, each with a letter",
        keys: ["⇧", "⌘", "V"],
      },
      {
        title: "Paste with a letter",
        line: "Or press slash and search by what it says",
        keys: ["!A", "then", "/"],
      },
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
    title: "On-Device Dictation and Speech to Text for Mac",
    guide: ["say"],
    name: "Speak",
    kind: "Dictation",
    questions: [
      {
        q: "Is my voice sent anywhere?",
        a: "No. Speech is turned into text on your Mac and the audio is not kept. Any model it needs downloads once, the first time you dictate.",
      },
      {
        q: "How is it different from Apple Dictation?",
        a: "Your words land in a draft first, where you can type, fix and move around before anything reaches your app. A second model hears it again and takes out the words you took back.",
      },
      {
        q: "Which speech model does it use?",
        a: "The one your Mac suits, chosen for you. Apple's recognizer runs on any Mac, Parakeet on 16 GB of memory, and Qwen3-ASR on 24 GB and up.",
      },
      {
        q: "Which microphone does it listen to?",
        a: "Your Mac's default input, or any microphone you name in Settings. A headset that goes silent is retried.",
      },
    ],
    what: "Turns what you say into text you can edit, then drops it in place",
    h1: "Say it, then shape it",
    lede: "Talk and type into one draft, and it lands where you were writing",
    steps: [
      {
        title: "Open the draft",
        line: "A soft note says it is listening",
        keys: ["lode", "."],
      },
      {
        title: "Talk, and type too",
        line: "Words arrive grey, then settle as they are understood",
      },
      {
        title: "Send it",
        line: "It lands where your cursor was, with a second note",
        keys: ["!⏎"],
      },
    ],
    never: [
      "Keep your audio",
      "Send your voice anywhere to be turned into text",
      "Type into your app before you press return",
    ],
    detailTitle: "Edit without the mouse",
    detail: [
      { name: "Edit", line: "Stop typing, start moving", keys: ["esc"] },
      { name: "Find", line: "Jump to a letter", keys: ["⇧F", "b"] },
      {
        name: "Change",
        line: "Replace a word, keep talking",
        keys: ["c", "w"],
      },
      { name: "Send", line: "From anywhere in the draft", keys: ["⏎"] },
    ],
    description:
      "Dictation for Mac that you can edit before it lands: talk and type into one draft, turned into text on your Mac, and placed where your cursor was.",
  },
];
