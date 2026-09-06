// The guide, as data. One page per destination under the names the front
// page uses. Each page has the same anatomy: the first minute, the lessons
// for when you are ready, the fine print nobody finds on their own, the
// reason it works this way, and the config lines that belong to it.
// Scenes are named here and resolved in the page, so this file stays
// plain data the search can read.

export type Lesson = {
  /** What you want, not the key. */
  title: string;
  /** The keys, in the order pressed; "lode" is the hold. */
  keys: string[];
  /** Which keys to light on the keyboard when there is no scene. */
  lit?: string[];
  rule: string;
  scene?: string;
  /** Marks a part of Lodestar nobody finds by pressing keys. */
  hidden?: boolean;
  /** Keys and what they do, when a lesson is a table rather than a line. */
  table?: [string, string][];
};

export type GuidePage = {
  slug: string;
  name: string;
  blurb: string;
  first: Lesson;
  ready: Lesson[];
  finePrint: string[];
  why: string;
  options: string[];
};

export const guide: GuidePage[] = [
  {
    slug: "application",
    name: "An application",
    blurb: "Letters, the launcher, chains, and the map.",
    first: {
      title: "Get to an app",
      keys: ["lode", "M"],
      rule: "Hold lode and press the letter. The app arrives maximized, launched if it has to be, with everything else parked out of the way.",
      scene: "app",
    },
    ready: [
      {
        title: "Find an app you have not given a letter",
        keys: ["lode", "space"],
        rule: "The launcher lists your applications, ranked by how well they match and how often you go there. An empty query shows what you actually use. Rows wear the letters you already gave, so every search is a flashcard for the faster gesture.",
        scene: "launcher",
      },
      {
        title: "Give an app a letter",
        keys: ["⌘K", "a"],
        lit: ["⌘", "k"],
        rule: "In the launcher, ⌘K on a row opens its card. Type the letter, press return, and one line is written to your config. A browser row offers a profile as well, so B P and B W can be two different Braves.",
      },
      {
        title: "Arrive beside, not in front",
        keys: ["lode", "⇧", "M"],
        lit: ["lode", "⇧", "m"],
        rule: "Shift on any summon puts the app beside what you have instead of over it, an equal split.",
      },
      {
        title: "Reach a window you lost",
        keys: ["lode", "⇥"],
        rule: "The window chooser lists the focused app's windows, most recent first and the one you are in last. Type part of a title or walk the list. In the launcher, ⇥ on a running app expands it into its windows the same way.",
        scene: "chooser",
      },
      {
        title: "Two letters when one runs out",
        keys: ["lode", "E", "O"],
        lit: ["lode", "e", "o"],
        rule: "A chain is a short path of letters, E then O for Outlook under E for email. Once a chain starts it waits as long as you like. A wrong letter keeps you in place with a note. Only a completion or esc ends it.",
      },
      {
        title: "See your letters",
        keys: ["lode"],
        lit: ["lode"],
        rule: "Hold lode by itself for half a second and the map appears: every letter you have, and every continuation from where you are. The system teaches its own map.",
        hidden: true,
      },
    ],
    finePrint: [
      "While a chain is open, stray keystrokes are swallowed. Nothing leaks into the app you were in.",
      "A target already visible on another monitor is focused where it lives. Its arrangement is untouched. Anything hidden, parked, or freshly launched arrives on the screen you are using.",
      "A plain summon sweeps its own strays: any window Lodestar placed this session that is still standing on the display parks with the others, so one app, maximized, is true of the screen and not just the layout.",
      "Windows you did not summon are left alone. A dialog, a file reveal, a ⌘N window floats exactly as macOS would have it and never hides what you were reading.",
      "Every letter belongs to the graph. No letter is reserved.",
      "Three chains can mean the same browser as long as each opens a different profile. The card refuses a duplicate by naming the address that already means it.",
    ],
    why: "Applications are stable, launchable, and singular, so a letter can always resolve to one and can always relaunch it. That makes them the safe bedrock of the whole system, and it is why the first minute of Lodestar is three letters and nothing else. Measured on one hand over a year, a bare letter under lode misfired at zero, and every chain misfired more, which is why single letters come first and chains come only when the letters run out.",
    options: ["graph", "gestures.graph", "gestures.launcher", "gestures.window-chooser", "lode.trigger"],
  },
  {
    slug: "layout",
    name: "A layout",
    blurb: "Side by side, saved worlds, positions, displays, and undo.",
    first: {
      title: "Put two apps side by side",
      keys: ["lode", "M", "B"],
      rule: "Hold lode and press two letters before you let go. The second arrives beside the first. Three make columns. Release, and the arrangement stands.",
      scene: "chord",
    },
    ready: [
      {
        title: "Save a world, and bring it back",
        keys: ["lode", "'", "⇧W"],
        rule: "A breath is a saved layout. lode ' then a shifted letter saves everything standing at that letter. lode ' then the letter restores it, relaunching apps that are not running. lode ' ' updates the latest one.",
        scene: "breath",
      },
      {
        title: "Go back",
        keys: ["lode", "←"],
        rule: "Undo the last placement: a summon, a beside, a flip, a breath. Redo with →. One timeline across every display.",
        scene: "undo",
      },
      {
        title: "Jump by position",
        keys: ["lode", "3"],
        lit: ["lode", "3"],
        rule: "The windows in the layout are numbered left to right, top to bottom. lode and a digit goes to that one. 9 is always the last. Hold lode alone and the badges show the numbers.",
      },
      {
        title: "Fill the display with any window",
        keys: ["lode", "0"],
        lit: ["lode", "0"],
        rule: "The focused window fills the display and everything already placed parks. ⇧0 joins it beside instead. This is also how a window Lodestar did not open becomes one it manages.",
        hidden: true,
      },
      {
        title: "Flip the split",
        keys: ["lode", "\\"],
        lit: ["lode", "\\"],
        rule: "Side by side becomes top and bottom, and back.",
      },
      {
        title: "Send a window to the other display",
        keys: ["lode", "]"],
        lit: ["lode", "]"],
        rule: "The focused window moves to the next display, maximized there. [ goes the other way. Shift arrives beside.",
      },
      {
        title: "Slide a window to a position",
        keys: ["lode", "⇧2"],
        lit: ["lode", "⇧", "2"],
        rule: "A shifted digit moves the focused window to that position, shifting the others along.",
      },
    ],
    finePrint: [
      "Every monitor owns its own layout, with its own members, orientation, and numbers. Your verbs act on the display under the pointer, or the one with keyboard focus if you prefer.",
      "Unplug a monitor and its members quietly park. Plug it back in and the arrangement returns, remembered by the monitor's hardware identity, minus anything you placed elsewhere while it was gone.",
      "Breath paths are prefix-free: a path resolves the instant it matches, so nothing deeper can be created past it, and binding a prefix of an existing path is refused.",
      "Inside a breath chain, ⌫ arms deletion. The next path you type is deleted rather than visited. ⌫ again disarms.",
      "A breath captures every display and restores each member to its own monitor, or to the active one if that monitor is unplugged.",
      "Reaching a parked window by an outside road, ⌘Tab or the Dock, brings it back where it was.",
    ],
    why: "A specific window is instance-bound. The whole point is to pin this window out of ten, and a window cannot be freely recreated, so layouts carry the real technical risk and were built last, on the bedrock of the letters. They earn their place because past the motor floor the remaining gains are structural: eliminating a navigation beats accelerating one by any margin. On the day the chord shipped, a side-by-side arrangement went from 2.1 seconds to 757 milliseconds.",
    options: ["gestures.breaths", "gestures.index-jump", "gestures.maximize", "gestures.flip-orientation", "gestures.display-move", "gestures.layout-undo", "app.active-display"],
  },
  {
    slug: "page",
    name: "A page",
    blurb: "Ask, saved names, profiles, and links clicked anywhere.",
    first: {
      title: "Open a site",
      keys: ["lode", "⏎"],
      rule: "Ask takes a name you saved, a domain, or a search. Each row wears the browser profile it will open in, and return opens it there. Shift return opens beside.",
      scene: "page",
    },
    ready: [
      {
        title: "Name a site, or route every link like it",
        keys: ["⌘K"],
        rule: "⌘K on a row opens its card. a adds a link under a short name. r routes the host, so anything matching it lands in that profile from then on, including links you click in other apps. d removes a link. The card always says why a destination opens where it does.",
        scene: "promote",
      },
      {
        title: "Search",
        keys: ["lode", "⏎"],
        lit: ["lode", "⏎"],
        rule: "Anything without a dot is a search. Routes apply to searches too, so a query starting with a client's name lands in the profile that client lives in.",
      },
      {
        title: "Route the links you click",
        keys: [],
        lit: [],
        rule: "From the menu bar, Route Clicked Links Through Lodestar makes Lodestar the handler for links and applies your routes to every link clicked anywhere. A link that matches no rule goes to your saved browser, untouched. The same item gives the role back.",
        hidden: true,
      },
      {
        title: "Dev servers",
        keys: ["lode", "⏎"],
        lit: ["lode", "⏎"],
        rule: "localhost:3000, box.local, and private addresses are destinations, not searches, and they open over http because a machine on your desk has no certificate.",
        hidden: true,
      },
    ],
    finePrint: [
      "A bare domain routes by the longest matching pattern. Unrouted input opens in the fallback: your most recently focused browser window, or a profile you pin.",
      "A profile is named as browser:Name, the same form everywhere. There is no registry. The browser's own profile list is the authority, and every reference is checked at reload.",
      "A clicked link that matches a rule is diverted and nothing else happens: no rewriting, no fallback, no placement. A link someone sent you is not a request to rearrange your layout.",
      "Turning clicks off in the config makes Lodestar a transparent pass-through, so the off switch works from a text file. Uninstalling restores your saved browser first.",
      "Chromium browsers for now: Brave, Chrome, Edge.",
    ],
    why: "Choosing a profile is a decision made again every time a link arrives, and the hand cannot learn a decision. A destination is named once. The half of the problem that needed it most was never the bar, where you already have the chance to choose. It was the clicked link, where you have none.",
    options: ["web.links", "web.routes", "web.fallback", "web.search-url", "web.clicks.enabled", "web.clicks.browser", "gestures.web-bar"],
  },
  {
    slug: "button",
    name: "A button",
    blurb: "Letters on everything pressable, menus under search, and scrolling.",
    first: {
      title: "Press a button",
      keys: ["lode", ";"],
      rule: "Every button, link, and field the app can name wears a letter at once. Press the letter and it is pressed. For anything unnamed, type a few characters of what you can read and it wears a letter too.",
      scene: "button",
    },
    ready: [
      {
        title: "Right-click it",
        keys: ["lode", ";", "⌃⇧A"],
        lit: ["⌃", "⇧", "a"],
        rule: "Control with the shifted letter opens the element's own context menu where the app knows it, or right-clicks the word where it does not.",
      },
      {
        title: "Click through a form",
        keys: ["lode", "⇧;"],
        lit: ["lode", "⇧", ";"],
        rule: "The chained lens re-reads the window after every press, so a click that opened a panel or revealed a menu gets fresh letters without leaving the mode.",
        hidden: true,
      },
      {
        title: "Run a menu command",
        keys: ["lode", "-"],
        rule: "Commands searches the app's whole menu bar. Type part of a command and run it. Each row wears the app's own shortcut, so the faster path teaches itself.",
        scene: "commands",
      },
      {
        title: "Scroll from the keys",
        keys: ["lode", "`"],
        rule: "Scroll mode puts the pointer on the page's main pane and holds j, k, h, l at constant speed until you let go. d and u move half a page, gg and ⇧G go to the ends, ⇥ cycles between panes.",
        scene: "scroll",
      },
    ],
    finePrint: [
      "Lowercase always aims; a capital always fires. On a two-letter chip only the first letter needs shift.",
      "Where your pick lands inside an element the app can name, the click is the app's own press rather than a synthetic one. Text fields take focus.",
      "Any other lode gesture exits the mode and executes at once. lode M mid-scroll simply takes you to Mail.",
      "Scroll polarity follows your natural-scrolling setting. Shift with a scroll key moves three times as fast.",
      "The first lode ; may ask for Screen Recording. Until it is granted, the letters the app can name still answer.",
      "Reading the window never waits on the app: a heavy page cannot stall the overlay, and Electron apps are woken automatically.",
    ],
    why: "Clickability is not asked of the app. It is declared by your pick, because the sensor is the screen itself. That is what makes a terminal, a browser, and a chat the same to press in, and it is the mouse's first job moved to the keys.",
    options: ["gestures.hints", "gestures.commands", "gestures.scroll", "scroll.smooth", "scroll.speed", "scroll.step"],
  },
  {
    slug: "text",
    name: "Text on screen",
    blurb: "Highlight by typing, one word or a whole passage, in any app.",
    first: {
      title: "Highlight text by typing it",
      keys: ["lode", "/"],
      rule: "Type a few characters of anything you can see. Every match wears a letter. The shifted letter marks the start, type again and the shifted letter marks the end, and the span between is highlighted and ready to copy.",
      scene: "text",
    },
    ready: [
      {
        title: "Take one word",
        keys: ["lode", "/", "⇧A", "⌘C"],
        lit: ["⌘", "c"],
        rule: "After the first mark, ⌘C takes just that word and the mode is done.",
      },
      {
        title: "Span lines and columns",
        keys: ["lode", "/"],
        lit: ["lode", "/"],
        rule: "The end can be on any line below, or in a window beside. The span runs the way reading does, down the column your two marks share, so a sidebar stays out of the copy.",
        hidden: true,
      },
      {
        title: "Skip the keystroke",
        keys: [],
        lit: [],
        rule: "If a highlight is always a copy for you, one config line serves the clipboard the moment the second mark lands. Off by default.",
      },
    ],
    finePrint: [
      "A single character matches whole words only, so i finds the word I rather than every letter i.",
      "The span snaps to word boundaries: two typed characters name a word, they do not dissect it, so a URL comes out whole.",
      "⌫ walks back: the letter, then the query, then the first mark.",
      "What leaves the clipboard is read twice. The pixels are served at once, then the app is asked to select the same span and its text stands when it agrees. Where the app cannot, the frame is read again, upscaled.",
      "Inside a field you are editing, the highlight becomes the app's own selection, so delete and replace work from muscle memory.",
      "The first lode / asks for Screen Recording. Without it, an accessibility fallback covers what it can.",
    ],
    why: "Text is the mouse's last stronghold. It needs no assigned address, because it is made of the characters your keyboard already produces. A drag needs coordinates, and typed text is not coordinates, so the reading is the selector and the drag is the second opinion.",
    options: ["gestures.select", "select.copy-on-complete"],
  },
  {
    slug: "clipboard",
    name: "What you copied",
    blurb: "Recents under letters, pins under numbers, and a search that reads screenshots.",
    first: {
      title: "Paste something from earlier",
      keys: ["⇧⌘V", "S"],
      rule: "The strip opens along the bottom with your recent clips under the home row, newest first. A letter pastes it as plain text and closes the strip.",
      scene: "clipboard",
    },
    ready: [
      {
        title: "Pin what you paste constantly",
        keys: ["⇧⌘V", "⌘S", "p"],
        lit: ["⌘", "s"],
        rule: "⌘ with a card's letter opens its actions: pin, delete, or never save from that app again. A text card offers E to edit it; an image offers E to view it and S to save it. Pins climb the left edge under 1 to 5 and never move.",
      },
      {
        title: "See an image large, or save it by name",
        keys: ["⇧⌘V", "⌘A", "E"],
        lit: ["e"],
        rule: "On an image card, E opens it across the display, fitted whole; pinch to zoom and pan with two fingers, and esc steps back. S turns the band into a file name, already filled with where it came from and when: return alone saves it, or edit the name, where a slash is a subfolder and .jpg writes a JPEG.",
      },
      {
        title: "Paste as copied",
        keys: ["⇧⌘V", "⇧S"],
        lit: ["⇧", "s"],
        rule: "The shifted letter pastes the clip with its formatting, whatever the source app offered.",
      },
      {
        title: "Search the history",
        keys: ["⇧⌘V", "/"],
        lit: ["/"],
        rule: "Slash searches. Matches keep their letters, return pastes the first, and ⌥ with a letter pastes a match without leaving the search.",
      },
      {
        title: "Find a screenshot by its words",
        keys: ["⇧⌘V", "/"],
        lit: ["/"],
        rule: "An image is read once, a beat after it lands, and its text joins the search. A screenshot of an error is found by the error. A browser copy carries the site it came from, so github finds everything copied there.",
        hidden: true,
      },
    ],
    finePrint: [
      "Copies reorder the strip. Pastes never do, so the positions hold still while you use them.",
      "A copy of several files stays one card that pastes all of them.",
      "Anything a password manager marks concealed is never recorded. Nor is anything from an app you exclude, or containing a phrase you exclude.",
      "In a password field macOS blocks synthetic keystrokes, so Lodestar puts the clip on the clipboard and asks you to press ⌘V yourself rather than failing silently.",
      "The history lives outside your dotfiles, is excluded from backups, and is readable only by you.",
      "⌘V inside the search pastes the clipboard's text into the query. The same works in the launcher, commands, Ask, and hints.",
    ],
    why: "The two things you are most likely to want, a pin or what you just copied, sit at the same corner, so there is one place to look. This is the one gesture outside lode, because pasting happens in the middle of typing.",
    options: ["clipboard.enabled", "clipboard.save-to", "clipboard.exclude", "clipboard.exclude-apps", "clipboard.max-size-mb"],
  },
  {
    slug: "say",
    name: "What you say",
    blurb: "Dictation into any field, editing from the keys, and the dozen moves the draft uses.",
    first: {
      title: "Dictate into any field",
      keys: ["lode", "."],
      rule: "The draft opens at the foot of the screen and the words appear as you say them. Type into the same sentence. Return puts it where your cursor was. Recognition runs on your Mac.",
      scene: "speech",
    },
    ready: [
      {
        title: "Edit what a field already holds",
        keys: ["lode", "⇧."],
        rule: "The field's text, or its selection, is pulled into the draft, silent. Edit it from the keys, and return puts it back exactly where it was.",
        scene: "edit",
      },
      {
        title: "Fix a word without leaving the keys",
        keys: ["esc", "F", "b", "c", "w"],
        lit: ["esc"],
        rule: "esc makes the draft an editor. F and a letter jumps back to that letter, with every letter you can reach lit. c w changes the word under the cursor. Type the right one, and return.",
      },
      {
        title: "The dozen moves",
        keys: [],
        lit: [],
        rule: "The draft's editor is vim, and a draft needs about a dozen of its moves. Each is a verb, or a verb and an object.",
        hidden: true,
        table: [
          ["h j k l", "Move by a character, and by the lines you see."],
          ["w · b", "Forward and back by a word."],
          ["f x · F x", "To the next or the previous x. Every letter you can reach lights while the move is pending."],
          ["t x · T x", "To just before it."],
          ["c motion", "Change what the motion covers, then type. cw changes the word."],
          ["d motion", "Delete it. dw, d$ to the end of the line."],
          ["y motion · p", "Copy it, and paste. The only two keys that touch the system clipboard."],
          ["iw · aw", "The word under the cursor, without or with the space beside it."],
          ["q · b", "Any quoted thing, any bracketed thing. ciq changes what is inside the quotes."],
          ["u", "Undo."],
          [".", "Repeat the last change."],
          ["⏎ · ⇧⏎", "Commit from any mode. Shift return is a new line."],
        ],
      },
      {
        title: "Wrap and unwrap",
        keys: ["sa", "sd", "sr"],
        lit: ["s"],
        rule: "sa wraps a motion or selection in a pair, sd removes one, sr swaps one for another. An opening character pads with spaces.",
        hidden: true,
      },
      {
        title: "Teach it a name",
        keys: [],
        lit: [],
        rule: "Names and terms speech gets wrong go in one config line, and a settled result within an edit of a listed word is corrected to it.",
      },
    ],
    finePrint: [
      "j and k walk the lines the eye sees, not logical lines, because draft prose makes a logical line an accident of width.",
      "Only y and p touch the system clipboard, so the strip holds what you meant to keep and nothing else.",
      "esc clears a pending command first, leaves a selection second, and only then closes. esc twice keeps the draft in the clipboard.",
      "The block cursor is a solid plate with the glyph cut out of it, in the system's mono face, so a lit letter never reflows the line.",
      "The microphone is chosen by its name in Sound settings. A headset that goes silent is retried; the built-in microphone is the safe choice.",
    ],
    why: "There is one grammar and no picker. The floor is the plain text field everyone knows, and the editor exists only past an esc a person need never press. It is vim, stock, with two imports from the author's own editor for finding the pair you mean, because one key that finds the quote you meant beats three that ask you to name it.",
    options: ["gestures.draft", "draft.input", "draft.words"],
  },
  {
    slug: "coach",
    name: "The coach",
    blurb: "What it can offer, what it records, and how to say no.",
    first: {
      title: "Take an offer",
      keys: ["lode", "lode"],
      rule: "After a navigation, a chip may appear with one offer, its evidence, and what it would save each week. Tap lode twice to take it. Exactly one line is written to your config.",
      scene: "coach",
    },
    ready: [
      {
        title: "Say not this one",
        keys: ["lode", "⌫"],
        lit: ["lode", "⌫"],
        rule: "lode and delete declines. Later retries at a better moment then parks. Never sleeps for a season. Both reopen only if the evidence materially outgrows the answer.",
      },
      {
        title: "What it can offer",
        keys: [],
        lit: [],
        rule: "A letter for an app you keep finding through the launcher. A shorter address for a chain that keeps stumbling. The letter your hand already presses by mistake, bound to what it wanted. A layout for two apps that travel together. Meetings, once you have joined a few by hand.",
        hidden: true,
      },
      {
        title: "The closed road",
        keys: ["lode", "space"],
        lit: ["lode"],
        rule: "Accept a letter and the launcher, asked for that app, answers with the letter and opens it only on a second return. The toll lifts when your hand has the letter, or after nine weeks at most.",
        hidden: true,
      },
      {
        title: "Read what it knows, or delete it",
        keys: [],
        lit: [],
        rule: "lodestar observations prints the record plainly, because a store you cannot read is one you cannot consent to. lodestar observations clear deletes it.",
      },
      {
        title: "Join a meeting from the door",
        keys: ["lode", "lode"],
        rule: "With meetings on, a chip appears a few minutes before a meeting with the join behind a double tap, in the profile the calendar chose. Off by default, and the calendar permission is asked only when you turn it on.",
        scene: "meeting",
      },
    ],
    finePrint: [
      "The record is how you got places, never what you did there: pauses inside an address, whether the map was consulted, abandoned chains, the wrong key pressed, transitions between apps. No titles, no addresses, no text.",
      "The coach paces itself by what your hands demonstrate. After an accept it stays silent until that address has actually compiled, and each accept in a row shortens the wait.",
      "A gesture you have not fired in ninety days becomes a finding, with the one config line that would retire it. Nothing turns off on its own.",
      "The health pulse, on its own switch, keeps counts and rhythm moments per quarter hour and never key identities on general typing.",
      "One line turns observation off, and off means nothing is written.",
    ],
    why: "Seeing a shortcut changes nothing. In the study behind this design, people who could keep using the old path used the new one 29 percent of the time, and half of them never used it at all. When the old path was closed, 73 percent switched. So the chip's job is consent, and the intervention is structural: the old road gets a toll, priced in one deliberate confirm.",
    options: ["coach.enabled", "observations.enabled", "observations.health", "meetings.enabled", "meetings.lead-minutes", "meetings.calendars"],
  },
  {
    slug: "settings",
    name: "Settings",
    blurb: "The window, the file, the shell, and every option.",
    first: {
      title: "Change anything",
      keys: ["lode", ","],
      lit: ["lode", ","],
      rule: "The settings window carries every option the config holds and nothing else. Every row wears the config path it writes, so the window teaches the file as you use it.",
    },
    ready: [
      {
        title: "The file",
        keys: [],
        lit: [],
        rule: "~/.config/lodestar/lodestar.json holds only what differs from the defaults, so it reads as pure intent. It is watched: saving applies it the moment it parses, and a file that does not parse is announced once and left alone.",
      },
      {
        title: "From the shell",
        keys: [],
        lit: [],
        rule: "lodestar config set writes one option. lodestar check validates everything, including profile names against the browsers on your machine. lodestar reload applies. lodestar schema prints every option, typed and described. lodestar diagnose is what to paste into an issue.",
        hidden: true,
      },
      {
        title: "A different lode key",
        keys: [],
        lit: ["lode"],
        rule: "Right ⌘ is the default. The trigger is one config line, and a non-ANSI keyboard can override key names under keys.",
      },
      {
        title: "Updates and login",
        keys: [],
        lit: [],
        rule: "The installed app checks daily, downloads in the background, verifies the signature, and applies quietly. It installs its own login agent so it survives reboots, and restarts itself after a crash but never after a clean quit.",
      },
    ],
    finePrint: [
      "Every reload validates everything: syntax, unknown keys with a did-you-mean, types and ranges, and profile references against each browser's real profile list.",
      "The file's $schema line points at a schema written beside it, so an editor completes and documents every option as you type.",
      "State, the breaths and parked frames, is versioned and self-defending: every boot keeps a last known good copy.",
      "Logs are one line per event, greppable, rotating at five megabytes.",
      "The menu bar star holds the walk, updates, the issue reporter, the browser role, settings, the config, the log, and quit.",
    ],
    why: "The window and the file cannot drift in either direction, because both are generated from one table in the source. Every writer, a hand edit, ⌘K, the coach, the shell, converges on the same canonical bytes. A configuration that can be read is one that can be trusted.",
    options: ["app.auto-update", "app.start-at-login", "app.show-menu-bar", "appearance.accent", "lode.trigger", "keys", "version"],
  },
];
