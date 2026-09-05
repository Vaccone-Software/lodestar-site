"use client";

import { useEffect, useRef, useState } from "react";
import Key from "@/components/Key";

// Drawn demonstrations. One stage — a display, windows, a row of keys —
// and one script per destination, so each section shows the behaviour it
// describes rather than a photograph that will age. A scene plays only
// while it is on screen and rests on its final frame otherwise, so the
// page never has two things moving at once. Under reduced motion every
// scene shows its final frame and nothing moves. Nothing here is a
// screenshot of Lodestar; the shapes are the argument, not the pixels.

// ---------------------------------------------------------------- engine

export type Step<T> = [number, Partial<T>];

export function useInView(threshold = 0.4) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, active };
}

/** Runs a script from `rest` while active, looping; resets to `rest` when
    the scene leaves the screen; shows `still` under reduced motion. */
export function useScript<T extends object>(
  rest: T,
  still: T,
  script: Step<T>[],
  active: boolean,
): T {
  const [frame, setFrame] = useState<T>(rest);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFrame(still);
      return;
    }
    if (!active) {
      setFrame(rest);
      return;
    }
    let index = 0;
    let timer = 0;
    let disposed = false;
    setFrame(rest);
    const step = () => {
      if (disposed) return;
      const [delay, patch] = script[index];
      timer = window.setTimeout(() => {
        setFrame((f) => ({ ...f, ...patch }));
        index = (index + 1) % script.length;
        step();
      }, delay);
    };
    step();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
    // rest/still/script are module constants per scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return frame;
}

// ------------------------------------------------------------ primitives

export function Display({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border-hairline relative aspect-[16/10] w-full overflow-hidden rounded-[10px] border bg-[#0e0e12]"
      style={{
        boxShadow:
          "0 30px 80px -30px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 30% 0%, rgba(58,64,92,0.45), transparent 60%), radial-gradient(90% 70% at 90% 100%, rgba(255,79,0,0.10), transparent 60%)",
        }}
      />
      <div className="border-hairline absolute inset-x-0 top-0 flex h-[7%] items-center gap-3 border-b bg-white/[0.03] px-3 font-mono text-[9px] tracking-wide text-white/40">
        <span className="text-white/70">✦</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

export const full: React.CSSProperties = {
  left: "1.2%",
  top: "9%",
  width: "97.6%",
  height: "89%",
  zIndex: 20,
  opacity: 1,
  transform: "scale(1)",
};

export function Win({
  name,
  tone,
  style,
  children,
}: {
  name: string;
  tone: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-[6px] border border-white/[0.09] bg-[#1b1b20] shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)] transition-[left,top,width,height,opacity,transform] duration-[520ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
      style={style}
    >
      <div className="flex h-[16px] items-center gap-[4px] border-b border-white/[0.06] bg-white/[0.035] px-[7px]">
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="ml-[6px] font-mono text-[8px] text-white/55">
          {name}
        </span>
      </div>
      {children ?? <Body tone={tone} />}
    </div>
  );
}

/** A sidebar and a list, the shape most applications share. */
export function Body({ tone, rows = [80, 55, 68, 74, 42, 63, 58] }: { tone: string; rows?: number[] }) {
  return (
    <div className="flex h-[calc(100%-16px)]">
      <Sidebar tone={tone} />
      <div className="flex-1 space-y-[7px] p-[8px]">
        <div className="h-[5px] w-[30%] rounded-full" style={{ background: tone, opacity: 0.65 }} />
        {rows.map((w, i) => (
          <div key={i} className="flex items-center gap-[6px]">
            <div className="h-[7px] w-[7px] shrink-0 rounded-full bg-white/[0.07]" />
            <div className="h-[3px] rounded-full bg-white/10" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ tone }: { tone: string }) {
  return (
    <div className="w-[22%] shrink-0 space-y-[6px] border-r border-white/[0.06] bg-white/[0.02] p-[7px]">
      <div className="h-[5px] w-[70%] rounded-full" style={{ background: tone, opacity: 0.7 }} />
      <div className="h-[3px] w-[85%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[60%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[75%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[50%] rounded-full bg-white/10" />
    </div>
  );
}

/** A glass bar or chip inside the display. */
export function Glass({
  show,
  className = "",
  children,
}: {
  show: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute z-30 rounded-[8px] border border-white/10 bg-[#17171b]/95 font-mono shadow-2xl backdrop-blur transition-[opacity,transform] duration-200 ${className}`}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(4px)",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
}

/** A hint label, the kind hints and highlighting put on the screen. */
export function Label({
  children,
  show,
  lit,
  className = "",
  style,
}: {
  children: string;
  show: boolean;
  lit?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`absolute z-30 rounded-[3px] border px-[4px] py-[1px] font-mono text-[8px] leading-none transition-opacity duration-150 ${
        lit
          ? "border-accent bg-accent text-[#1a0a00]"
          : "border-[#ffb38a]/60 bg-[#2a1a10] text-[#ffd9c2]"
      } ${className}`}
      style={{ opacity: show ? 1 : 0, ...style }}
    >
      {children}
    </span>
  );
}

/** The keys lit for lode plus the key it is waiting on. */
export function lodeLit(held: boolean, key: string | null): string[] {
  return [...(held ? ["lode"] : []), ...(key ? [key] : [])];
}


// ------------------------------------------------------------- keyboard

// The keyboard under the hero, drawn once: the one fact no caption can
// carry is that lode is the right command key, so the key wears its name.
// [label, width, id]. Doubled keys carry a side in their id, so a chord
// can light the shift on the opposite hand from the letter, the way a
// typist actually strikes it, and ⌘ is always the left one: the right ⌘
// is lode.
type KeyDef = [string, number, string?];
const keyboardRows: KeyDef[][] = [
  [["esc", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["⌫", 1.6]],
  [["⇥", 1.6], ["q", 1], ["w", 1], ["e", 1], ["r", 1], ["t", 1], ["y", 1], ["u", 1], ["i", 1], ["o", 1], ["p", 1], ["[", 1], ["]", 1], ["\\", 1]],
  [["⇪", 1.9], ["a", 1], ["s", 1], ["d", 1], ["f", 1], ["g", 1], ["h", 1], ["j", 1], ["k", 1], ["l", 1], [";", 1], ["'", 1], ["⏎", 1.9]],
  [["⇧", 2.5, "⇧L"], ["z", 1], ["x", 1], ["c", 1], ["v", 1], ["b", 1], ["n", 1], ["m", 1], [",", 1], [".", 1], ["/", 1], ["⇧", 2.5, "⇧R"]],
  [["fn", 1], ["⌃", 1], ["⌥", 1, "⌥L"], ["⌘", 1.25, "⌘L"], ["", 5.6], ["lode", 1.25], ["⌥", 1, "⌥R"], ["◀", 1], ["▲▼", 1], ["▶", 1]],
];
const leftHand = /^[qwertasdfgzxcvb12345`]$/i;

export function Keyboard({ lit }: { lit: string[] }) {
  const set = new Set(lit.map((k) => k.toLowerCase()));
  // A modifier lights on the side opposite the letter it is chorded with.
  const letter = lit.find((k) => k.length === 1 && /[a-z0-9]/i.test(k));
  const opposite = letter && leftHand.test(letter) ? "R" : "L";
  if (set.has("⇧")) set.add(`⇧${opposite}`.toLowerCase());
  if (set.has("⌘")) set.add("⌘l");
  if (set.has("⌥")) set.add(`⌥${opposite}`.toLowerCase());
  return (
    <div className="border-hairline mt-4 space-y-[3px] rounded-[8px] border bg-white/[0.02] p-[6px]" aria-hidden="true">
      {keyboardRows.map((row, r) => (
        <div key={r} className="flex gap-[3px]">
          {row.map(([label, w, id], i) => {
            const isLode = label === "lode";
            const on = id
              ? set.has(id.toLowerCase())
              : set.has(label.toLowerCase()) && label !== "";
            return (
              <div
                key={`${r}-${i}`}
                className={`flex h-[clamp(14px,2.4vw,22px)] items-center justify-center rounded-[3px] border font-mono text-[clamp(6px,0.9vw,9px)] leading-none transition-colors duration-100 ${
                  on
                    ? "border-accent/80 bg-accent/25 text-[#ffd9c2]"
                    : isLode
                      ? "border-white/[0.08] bg-white/[0.035] text-accent/80"
                      : "border-white/[0.08] bg-white/[0.035] text-white/45"
                }`}
                style={{ flex: `${w} ${w} 0%` }}
              >
                {label}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Under every scene: the keyboard, then what the keys did. */
export function Foot({ lit, caption }: { lit: string[]; caption: string }) {
  return (
    <>
      <Keyboard lit={lit} />
      <p className="text-dim mt-3 min-h-[1.4em] text-right text-[14.5px] leading-snug">
        {caption}
      </p>
    </>
  );
}

// ------------------------------------------------------------- windows

type App = {
  id: string;
  name: string;
  letter: string;
  tone: string;
  rest: React.CSSProperties;
};

export const apps: App[] = [
  { id: "notes", name: "Notes", letter: "N", tone: "#d8c98f", rest: { left: "6%", top: "10%", width: "46%", height: "58%", zIndex: 1 } },
  { id: "browser", name: "Browser", letter: "B", tone: "#8fb6d8", rest: { left: "30%", top: "22%", width: "52%", height: "62%", zIndex: 2 } },
  { id: "terminal", name: "Terminal", letter: "T", tone: "#a7d3a1", rest: { left: "52%", top: "6%", width: "42%", height: "46%", zIndex: 3 } },
  { id: "calendar", name: "Calendar", letter: "C", tone: "#e0a6a6", rest: { left: "14%", top: "40%", width: "44%", height: "52%", zIndex: 4 } },
  { id: "mail", name: "Mail", letter: "M", tone: "#c9c9d1", rest: { left: "40%", top: "34%", width: "40%", height: "50%", zIndex: 5 } },
];

export function pile(focus: string | null) {
  return apps.map((app) => {
    const isFocus = focus === app.id;
    const hidden = focus !== null && !isFocus;
    const style: React.CSSProperties = isFocus
      ? full
      : {
          ...app.rest,
          opacity: hidden ? 0 : 1,
          transform: hidden ? "scale(0.96)" : "scale(1)",
        };
    return <Win key={app.id} name={app.name} tone={app.tone} style={style} />;
  });
}

export function nameOf(id: string | null) {
  return apps.find((a) => a.id === id)?.name ?? "Finder";
}

// ---------------------------------------------------------------- scenes

// The moment: the hero. An application by its letter, another by its
// letter, and a page by its name, because the sentence the page makes is
// that they are the same gesture.
type MomentFrame = {
  held: boolean;
  key: string | null;
  focus: string | null;
  ask: string | null;
  page: boolean;
  caption: string;
};
const momentRest: MomentFrame = {
  held: false,
  key: null,
  focus: null,
  ask: null,
  page: false,
  caption: "Five windows, the way an afternoon leaves them",
};
const momentStill: MomentFrame = {
  ...momentRest,
  focus: "mail",
  caption: "Mail, maximized, with nothing else in the way",
};
const momentScript: Step<MomentFrame>[] = [
  [700, { held: true, caption: "Hold lode" }],
  [600, { key: "M" }],
  [180, { focus: "mail", caption: "Mail, maximized, with nothing else in the way" }],
  [420, { held: false, key: null }],
  [2400, { held: true, caption: "Any letter you gave an application" }],
  [700, { key: "B" }],
  [180, { focus: "browser", caption: "Your browser. Same press, same arrival" }],
  [420, { held: false, key: null }],
  [2400, { held: true, caption: "A page is a destination too" }],
  [700, { key: "⏎" }],
  [200, { held: false, key: null, ask: "", caption: "Ask. Type a name, a site, or a question" }],
  [500, { ask: "w", key: "w" }],
  [120, { ask: "we", key: "e" }],
  [120, { ask: "wea", key: "a" }],
  [120, { ask: "weat", key: "t" }],
  [120, { ask: "weath", key: "h" }],
  [120, { ask: "weathe", key: "e" }],
  [120, { ask: "weather", key: "r" }],
  [300, { key: null }],
  [500, { key: "⏎" }],
  [180, { ask: null, key: null, page: true, focus: "page", caption: "Open, in the browser profile it belongs to" }],
  [3200, { ...momentRest }],
];

export function SceneMoment() {
  const { ref, active } = useInView(0.2);
  const f = useScript(momentRest, momentStill, momentScript, active);
  return (
    <div ref={ref} className="w-full select-none" aria-label="A demonstration: one gesture, and the application is in front">
      <Display title={f.focus === "page" ? "Browser" : nameOf(f.focus)}>
        {pile(f.focus)}
        <Win
          name="weather · Personal"
          tone="#8fb6d8"
          style={
            f.focus === "page"
              ? full
              : { left: "20%", top: "20%", width: "60%", height: "60%", zIndex: 0, opacity: 0, transform: "scale(0.96)" }
          }
        >
          <PageBody tone="#8fb6d8" />
        </Win>
        <AskBar text={f.ask} hint="weather" profile="Personal" />
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

export function PageBody({ tone }: { tone: string }) {
  return (
    <div className="space-y-[7px] p-[8px]">
      <div className="h-[6px] w-[34%] rounded-full" style={{ background: tone, opacity: 0.7 }} />
      <div className="grid grid-cols-3 gap-[5px] pt-[3px]">
        <div className="h-[22px] rounded-[3px] bg-white/[0.05]" />
        <div className="h-[22px] rounded-[3px] bg-white/[0.05]" />
        <div className="h-[22px] rounded-[3px] bg-white/[0.05]" />
      </div>
      <div className="h-[3px] w-[70%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[62%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[74%] rounded-full bg-white/10" />
      <div className="h-[3px] w-[48%] rounded-full bg-white/10" />
    </div>
  );
}

export function AskBar({
  text,
  hint,
  profile,
}: {
  text: string | null;
  hint: string;
  profile: string;
}) {
  return (
    <Glass show={text !== null} className="inset-x-[16%] top-[30%] px-[3%] py-[2.2%] text-[11px]">
      <div className="flex items-center gap-2">
        <span className="text-white/40">ask</span>
        <span className="text-white/90">
          {text}
          <span className="bg-accent ml-[1px] inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse" />
        </span>
      </div>
      <div className="mt-[2%] flex items-center justify-between text-[9px] text-white/50">
        <span>{text && hint.startsWith(text) && text.length > 0 ? hint : "search"}</span>
        <span className="rounded-[3px] border border-white/10 px-[6px] py-[1px]">
          {profile}
        </span>
      </div>
    </Glass>
  );
}

// An application: the letter, and the arrival.
type AppFrame = { held: boolean; key: string | null; focus: string | null; caption: string };
const appRest: AppFrame = { held: false, key: null, focus: null, caption: "Windows, wherever the day left them" };
const appStill: AppFrame = { ...appRest, focus: "mail", caption: "M is always Mail" };
const appScript: Step<AppFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [800, { key: "M" }],
  [180, { focus: "mail", caption: "M is always Mail" }],
  [420, { held: false, key: null }],
  [2600, { held: true }],
  [700, { key: "N" }],
  [180, { focus: "notes", caption: "N is always Notes, even when it has to launch" }],
  [420, { held: false, key: null }],
  [3000, { ...appRest }],
];
export function SceneApp() {
  const { ref, active } = useInView();
  const f = useScript(appRest, appStill, appScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title={nameOf(f.focus)}>{pile(f.focus)}</Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// A page: Ask, a name, and the profile it belongs to.
type PageFrame = { held: boolean; key: string | null; ask: string | null; page: boolean; caption: string };
const pageRest: PageFrame = { held: false, key: null, ask: null, page: false, caption: "In Mail, with something to look up" };
const pageStill: PageFrame = { ...pageRest, page: true, caption: "Open in your work profile, without choosing" };
const pageScript: Step<PageFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "⏎" }],
  [200, { held: false, key: null, ask: "", caption: "Ask. A name you saved, a site, or a search" }],
  [500, { ask: "d", key: "d" }],
  [130, { ask: "do", key: "o" }],
  [130, { ask: "doc", key: "c" }],
  [130, { ask: "docs", key: "s" }],
  [300, { key: null }],
  [600, { key: "⏎" }],
  [180, { ask: null, key: null, page: true, caption: "Open in your work profile, without choosing" }],
  [3200, { ...pageRest }],
];
export function ScenePage() {
  const { ref, active } = useInView();
  const f = useScript(pageRest, pageStill, pageScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title={f.page ? "Browser" : "Mail"}>
        <Win name="Mail" tone="#c9c9d1" style={{ ...full, opacity: f.page ? 0 : 1 }} />
        <Win name="docs · Work" tone="#8fb6d8" style={{ ...full, opacity: f.page ? 1 : 0, zIndex: 21 }}>
          <PageBody tone="#8fb6d8" />
        </Win>
        <AskBar text={f.ask} hint="docs" profile="Work" />
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// A button: every pressable thing wears a letter.
type HintFrame = { held: boolean; key: string | null; labels: boolean; pressed: string | null; caption: string };
const hintRest: HintFrame = { held: false, key: null, labels: false, pressed: null, caption: "A window with things to press" };
const hintStill: HintFrame = { ...hintRest, labels: true, caption: "Every button, link, and field wears a letter" };
const hintScript: Step<HintFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: ";" }],
  [150, { held: false, key: null, labels: true, caption: "Every button, link, and field wears a letter" }],
  [1800, { key: "D", caption: "Press its letter" }],
  [150, { labels: false, pressed: "D", caption: "Pressed, without finding it with the mouse" }],
  [400, { key: null }],
  [2800, { ...hintRest }],
];
const buttons: [string][] = [["A"], ["S"], ["D"], ["F"]];
const links: [string, string][] = [["G", "35%"], ["H", "49%"], ["J", "63%"]];
export function SceneButton() {
  const { ref, active } = useInView();
  const f = useScript(hintRest, hintStill, hintScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title="Browser">
        <Win name="Browser" tone="#8fb6d8" style={full}>
          <div className="flex h-[calc(100%-16px)]">
            <Sidebar tone="#8fb6d8" />
            <div className="relative flex-1 p-[8px]">
              <div className="flex gap-[6px]">
                {buttons.map(([k]) => (
                  <div
                    key={k}
                    className={`h-[14px] w-[15%] rounded-[3px] border transition-colors duration-150 ${
                      f.pressed === k ? "border-accent bg-accent/30" : "border-white/10 bg-white/[0.06]"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-[12px] space-y-[9px]">
                {links.map(([k, w]) => (
                  <div key={k} className="flex items-center gap-[6px]">
                    <div className="h-[7px] w-[7px] rounded-full bg-white/[0.07]" />
                    <div className="h-[3px] rounded-full bg-[#8fb6d8]/50" style={{ width: w }} />
                  </div>
                ))}
                <div className="h-[3px] w-[70%] rounded-full bg-white/10" />
                <div className="h-[3px] w-[58%] rounded-full bg-white/10" />
              </div>
              {buttons.map(([k], i) => (
                <Label
                  key={k}
                  show={f.labels}
                  lit={f.key === k}
                  className="top-[3px]"
                  style={{ left: `calc(8px + ${i} * (15% + 6px) + 3px)` }}
                >
                  {k}
                </Label>
              ))}
              {links.map(([k], i) => (
                <Label
                  key={k}
                  show={f.labels}
                  className="left-[20px]"
                  style={{ top: `${30 + i * 12}px` }}
                >
                  {k}
                </Label>
              ))}
            </div>
          </div>
        </Win>
      </Display>
      <Foot lit={lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// Text on screen: type what you see, mark the start and the end.
type TextFrame = { held: boolean; key: string | null; query: string; stage: "rest" | "typing" | "start" | "end" | "done"; caption: string };
const textRest: TextFrame = { held: false, key: null, query: "", stage: "rest", caption: "Text on screen, in any application" };
const textStill: TextFrame = { ...textRest, stage: "done", caption: "Highlighted, and ready to copy" };
const textScript: Step<TextFrame>[] = [
  [1200, { held: true, caption: "Hold lode" }],
  [700, { key: "/" }],
  [150, { held: false, key: null, stage: "typing", caption: "Type a few characters of what you see" }],
  [500, { query: "r", key: "r" }],
  [140, { query: "re", key: "e" }],
  [140, { query: "rev", key: "v" }],
  [300, { key: null }],
  [700, { key: "A", caption: "⇧ A marks where it starts" }],
  [200, { key: null, stage: "start" }],
  [900, { query: "" }],
  [500, { query: "l", key: "l" }],
  [140, { query: "li", key: "i" }],
  [140, { query: "lis", key: "s" }],
  [300, { key: null }],
  [700, { key: "S", caption: "⇧ S marks where it ends" }],
  [200, { key: null, stage: "end" }],
  [500, { stage: "done", caption: "Highlighted, and ready to copy" }],
  [3400, { ...textRest }],
];
export function SceneText() {
  const { ref, active } = useInView();
  const f = useScript(textRest, textStill, textScript, active);
  const marking = f.stage === "typing" || f.stage === "start" || f.stage === "end";
  const selected = f.stage === "end" || f.stage === "done";
  const sel = selected ? "bg-accent/40 text-white" : "";
  return (
    <div ref={ref} className="select-none">
      <Display title="Notes">
        <Win name="Notes" tone="#d8c98f" style={full}>
          <div className="flex h-[calc(100%-16px)]">
            <Sidebar tone="#d8c98f" />
            <div className="relative flex-1 p-[10px] font-mono text-[9.5px] leading-[2] text-white/70">
              <p>Launch review moves to Thursday.</p>
              <p>
                Bring the{" "}
                <span className="relative">
                  <span className={sel}>revised</span>
                  <Label show={f.stage === "typing" && f.query !== "" && "revised".startsWith(f.query)} lit={f.key === "A"} className="-top-[9px] -left-[2px]">A</Label>
                  <Label show={f.stage === "start" || f.stage === "end"} lit className="-top-[9px] -left-[2px]">A</Label>
                </span>
                <span className={sel}> budget and the vendor</span>
              </p>
              <p>
                <span className="relative">
                  <span className={sel}>list</span>
                  <Label show={f.stage === "start" && f.query !== "" && "list".startsWith(f.query)} lit={f.key === "S"} className="-top-[9px] -left-[2px]">S</Label>
                </span>
                , the contract renews on the first.
              </p>
              <p className="text-white/40">Ask design for the venue photos.</p>
              <Glass show={marking} className="right-[8px] bottom-[8px] px-[8px] py-[4px] text-[9px]">
                <span className="text-white/40">select </span>
                <span className="text-white/90">{f.query}</span>
                <span className="bg-accent ml-[1px] inline-block h-[1em] w-[2px] translate-y-[1px]" />
              </Glass>
            </div>
          </div>
        </Win>
      </Display>
      <Foot lit={f.key === "A" || f.key === "S" ? ["⇧", f.key] : lodeLit(f.held, f.key)} caption={f.caption} />
    </div>
  );
}

// What you copied: the cards, a letter, the paste.
type ClipFrame = { key: string | null; strip: boolean; pasted: boolean; caption: string };
const clipRest: ClipFrame = { key: null, strip: false, pasted: false, caption: "Writing, and something from earlier is needed" };
const clipStill: ClipFrame = { ...clipRest, strip: true, caption: "Every clip, in the same place every time" };
const clipScript: Step<ClipFrame>[] = [
  [1400, { key: "⇧⌘V", caption: "" }],
  [180, { strip: true, caption: "Every clip, in the same place every time" }],
  [400, { key: null }],
  [1800, { key: "S", caption: "A letter pastes it" }],
  [180, { strip: false, pasted: true, caption: "Pasted where the cursor was" }],
  [400, { key: null }],
  [3000, { ...clipRest }],
];
const cards: [string, string][] = [["A", "swift build -c release"], ["S", "hello@example.com"], ["D", "The launch review moves to Thursday"], ["F", "A8F2CD34EF"], ["G", "lodestar.vaccone.software"]];
export function SceneClipboard() {
  const { ref, active } = useInView();
  const f = useScript(clipRest, clipStill, clipScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <Win name="Mail" tone="#c9c9d1" style={full}>
          <div className="flex h-[calc(100%-16px)]">
            <Sidebar tone="#c9c9d1" />
            <div className="flex-1 p-[10px] font-mono text-[9.5px] leading-[1.9] text-white/70">
              <p>Hi Dana,</p>
              <p>
                Send the invoice to{" "}
                <span className={f.pasted ? "text-white" : ""}>{f.pasted ? "hello@example.com" : ""}</span>
                <span className="bg-accent ml-[1px] inline-block h-[1em] w-[2px] translate-y-[1px]" />
              </p>
            </div>
          </div>
        </Win>
        <div
          className="absolute inset-x-[3%] bottom-[4%] z-30 grid grid-cols-5 gap-[6px] transition-[opacity,transform] duration-200"
          style={{ opacity: f.strip ? 1 : 0, transform: f.strip ? "translateY(0)" : "translateY(6px)" }}
        >
          {cards.map(([k, text]) => (
            <div
              key={k}
              className={`rounded-[6px] border p-[6px] font-mono text-[7.5px] leading-snug backdrop-blur transition-colors ${
                f.key === k ? "border-accent/70 bg-[#2a1a10]/95 text-[#ffd9c2]" : "border-white/10 bg-[#17171b]/95 text-white/70"
              }`}
            >
              <div className="mb-[4px] text-[8px] text-white/90">{k}</div>
              <div className="line-clamp-2">{text}</div>
            </div>
          ))}
        </div>
      </Display>
      <Foot lit={f.key === "⇧⌘V" ? ["⇧", "⌘", "v"] : f.key ? [f.key] : []} caption={f.caption} />
    </div>
  );
}

// What you say: the draft takes dictation, one word early in the sentence
// comes out wrong, and the correction is made without leaving the keys:
// esc, F b flies back to the word with every reachable letter lit, c w
// changes it, and ⏎ places the sentence.
const heard = ["Thanks,", "the", "revised", "bucket", "is", "attached.", "Call", "me", "if", "anything", "looks", "off."];
const heardText = heard.join(" ");
const wrong = "bucket";
const right = "budget";
const wrongAt = heardText.indexOf(wrong);
const fixedText = heardText.replace(wrong, right);

/** The draft's find rule: with F pending, the first instance of each
    character reachable backward from the cursor lights. */
function findLights(text: string, cursor: number): Set<number> {
  const seen = new Set<string>();
  const lit = new Set<number>();
  for (let i = cursor - 1; i >= 0; i--) {
    const c = text[i];
    if (!/[a-z]/i.test(c) || seen.has(c)) continue;
    seen.add(c);
    lit.add(i);
  }
  return lit;
}

type SayStage = "rest" | "dictating" | "normal" | "find" | "jumped" | "changed" | "typed" | "pasted";
type SayFrame = { keys: [string, boolean][]; draft: boolean; words: number; stage: SayStage; typed: string; caption: string };
const noKeys: [string, boolean][] = [];
const sayRest: SayFrame = { keys: noKeys, draft: false, words: 0, stage: "rest", typed: "", caption: "A reply to write" };
const sayStill: SayFrame = { ...sayRest, draft: true, words: heard.length, stage: "dictating", caption: "Speak, and the words appear. ⏎ puts them where your cursor was" };
const typing: Step<SayFrame>[] = right.split("").map((c, i): Step<SayFrame> => [i === 0 ? 700 : 140, { keys: [[c, true]], typed: right.slice(0, i + 1), ...(i === right.length - 1 ? { stage: "typed" as SayStage, caption: "Typed, into the same sentence" } : {}) }]);
const sayScript: Step<SayFrame>[] = [
  [1200, { keys: [["lode", true]], caption: "Hold lode" }],
  [700, { keys: [["lode", true], [".", true]] }],
  [150, { keys: noKeys, draft: true, stage: "dictating", caption: "Speak. The words appear as you say them" }],
  ...heard.map((_, i): Step<SayFrame> => [i === 0 ? 500 : 230, { words: i + 1 }]),
  [900, { caption: "One word, near the start, came out wrong" }],
  [1200, { keys: [["esc", true]], stage: "normal", caption: "esc. The draft becomes an editor" }],
  [350, { keys: noKeys }],
  [900, { keys: [["⇧", true], ["f", true]], stage: "find", caption: "F. Every letter you can jump back to lights up" }],
  [400, { keys: noKeys }],
  [1300, { keys: [["b", true]], stage: "jumped", caption: "b. The cursor flies back to the word" }],
  [350, { keys: noKeys }],
  [900, { keys: [["c", true]], caption: "c, then w. Change the word" }],
  [350, { keys: noKeys }],
  [300, { keys: [["w", true]], stage: "changed" }],
  [350, { keys: noKeys }],
  ...typing,
  [300, { keys: noKeys }],
  [1000, { keys: [["⏎", true]] }],
  [150, { keys: noKeys, draft: false, stage: "pasted", caption: "Placed where your cursor was" }],
  [3400, { ...sayRest }],
];

export function SceneSpeech() {
  const { ref, active } = useInView();
  const f = useScript(sayRest, sayStill, sayScript, active);
  const st = f.stage;
  const lights = st === "find" ? findLights(heardText, heardText.length) : new Set<number>();
  // What the draft shows, as characters, so single letters can light.
  let shown = "";
  if (st === "dictating") shown = heard.slice(0, f.words).join(" ");
  else if (st === "normal" || st === "find" || st === "jumped") shown = heardText;
  else if (st === "changed" || st === "typed")
    shown = heardText.slice(0, wrongAt) + f.typed + heardText.slice(wrongAt + wrong.length);
  const insertAt = st === "changed" || st === "typed" ? wrongAt + f.typed.length : shown.length;
  const block = st === "normal" ? shown.length - 1 : st === "jumped" ? wrongAt : -1;
  const caret = (
    <span key="caret" className="bg-accent inline-block h-[1em] w-[2px] translate-y-[1px]" />
  );
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <Win name="Mail" tone="#c9c9d1" style={full}>
          <div className="flex h-[calc(100%-16px)]">
            <Sidebar tone="#c9c9d1" />
            <div className="flex-1 p-[10px] font-mono text-[9.5px] leading-[1.9] text-white/70">
              <p>Hi Dana,</p>
              <p>
                <span className="text-white">{st === "pasted" ? fixedText : ""}</span>
                <span className="bg-accent ml-[1px] inline-block h-[1em] w-[2px] translate-y-[1px]" />
              </p>
            </div>
          </div>
        </Win>
        <Glass show={f.draft} className="inset-x-[6%] bottom-[5%] px-[3%] py-[2.4%] text-[10px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`inline-block h-[6px] w-[6px] rounded-full ${st === "dictating" ? "bg-accent animate-pulse" : "bg-white/20"}`} />
              <span className="text-white/40">draft</span>
            </span>
            <span className="text-[8px] text-white/40">
              {st === "dictating" ? "listening" : st === "changed" || st === "typed" ? "insert" : "normal"}
            </span>
          </div>
          <p className="mt-[1.5%] min-h-[2.6em] leading-[1.6] text-white/90">
            {shown.split("").flatMap((c, i) => {
              const node = (
                <span
                  key={i}
                  className={
                    i === block
                      ? "bg-white/90 text-[#17171b]"
                      : lights.has(i)
                        ? "text-accent font-medium"
                        : ""
                  }
                >
                  {c}
                </span>
              );
              return block < 0 && i === insertAt ? [caret, node] : [node];
            })}
            {block < 0 && insertAt >= shown.length ? caret : null}
          </p>
          <div className="mt-[1.5%] text-[8px] text-white/40">
            {st === "dictating" ? "⏎ paste · ⇧⏎ new line · esc edit" : "⏎ paste · esc close"}
          </div>
        </Glass>
      </Display>
      <Foot lit={f.keys.filter(([, on]) => on).map(([k]) => k)} caption={f.caption} />
    </div>
  );
}

// The coach: one offer, its evidence, its price, and the accept.
type CoachFrame = { held: boolean; key: string | null; chip: "none" | "offer" | "bound"; caption: string };
const coachRest: CoachFrame = { held: false, key: null, chip: "none", caption: "Mail, reached through the launcher again" };
const coachStill: CoachFrame = { ...coachRest, chip: "offer", caption: "One offer, with its evidence and its price" };
const coachScript: Step<CoachFrame>[] = [
  [1600, { chip: "offer", caption: "One offer, with its evidence and its price" }],
  [3200, { held: true, caption: "Tap lode twice to take it" }],
  [220, { held: false }],
  [180, { key: "lode" }],
  [220, { key: null, chip: "bound", caption: "M is Mail. The launcher will say so until your hand knows" }],
  [3400, { chip: "none" }],
  [1200, { ...coachRest }],
];
export function SceneCoach() {
  const { ref, active } = useInView();
  const f = useScript(coachRest, coachStill, coachScript, active);
  return (
    <div ref={ref} className="select-none">
      <Display title="Mail">
        <Win name="Mail" tone="#c9c9d1" style={full} />
        <Glass show={f.chip !== "none"} className="inset-x-[8%] bottom-[6%] px-[2.6%] py-[2%] text-[10px]">
          {f.chip === "bound" ? (
            <div className="flex items-center justify-between">
              <span className="text-white/90">
                <span className="text-white/40">coach </span>
                <span className="rounded-[3px] border border-white/10 bg-white/[0.06] px-[5px] py-[1px]">M</span>
                <span className="mx-[6px] text-white/50">→</span>Mail
              </span>
              <span className="text-[#ffd9c2]">bound</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-white/90">
                  <span className="text-white/40">coach </span>
                  lode M <span className="text-white/50">→</span> Mail
                </span>
                <span className={`rounded-[3px] border px-[6px] py-[1px] ${f.held ? "border-accent/70 bg-accent/25 text-[#ffd9c2]" : "border-white/10 bg-white/[0.06] text-white/80"}`}>
                  lode lode
                </span>
              </div>
              <div className="mt-[1.6%] text-[8.5px] text-white/50">
                you searched for it 31 times across 6 weeks · about 40 seconds a week · tap lode twice to bind it · lode ⌫ not this one
              </div>
            </>
          )}
        </Glass>
      </Display>
      <Foot lit={f.held || f.key === "lode" ? ["lode"] : []} caption={f.caption} />
    </div>
  );
}
