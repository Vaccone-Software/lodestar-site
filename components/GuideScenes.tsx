"use client";

import {
  apps,
  AskBar,
  Display,
  Foot,
  Glass,
  Keyboard,
  Label,
  lodeLit,
  pile,
  Sidebar,
  full,
  findLights,
  useInView,
  useScript,
  type Step,
} from "@/components/Scenes";

// The guide's scenes. Same stage as the front page, one script per
// lesson, and each plays only while it is on screen.

/** A lesson with no motion to show: the keys lit, and a line. */
export function Keys({ lit, caption }: { lit: string[]; caption: string }) {
  return (
    <div className="select-none">
      <Keyboard lit={lit} />
      <p className="text-dim mt-3 min-h-[1.4em] text-right text-[14.5px] leading-snug">
        {caption}
      </p>
    </div>
  );
}

// The launcher: type a few letters, arrive. Rows wear their addresses.
type LaunchFrame = { held: boolean; key: string | null; open: boolean; query: string; focus: string | null; caption: string };
const launchRest: LaunchFrame = { held: false, key: null, open: false, query: "", focus: null, caption: "An app you have not given a letter" };
const launchStill: LaunchFrame = { ...launchRest, open: true, query: "cal", caption: "Rows wear the letters you already gave" };
const launchScript: Step<LaunchFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "space" }],
  [150, { held: false, key: null, open: true, caption: "The launcher, ranked by what you actually use" }],
  [900, { query: "c", key: "c" }],
  [140, { query: "ca", key: "a" }],
  [140, { query: "cal", key: "l", caption: "Rows wear the letters you already gave" }],
  [300, { key: null }],
  [900, { key: "⏎" }],
  [180, { key: null, open: false, focus: "calendar", caption: "Calendar, maximized" }],
  [3200, { ...launchRest }],
];
const rows: [string, string, string][] = [
  ["Calendar", "", "cal"],
  ["Mail", "M", "cal"],
  ["Browser", "B", ""],
  ["Notes", "N", ""],
];
export function SceneLauncher() {
  const { ref, active } = useInView();
  const f = useScript(launchRest, launchStill, launchScript, active);
  const shown = rows.filter(([name]) => f.query === "" || name.toLowerCase().startsWith(f.query));
  return (
    <div ref={ref} className="select-none">
      <Display title={f.focus ? "Calendar" : "Finder"}>
        {pile(f.focus)}
        <Glass show={f.open} className="inset-x-[18%] top-[22%] px-[3%] py-[2.4%] text-[10px]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-[2%]">
            <span className="text-white/90">
              {f.query || <span className="text-white/30">type an app</span>}
            </span>
            <span className="bg-accent inline-block h-[1.1em] w-[2px] translate-y-[2px]" />
          </div>
          <ul className="mt-[2%] space-y-[1.5%]">
            {shown.map(([name, letter], i) => (
              <li
                key={name}
                className={`flex items-center justify-between rounded-[4px] px-[6px] py-[3px] ${i === 0 ? "bg-white/[0.08]" : ""}`}
              >
                <span className="text-white/85">{name}</span>
                {letter ? (
                  <span className="rounded-[3px] border border-white/10 bg-white/[0.06] px-[5px] py-[1px] text-[8.5px] text-white/70">
                    {letter}
                  </span>
                ) : (
                  <span className="text-[8px] text-white/35">⌘K add a letter</span>
                )}
              </li>
            ))}
          </ul>
        </Glass>
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// The chord: two letters under one hold arrange side by side.
type ChordFrame = { held: boolean; key: string | null; left: string | null; right: string | null; caption: string };
const chordRest: ChordFrame = { held: false, key: null, left: null, right: null, caption: "Two apps you use together" };
const chordStill: ChordFrame = { ...chordRest, left: "mail", right: "browser", caption: "Side by side, from one hold" };
const chordScript: Step<ChordFrame>[] = [
  [1200, { held: true, caption: "Hold lode, and keep holding" }],
  [700, { key: "M" }],
  [180, { left: "mail", caption: "Mail, maximized" }],
  [700, { key: "B", caption: "A second letter under the same hold" }],
  [180, { right: "browser", caption: "Side by side. Release, and it stands" }],
  [500, { key: null }],
  [800, { held: false }],
  [3400, { ...chordRest }],
];
function half(side: "left" | "right"): React.CSSProperties {
  return { ...full, left: side === "left" ? "1.2%" : "50.6%", width: "48.2%" };
}
export function SceneChord() {
  const { ref, active } = useInView();
  const f = useScript(chordRest, chordStill, chordScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title={f.right ? "Browser" : f.left ? "Mail" : "Finder"}>
        {apps.map((app) => {
          const isLeft = f.left === app.id;
          const isRight = f.right === app.id;
          const placed = isLeft || isRight;
          const hidden = (f.left || f.right) && !placed;
          const style: React.CSSProperties = isLeft
            ? f.right ? half("left") : full
            : isRight
              ? half("right")
              : { ...app.rest, opacity: hidden ? 0 : 1, transform: hidden ? "scale(0.96)" : "scale(1)" };
          return <WinLite key={app.id} name={app.name} tone={app.tone} style={style} />;
        })}
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// A window without the import cycle: the same look as Scenes' Win.
function WinLite({ name, tone, style }: { name: string; tone: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute overflow-hidden rounded-[6px] border border-white/[0.09] bg-[#1b1b20] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)] transition-[left,top,width,height,opacity,transform] duration-[520ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
      style={style}
    >
      <div className="flex h-[16px] items-center gap-[4px] border-b border-white/[0.06] bg-white/[0.035] px-[7px]">
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="ml-[6px] font-mono text-[8px] text-white/55">{name}</span>
      </div>
      <div className="flex h-[calc(100%-16px)]">
        <Sidebar tone={tone} />
        <div className="flex-1 space-y-[7px] p-[8px]">
          <div className="h-[5px] w-[30%] rounded-full" style={{ background: tone, opacity: 0.65 }} />
          {[80, 55, 68, 74, 42].map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-white/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Breaths: save a world at a letter, tear it down, bring it back.
type BreathFrame = { held: boolean; keys: string[]; world: boolean; caption: string };
const breathRest: BreathFrame = { held: false, keys: [], world: true, caption: "A layout worth keeping" };
const breathStill: BreathFrame = { ...breathRest, caption: "Restored, apps relaunched if they had to be" };
const breathScript: Step<BreathFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [600, { keys: ["'"] }],
  [500, { keys: ["⇧", "w"], caption: "' then ⇧W saves this world at W" }],
  [400, { keys: [], held: false }],
  [1800, { world: false, caption: "Later. Everything closed or moved" }],
  [1600, { held: true, caption: "Hold lode" }],
  [600, { keys: ["'"] }],
  [500, { keys: ["w"], caption: "' then W" }],
  [200, { world: true, caption: "Restored, apps relaunched if they had to be" }],
  [400, { keys: [], held: false }],
  [3400, { ...breathRest }],
];
export function SceneBreath() {
  const { ref, active } = useInView();
  const f = useScript(breathRest, breathStill, breathScript, active);
  const gone: React.CSSProperties = { ...full, opacity: 0, transform: "scale(0.96)" };
  return (
    <div ref={ref} className="select-none">
      <Display title={f.world ? "Mail" : "Finder"}>
        <WinLite name="Mail" tone="#c9c9d1" style={f.world ? half("left") : gone} />
        <WinLite name="Browser" tone="#8fb6d8" style={f.world ? half("right") : { ...gone, left: "50.6%", width: "48.2%" }} />
      </Display>
      <Foot lit={[...(f.held ? ["lode"] : []), ...f.keys]} caption={f.caption} />
    </div>
  );
}

// The window chooser: the app's windows, most recent first.
type ChooseFrame = { held: boolean; key: string | null; open: boolean; pick: number; caption: string };
const chooseRest: ChooseFrame = { held: false, key: null, open: false, pick: 0, caption: "Three Mail windows, one of them wanted" };
const chooseStill: ChooseFrame = { ...chooseRest, open: true, caption: "This app's windows, most recent first" };
const chooseScript: Step<ChooseFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "⇥" }],
  [150, { held: false, key: null, open: true, caption: "This app's windows, most recent first" }],
  [1200, { key: "j", pick: 1, caption: "Type part of a title, or walk the list" }],
  [400, { key: null }],
  [900, { key: "⏎" }],
  [150, { key: null, open: false, caption: "Summoned, maximized" }],
  [3000, { ...chooseRest }],
];
export function SceneChooser() {
  const { ref, active } = useInView();
  const f = useScript(chooseRest, chooseStill, chooseScript, active);
  const titles = ["Re: budget", "Invoice 0412", "Drafts"];
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <WinLite name={`Mail · ${f.open ? titles[0] : titles[f.pick]}`} tone="#c9c9d1" style={full} />
        <Glass show={f.open} className="inset-x-[24%] top-[24%] px-[3%] py-[2.4%] text-[10px]">
          <div className="text-white/40">Mail · windows</div>
          <ul className="mt-[2%] space-y-[1.5%]">
            {titles.map((t, i) => (
              <li key={t} className={`rounded-[4px] px-[6px] py-[3px] ${i === f.pick ? "bg-white/[0.08] text-white/90" : "text-white/70"}`}>
                {t}
                {i === 0 ? <span className="ml-2 text-[8px] text-white/35">most recent</span> : null}
              </li>
            ))}
          </ul>
        </Glass>
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// Undo: one timeline for the layout.
type UndoFrame = { held: boolean; key: string | null; state: "pair" | "single" | "pair2"; caption: string };
const undoRest: UndoFrame = { held: false, key: null, state: "pair", caption: "Mail and the browser, side by side" };
const undoStill: UndoFrame = { ...undoRest, caption: "One timeline, every placement in it" };
const undoScript: Step<UndoFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "N" }],
  [180, { state: "single", caption: "Notes, maximized. The pair is parked" }],
  [400, { held: false, key: null }],
  [1600, { held: true, caption: "That was not what you wanted" }],
  [700, { key: "←" }],
  [180, { state: "pair2", caption: "Undone. The pair is back exactly as it stood" }],
  [400, { held: false, key: null }],
  [3200, { ...undoRest }],
];
export function SceneUndo() {
  const { ref, active } = useInView();
  const f = useScript(undoRest, undoStill, undoScript, active);
  const pair = f.state !== "single";
  const gone: React.CSSProperties = { ...full, opacity: 0, transform: "scale(0.96)" };
  return (
    <div ref={ref} className="select-none">
      <Display title={pair ? "Mail" : "Notes"}>
        <WinLite name="Mail" tone="#c9c9d1" style={pair ? half("left") : { ...gone, width: "48.2%" }} />
        <WinLite name="Browser" tone="#8fb6d8" style={pair ? half("right") : { ...gone, left: "50.6%", width: "48.2%" }} />
        <WinLite name="Notes" tone="#d8c98f" style={pair ? gone : full} />
      </Display>
      <Foot lit={f.key === "←" ? [...(f.held ? ["lode"] : []), "◀"] : lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// Commands: the app's whole menu bar under search.
type CmdFrame = { held: boolean; key: string | null; open: boolean; query: string; done: boolean; caption: string };
const cmdRest: CmdFrame = { held: false, key: null, open: false, query: "", done: false, caption: "A menu item, somewhere in a submenu" };
const cmdStill: CmdFrame = { ...cmdRest, open: true, query: "arch", caption: "Every menu item, searched" };
const cmdScript: Step<CmdFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "-" }],
  [150, { held: false, key: null, open: true, caption: "Every menu item, searched" }],
  [800, { query: "a", key: "a" }],
  [140, { query: "ar", key: "r" }],
  [140, { query: "arc", key: "c" }],
  [140, { query: "arch", key: "h", caption: "Each row wears the app's own shortcut" }],
  [300, { key: null }],
  [900, { key: "⏎" }],
  [150, { key: null, open: false, done: true, caption: "Run, without hunting for it" }],
  [3000, { ...cmdRest }],
];
export function SceneCommands() {
  const { ref, active } = useInView();
  const f = useScript(cmdRest, cmdStill, cmdScript, active);
  const items: [string, string][] = [["Archive", "⌃⌘A"], ["Archive All Read", ""], ["Search Archive", "⌥⌘F"]];
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <WinLite name="Mail" tone="#c9c9d1" style={full} />
        <Glass show={f.open} className="inset-x-[18%] top-[22%] px-[3%] py-[2.4%] text-[10px]">
          <div className="flex items-center gap-2 border-b border-white/10 pb-[2%]">
            <span className="text-white/40">commands</span>
            <span className="text-white/90">{f.query}</span>
            <span className="bg-accent inline-block h-[1.1em] w-[2px] translate-y-[2px]" />
          </div>
          <ul className="mt-[2%] space-y-[1.5%]">
            {(f.query ? items : [["Archive", "⌃⌘A"], ["Reply", "⌘R"], ["Forward", "⇧⌘F"]] as [string, string][]).map(([name, sc], i) => (
              <li key={name} className={`flex items-center justify-between rounded-[4px] px-[6px] py-[3px] ${i === 0 ? "bg-white/[0.08]" : ""}`}>
                <span className="text-white/85">Message › {name}</span>
                {sc ? <span className="text-[8.5px] text-white/45">{sc}</span> : null}
              </li>
            ))}
          </ul>
        </Glass>
        <Glass show={f.done} className="right-[3%] bottom-[4%] px-[10px] py-[5px] text-[9px]">
          <span className="text-white/70">Archive</span>
        </Glass>
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// Scroll: hold j, the content moves; release, it stops.
type ScrollFrame = { held: boolean; key: string | null; mode: boolean; offset: number; caption: string };
const scrollRest: ScrollFrame = { held: false, key: null, mode: false, offset: 0, caption: "A long page, and no trackpad in reach" };
const scrollStill: ScrollFrame = { ...scrollRest, mode: true, offset: 40, caption: "Hold j. Release, and it stops" };
const scrollScript: Step<ScrollFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "`" }],
  [150, { held: false, key: null, mode: true, caption: "Scroll mode. The pointer is already on the page" }],
  [800, { key: "j", offset: 55, caption: "Hold j. Constant speed" }],
  [1400, { key: null, caption: "Release, and it stops" }],
  [900, { key: "k", offset: 20, caption: "k goes back up" }],
  [900, { key: null }],
  [800, { key: "esc", mode: false, caption: "esc, or any other lode gesture, leaves" }],
  [300, { key: null }],
  [2800, { ...scrollRest }],
];
export function SceneScroll() {
  const { ref, active } = useInView();
  const f = useScript(scrollRest, scrollStill, scrollScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title="Browser">
        <div className="absolute overflow-hidden rounded-[6px] border border-white/[0.09] bg-[#1b1b20]" style={full}>
          <div className="flex h-[16px] items-center gap-[4px] border-b border-white/[0.06] bg-white/[0.035] px-[7px]">
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="ml-[6px] font-mono text-[8px] text-white/55">Browser</span>
          </div>
          <div className="relative h-[calc(100%-16px)] overflow-hidden">
            <div
              className="absolute inset-x-0 space-y-[9px] p-[10px] transition-transform duration-[1300ms] ease-linear"
              style={{ transform: `translateY(-${f.offset}%)` }}
            >
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} className="h-[3px] rounded-full bg-white/10" style={{ width: `${45 + ((i * 37) % 45)}%` }} />
              ))}
            </div>
            <div
              className="absolute top-[4px] right-[3px] w-[3px] rounded-full bg-white/25 transition-[top] duration-[1300ms] ease-linear"
              style={{ height: "30%", top: `${4 + f.offset * 0.6}%` }}
            />
          </div>
        </div>
        <Glass show={f.mode} className="right-[3%] bottom-[4%] px-[10px] py-[5px] text-[9px]">
          <span className="text-white/40">scroll</span>
          <span className="ml-2 text-white/70">j k · d u · gg ⇧G · ⇥ panes</span>
        </Glass>
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// The draft, editing: the field's own text pulled in, silent. It opens in
// insert mode with the cursor at the end; esc makes it an editor, F and a
// letter fly back with every reachable letter lit, c w changes the word,
// and ⏎ puts the sentence back where it was.
const original = "Meeting moved to Thursday, bring the budget.";
const wrongWord = "Thursday";
const rightWord = "Friday";
const wrongAt = original.indexOf(wrongWord);
const edited = original.replace(wrongWord, rightWord);
type EditStage = "rest" | "insert" | "normal" | "find" | "jumped" | "changed" | "placed";
type EditFrame = { held: boolean; keys: string[]; stage: EditStage; typed: string; caption: string };
const editRest: EditFrame = { held: false, keys: [], stage: "rest", typed: "", caption: "A sentence already in the field" };
const editStill: EditFrame = { ...editRest, stage: "insert", caption: "The field's text, pulled into the draft" };
const editTyping: Step<EditFrame>[] = rightWord.split("").map((c, i): Step<EditFrame> => [i === 0 ? 600 : 140, { keys: [c.toLowerCase()], typed: rightWord.slice(0, i + 1) }]);
const editScript: Step<EditFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { keys: ["⇧", "."] }],
  [150, { held: false, keys: [], stage: "insert", caption: "The field's text, pulled into the draft. Silent" }],
  [1400, { keys: ["esc"], stage: "normal", caption: "esc. The draft becomes an editor" }],
  [350, { keys: [] }],
  [900, { keys: ["⇧", "f"], stage: "find", caption: "F. Every letter you can jump back to lights up" }],
  [400, { keys: [] }],
  [1200, { keys: ["⇧", "t"], stage: "jumped", caption: "T. The cursor is on Thursday" }],
  [350, { keys: [] }],
  [900, { keys: ["c"], caption: "c, then w. Change the word" }],
  [350, { keys: [] }],
  [300, { keys: ["w"], stage: "changed" }],
  [350, { keys: [] }],
  ...editTyping,
  [300, { keys: [] }],
  [1000, { keys: ["⏎"] }],
  [150, { keys: [], stage: "placed", caption: "Put back in the field, exactly there" }],
  [3200, { ...editRest }],
];
export function SceneEdit() {
  const { ref, active } = useInView();
  const f = useScript(editRest, editStill, editScript, active);
  const st = f.stage;
  const draft = st !== "rest" && st !== "placed";
  const shown = st === "changed" ? original.slice(0, wrongAt) + f.typed + original.slice(wrongAt + wrongWord.length) : original;
  const lights = st === "find" ? findLights(original, original.length) : new Set<number>();
  const block = st === "normal" || st === "find" ? original.length - 1 : st === "jumped" ? wrongAt : -1;
  const insertAt = st === "changed" ? wrongAt + f.typed.length : shown.length;
  const caret = <span key="caret" className="bg-accent inline-block h-[1em] w-[2px] translate-y-[1px]" />;
  return (
    <div ref={ref} className="select-none">
      <Display title="Notes">
        <div className="absolute overflow-hidden rounded-[6px] border border-white/[0.09] bg-[#1b1b20]" style={full}>
          <div className="flex h-[16px] items-center gap-[4px] border-b border-white/[0.06] bg-white/[0.035] px-[7px]">
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
            <span className="ml-[6px] font-mono text-[8px] text-white/55">Notes</span>
          </div>
          <div className="flex h-[calc(100%-16px)]">
            <Sidebar tone="#d8c98f" />
            <div className="flex-1 p-[10px] font-mono text-[9.5px] leading-[1.9] text-white/70">
              <p className={draft ? "text-white/30" : "text-white/85"}>{st === "placed" ? edited : original}</p>
            </div>
          </div>
        </div>
        <Glass show={draft} className="inset-x-[6%] bottom-[5%] px-[3%] py-[2.4%] text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-white/40">draft</span>
            <span className="text-[8px] text-white/40">{st === "insert" || st === "changed" ? "insert" : "normal"}</span>
          </div>
          <p className="mt-[1.5%] leading-[1.6] text-white/90">
            {shown.split("").flatMap((c, i) => {
              const node = (
                <span
                  key={i}
                  className={i === block ? "bg-white/90 text-[#17171b]" : lights.has(i) ? "text-accent font-medium" : ""}
                >
                  {c}
                </span>
              );
              return block < 0 && i === insertAt ? [caret, node] : [node];
            })}
            {block < 0 && insertAt >= shown.length ? caret : null}
          </p>
          <div className="mt-[1.5%] text-[8px] text-white/40">⏎ put it back · esc close</div>
        </Glass>
      </Display>
      <Foot lit={[...(f.held ? ["lode"] : []), ...f.keys]} caption={f.caption} />
    </div>
  );
}

// The meeting chip: the next join, at the door.
type MeetFrame = { held: boolean; key: string | null; chip: boolean; joined: boolean; caption: string };
const meetRest: MeetFrame = { held: false, key: null, chip: false, joined: false, caption: "Five minutes before a meeting" };
const meetStill: MeetFrame = { ...meetRest, chip: true, caption: "The next join, offered once" };
const meetScript: Step<MeetFrame>[] = [
  [1200, { chip: true, caption: "The next join, offered once" }],
  [2000, { held: true, caption: "Tap lode twice to join" }],
  [220, { held: false }],
  [180, { key: "lode" }],
  [200, { key: null, chip: false, joined: true, caption: "Joined, in the profile the calendar chose" }],
  [3200, { ...meetRest }],
];
export function SceneMeeting() {
  const { ref, active } = useInView();
  const f = useScript(meetRest, meetStill, meetScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title={f.joined ? "Browser" : "Mail"}>
        <WinLite name="Mail" tone="#c9c9d1" style={{ ...full, opacity: f.joined ? 0 : 1 }} />
        <WinLite name="Weekly sync · Work" tone="#8fb6d8" style={{ ...full, opacity: f.joined ? 1 : 0, zIndex: 21 }} />
        <Glass show={f.chip} className="inset-x-[22%] bottom-[6%] px-[2.6%] py-[2%] text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-white/90">
              <span className="text-white/40">meeting </span>Weekly sync · in 4:52
            </span>
            <span className={`rounded-[3px] border px-[6px] py-[1px] ${f.held ? "border-accent/70 bg-accent/25 text-[#ffd9c2]" : "border-white/10 bg-white/[0.06] text-white/80"}`}>lode lode</span>
          </div>
          <div className="mt-[1.6%] text-[8.5px] text-white/50">opens in Work · matched calendar · lode ⌫ not this one</div>
        </Glass>
      </Display>
      <Foot lit={f.held || f.key === "lode" ? ["lode"] : []} caption={f.caption} />
    </div>
  );
}

// Ask, promoting a row with ⌘K: this site, by this name.
type PromoteFrame = { held: boolean; key: string | null; ask: string | null; card: boolean; caption: string };
const promoteRest: PromoteFrame = { held: false, key: null, ask: null, card: false, caption: "A site you go to every day" };
const promoteStill: PromoteFrame = { ...promoteRest, ask: "docs.example.com", card: true, caption: "⌘K: name it, or route every link like it" };
const promoteScript: Step<PromoteFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "⏎" }],
  [200, { held: false, key: null, ask: "docs.example.com", caption: "A domain, typed once" }],
  [1400, { key: "⌘", caption: "⌘K promotes the row" }],
  [200, { key: "k", card: true, caption: "⌘K: name it, or route every link like it" }],
  [400, { key: null }],
  [2200, { key: "⏎", caption: "One line, written to your config" }],
  [200, { key: null, card: false, ask: null }],
  [2600, { ...promoteRest }],
];
export function ScenePromote() {
  const { ref, active } = useInView();
  const f = useScript(promoteRest, promoteStill, promoteScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <WinLite name="Mail" tone="#c9c9d1" style={full} />
        <AskBar text={f.ask} hint="docs.example.com" profile="Work" />
        <Glass show={f.card} className="inset-x-[30%] top-[52%] px-[3%] py-[2.4%] text-[9.5px]">
          <div className="text-white/40">docs.example.com</div>
          <ul className="mt-[2%] space-y-[2%] text-white/80">
            <li><span className="key mr-2 text-[10px]">a</span>Add link · docs</li>
            <li><span className="key mr-2 text-[10px]">r</span>Route this host · Work</li>
          </ul>
        </Glass>
      </Display>
      <Foot lit={f.key === "⌘" ? ["⌘"] : f.key === "k" ? ["⌘", "k"] : lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// Labels are exported for the fine print's inline use.
export { Label };
