// The apps people search for Lodestar instead of, one page each under
// /vs. Every fact about the other app is read from its own pages, listed
// in `sources`, and dated in `checked`; a fact that could not be confirmed
// is left out rather than guessed. Each page says what the other app does
// better, because a comparison that only flatters is one nobody trusts.

export type Rival = {
  slug: string;
  name: string;
  door: "write" | "switch" | "keep" | "speak";
  /** The title in search results, in the words a search is typed in. */
  title: string;
  /** At most 160 characters, so it is never cut. */
  description: string;
  h1: string;
  /** The answer, in its first sentence, then the honest difference. */
  answer: string;
  rows: { fact: string; lodestar: string; rival: string }[];
  theirs: string[];
  ours: string[];
  checked: string;
  sources: string[];
};

const checked = "on 2 November 2026";
const macs = "macOS 27 or later, Apple silicon";

export const rivals: Rival[] = [
  {
    slug: "grammarly",
    name: "Grammarly",
    door: "write",
    title: "Grammarly Alternative for Mac: Free and On-Device",
    description:
      "Lodestar is a free Grammarly alternative for Mac: spelling and grammar checked as you type, on your Mac, with no account and nothing sent to a server.",
    h1: "A Grammarly alternative that stays on your Mac",
    answer:
      "Lodestar checks spelling and grammar as you type in your Mac apps, for free, on your Mac and with no account. Grammarly checks your writing on its servers and needs an account, and in return it does more: it rewrites sentences and drafts with generative AI. If you want corrections and nothing else, Lodestar is the lighter choice.",
    rows: [
      {
        fact: "Price",
        lodestar: "Free",
        rival:
          "Free plan with 100 AI prompts a month. Pro is $12 a month billed yearly, or $30 billed monthly",
      },
      { fact: "Account", lodestar: "None", rival: "Required" },
      {
        fact: "Where your text is checked",
        lodestar: "On your Mac, and never kept",
        rival: "On Grammarly's servers",
      },
      {
        fact: "Without internet",
        lodestar:
          "Works, once its model has downloaded. Spelling needs no download",
        rival: "Does not work",
      },
      {
        fact: "Rewriting and tone",
        lodestar: "Never. Spelling and grammar only",
        rival: "Yes, with generative AI",
      },
      {
        fact: "Macs",
        lodestar: macs,
        rival: "macOS 11 or later, Apple silicon or an Intel Mac from 2018 on",
      },
      {
        fact: "Source code",
        lodestar: "Public, under the Functional Source License",
        rival: "Closed",
      },
    ],
    theirs: [
      "You want sentences rewritten, or drafts written for you",
      "You write mostly in Google Docs, which Lodestar does not read yet",
      "You use an Intel Mac, or a Mac older than macOS 27",
    ],
    ours: [
      "You want your writing checked without it leaving your Mac",
      "You want corrections and nothing else, with no account and nothing to pay",
      "You want it to work on a plane",
      "You also want app switching, clipboard history and dictation in the same app",
    ],
    checked,
    sources: [
      "https://www.grammarly.com/plans",
      "https://support.grammarly.com/hc/en-us/articles/115000091011",
      "https://support.grammarly.com/hc/en-us/articles/4412835748877",
      "https://support.grammarly.com/hc/en-us/articles/7144088232717",
    ],
  },
  {
    slug: "maccy",
    name: "Maccy",
    door: "keep",
    title: "Maccy Alternative: Free Clipboard History for Mac",
    description:
      "Lodestar is a free Maccy alternative: clipboard history kept on your Mac, pasted back with one letter, with screenshots found by the words in them.",
    h1: "A Maccy alternative that pastes with a letter",
    answer:
      "Both keep your clipboard history on your Mac for free. Maccy is a small open source app that does only that, and it runs on Macs as old as macOS 14. Lodestar pastes a recent clip with one letter, reads copied images so a screenshot can be found by its words, and comes with grammar, app switching and dictation.",
    rows: [
      {
        fact: "Price",
        lodestar: "Free",
        rival: "Free from its site, or $9.99 on the Mac App Store",
      },
      {
        fact: "Where history is kept",
        lodestar: "On your Mac, encrypted and left out of backups",
        rival: "On your Mac",
      },
      {
        fact: "Passwords",
        lodestar: "What a password manager marks concealed is never recorded",
        rival: "Can ignore the types a password manager marks",
      },
      {
        fact: "Pasting",
        lodestar: "⇧⌘V, then the clip's letter",
        rival: "Open the list, then choose",
      },
      { fact: "Macs", lodestar: macs, rival: "macOS 14 or later" },
      {
        fact: "Source code",
        lodestar: "Public, under the Functional Source License",
        rival: "Open source, under MIT",
      },
    ],
    theirs: [
      "You want a clipboard manager and nothing else",
      "You want it open source under MIT",
      "You use a Mac older than macOS 27",
    ],
    ours: [
      "You want to paste a recent clip with one letter",
      "You want screenshots found by the words in them",
      "You want your history encrypted and kept out of backups",
      "You also want grammar, app switching and dictation in the same app",
    ],
    checked,
    sources: [
      "https://maccy.app",
      "https://github.com/p0deje/Maccy",
      "https://apps.apple.com/us/app/maccy/id1527619437",
    ],
  },
  {
    slug: "wispr-flow",
    name: "Wispr Flow",
    door: "speak",
    title: "Wispr Flow Alternative: Free On-Device Dictation for Mac",
    description:
      "Lodestar is a free Wispr Flow alternative: speech turned into text on your Mac, with no account and no word limit, edited in a draft before it lands.",
    h1: "A Wispr Flow alternative that runs on your Mac",
    answer:
      "Lodestar turns speech into text on your Mac, for free, with no account and no word limit. Wispr Flow turns it into text in its cloud and needs an account, and its free plan caps the words in a week. In return, Flow also runs on Windows and on phones.",
    rows: [
      {
        fact: "Price",
        lodestar: "Free, with no word limit",
        rival:
          "Free with a weekly word limit. Pro is $12 a month billed yearly, or $15 monthly",
      },
      { fact: "Account", lodestar: "None", rival: "Required" },
      {
        fact: "Where speech becomes text",
        lodestar: "On your Mac",
        rival: "In Wispr's cloud",
      },
      {
        fact: "Your audio",
        lodestar: "Never kept",
        rival: "Kept on Wispr's servers if you turn on cloud storage",
      },
      {
        fact: "Before it lands",
        lodestar: "A draft you can type into and fix",
        rival: "Typed straight into your app",
      },
      {
        fact: "Devices",
        lodestar: `Mac only, ${macs}`,
        rival: "Mac from macOS 12, Windows, iPhone and Android",
      },
    ],
    theirs: [
      "You dictate on Windows or on your phone as well",
      "You use an Intel Mac, or a Mac older than macOS 27",
      "You want notes taken in your meetings",
    ],
    ours: [
      "You want your voice turned into text without it leaving your Mac",
      "You want to fix the words before they reach your app",
      "You want no account, no cap and nothing to pay",
    ],
    checked,
    sources: [
      "https://wisprflow.ai/pricing",
      "https://docs.wisprflow.ai/articles/4709791908",
      "https://docs.wisprflow.ai/articles/1036674442",
      "https://docs.wisprflow.ai/articles/3152211871",
    ],
  },
  {
    slug: "rcmd",
    name: "rcmd",
    door: "switch",
    title: "rcmd Alternative: Free Keyboard App Switcher for Mac",
    description:
      "Lodestar is a free rcmd alternative: right ⌘ and a letter brings any app forward, with a launcher and side by side layouts saved to a key.",
    h1: "An rcmd alternative that is free in full",
    answer:
      "Both put every app on right ⌘ and a letter, and both keep what they do on your Mac. rcmd has a free tier and a €15 Pro license, and its Pro switches between Spaces. Lodestar is free in full, leaves your Spaces alone, and adds a launcher, side by side layouts saved to a letter, grammar, clipboard history and dictation.",
    rows: [
      {
        fact: "The gesture",
        lodestar: "Right ⌘ and a letter, held or tapped",
        rival: "Right ⌘ and a letter",
      },
      {
        fact: "Price",
        lodestar: "Free",
        rival: "Free tier. Pro is a €15 license, paid once",
      },
      {
        fact: "Your data",
        lodestar: "Stays on your Mac",
        rival: "Stays on your Mac. Licensing goes through Paddle",
      },
      {
        fact: "Side by side",
        lodestar: "Two letters in one hold, and layouts saved to a letter",
        rival: "Halves and thirds",
      },
      {
        fact: "Spaces",
        lodestar: "Left alone",
        rival: "Pro switches between them",
      },
      { fact: "Macs", lodestar: macs, rival: "macOS 13 or later" },
    ],
    theirs: [
      "You want to switch between Spaces from the keys",
      "You want to search browser tabs and terminal panes from the switcher",
      "You use a Mac older than macOS 27",
    ],
    ours: [
      "You want every feature free",
      "You want two apps side by side in one hold, and arrangements you can bring back",
      "You also want grammar, clipboard history and dictation in the same app",
    ],
    checked,
    sources: ["https://lowtechguys.com/rcmd"],
  },
];
