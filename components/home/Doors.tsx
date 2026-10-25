"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Key from "@/components/Key";
import { useScript, type Wait } from "@/components/home/hooks";
import styles from "./Home.module.css";

// The four doors, each a small Lodestar surface drawn in Ceramic. A door is
// still until it is chosen: its still says what it does in one frame, and
// while it is chosen it plays from there, pressing the keys on its row in
// the launcher as it goes. Put away, it goes back to its still.

/** The keys on a door's row in the launcher, which a door presses as it
    plays: hold one down or let it up, and change Switch's letter. */
export type RowKeys = {
  hold: (name: string, down: boolean) => void;
  letter: (letter: string) => void;
};

export type DoorProps = { active: boolean; rows: RowKeys };

/** A press: the side gives up, a beat, and the key stands again. */
async function press(set: (down: boolean) => void, wait: Wait, ms = 150) {
  set(true);
  await wait(ms);
  set(false);
  await wait(90);
}

// MARK: - Write

const lines = [
  {
    text: "Hi Ana, see you tomorow at ten.",
    wrong: "tomorow",
    right: "tomorrow",
  },
  {
    text: "I will bring the revised schedual.",
    wrong: "schedual",
    right: "schedule",
  },
  { text: "The room is booked untill noon.", wrong: "untill", right: "until" },
  { text: "Thanks for your patiance.", wrong: "patiance", right: "patience" },
];
const fixed = (i: number) =>
  lines[i].text.replace(lines[i].wrong, lines[i].right);

type Line = { text: string; under?: [number, number]; caret?: boolean };

const writeStill = (): Line[] => {
  const at = lines[1].text.indexOf(lines[1].wrong);
  return [
    { text: fixed(0) },
    { text: lines[1].text, under: [at, at + lines[1].wrong.length] },
  ];
};

/** A word is caught as it ends, the fix is offered on lode ⇥, and the word
    is put right where you were writing. */
export function WriteDoor({ active, rows }: DoorProps) {
  const [shown, setShown] = useState<Line[]>(writeStill);
  const [offer, setOffer] = useState<string | null>(lines[1].right);
  const [keys, setKeys] = useState<[boolean, boolean]>([false, false]);
  const [at, setAt] = useState({ left: 0, top: 0 });
  const body = useRef<HTMLDivElement>(null);
  const under = useRef<HTMLSpanElement>(null);
  const offerCard = useRef<HTMLDivElement>(null);
  const cycle = useRef(0);

  useEffect(() => {
    if (active) return;
    cycle.current = 0;
    setShown(writeStill());
    setOffer(lines[1].right);
    setKeys([false, false]);
  }, [active]);

  // The offer stands just under the word it puts right. Measured in layout
  // offsets, which a door grown by a transform (a door's own page) leaves
  // alone.
  useLayoutEffect(() => {
    const word = under.current;
    const box = body.current;
    const card = offerCard.current;
    if (!offer || !word || !box) return;
    const width = card?.offsetWidth ?? 200;
    setAt({
      left: Math.max(
        8,
        Math.min(word.offsetLeft - 10, box.clientWidth - width - 8),
      ),
      top: word.offsetTop + word.offsetHeight + 6,
    });
  }, [offer, shown]);

  const fix = async (wait: Wait) => {
    await Promise.all([
      press((d) => setKeys(([, b]) => [d, b]), wait),
      press((d) => rows.hold("write-1", d), wait),
    ]);
    await Promise.all([
      press((d) => setKeys(([a]) => [a, d]), wait),
      press((d) => rows.hold("write-2", d), wait),
    ]);
    setOffer(null);
  };

  useScript(async (wait) => {
    const n = cycle.current++;
    if (n === 0) {
      // From the still: the word already caught is put right.
      await wait(500);
      await fix(wait);
      setShown((s) => [s[0], { text: fixed(1) }]);
      await wait(700);
      return;
    }
    const i = (n + 1) % lines.length;
    const { text, wrong, right } = lines[i];
    const start = text.indexOf(wrong);
    const end = start + wrong.length;
    const typing = (line: Line) => setShown((s) => [...s.slice(0, -1), line]);
    setShown((s) => [...s, { text: "", caret: true }].slice(-3));
    let corrected = false;
    for (let c = 1; c <= text.length; c++) {
      const typed = corrected
        ? text.slice(0, start) + right + text.slice(end, c)
        : text.slice(0, c);
      typing({
        text: typed,
        caret: true,
        under: !corrected && c > end ? [start, end] : undefined,
      });
      if (c === end + 1 && !corrected) {
        await wait(520);
        setOffer(right);
        await wait(900);
        await fix(wait);
        corrected = true;
        typing({
          text: text.slice(0, start) + right + text.slice(end, c),
          caret: true,
        });
      }
      await wait(38 + Math.random() * 40);
    }
    setShown((s) => [...s.slice(0, -1), { text: text.replace(wrong, right) }]);
    await wait(900);
  }, active);

  return (
    <div className={styles.pic}>
      <div className={styles.mailTo}>
        <span>To</span>
        <span>Ana Ruiz</span>
      </div>
      <div ref={body} className={styles.mailBody}>
        {shown.map((line, i) => (
          <div key={i} className={styles.mailLine}>
            {line.under ? (
              <>
                {line.text.slice(0, line.under[0])}
                <span ref={under} className={styles.under}>
                  {line.text.slice(line.under[0], line.under[1])}
                </span>
                {line.text.slice(line.under[1])}
              </>
            ) : (
              line.text
            )}
            {line.caret ? <span className={styles.caret} /> : null}
          </div>
        ))}
        {offer ? (
          <div
            ref={offerCard}
            className={styles.offer}
            style={{ left: at.left, top: at.top }}
          >
            <span className={styles.offerWord}>{offer}</span>
            <span className="inline-flex gap-1">
              <Key down={keys[0]}>lode</Key>
              <Key down={keys[1]}>⇥</Key>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// MARK: - Switch

const windows = [
  { letter: "m", name: "Mail", left: "7%", top: "8%" },
  { letter: "f", name: "Figma", left: "15%", top: "20%" },
  { letter: "s", name: "Safari", left: "24%", top: "32%" },
  { letter: "n", name: "Notes", left: "33%", top: "44%" },
];
const widths = [
  [80, 62, 74, 48, 66, 82, 40, 58],
  [44, 72, 66, 82, 40, 74, 58, 48],
  [66, 52, 48, 74, 82, 40, 66, 58],
  [58, 70, 82, 40, 66, 48, 74, 62],
];

/** lode and a letter: that app comes to the front and fills the display. */
export function SwitchDoor({ active, rows }: DoorProps) {
  const [order, setOrder] = useState(["m", "f", "s", "n"]);
  const [front, setFront] = useState<string | null>(null);
  const cycle = useRef(0);

  useEffect(() => {
    if (active) return;
    cycle.current = 0;
    setOrder(["m", "f", "s", "n"]);
    setFront(null);
    rows.letter("m");
  }, [active, rows]);

  useScript(async (wait) => {
    const n = cycle.current++;
    const letter = ["f", "s", "m", "n"][n % 4];
    await wait(n ? 1100 : 350);
    rows.hold("switch-1", true);
    await wait(220);
    rows.letter(letter);
    await press((d) => rows.hold("switch-2", d), wait, 130);
    setOrder((o) => [...o.filter((l) => l !== letter), letter]);
    setFront(letter);
    rows.hold("switch-1", false);
  }, active);

  return (
    <div className={styles.pic}>
      {windows.map((w, i) => {
        const chosen = front === w.letter;
        return (
          <div
            key={w.letter}
            className={`${styles.mini} ${chosen ? `${styles.max} night` : ""}`}
            style={{
              left: w.left,
              top: w.top,
              zIndex: order.indexOf(w.letter) + 1,
            }}
          >
            <div className={styles.miniTitle}>
              <span>{w.name}</span>
              <Key>{w.letter}</Key>
            </div>
            {widths[i].map((width, j) => (
              <div
                key={j}
                className={styles.line}
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// MARK: - Keep

const clips = [
  { value: "#FF4F00", note: "International Orange" },
  { value: "12 ft", note: "3.66 m" },
  { value: "4 × 18.50", note: "74" },
  { value: "Invoice 2209", note: "Mail" },
  { value: "apple.com/mac", note: "Safari" },
  { value: "North door", note: "Messages" },
  { value: "1761300000", note: "Six hours ago" },
];
const letters = ["a", "s", "d", "f"];

/** Every copy is kept under a letter; ⇧⌘V and the letter paste it. */
export function KeepDoor({ active, rows }: DoorProps) {
  const [kept, setKept] = useState(clips.slice(1, 5));
  const [chosen, setChosen] = useState(-1);
  const [down, setDown] = useState(-1);
  const cycle = useRef(0);
  const next = useRef(5);

  useEffect(() => {
    if (active) return;
    cycle.current = 0;
    next.current = 5;
    setKept(clips.slice(1, 5));
    setChosen(-1);
    setDown(-1);
  }, [active]);

  useScript(async (wait) => {
    const n = cycle.current++;
    await wait(n ? 1500 : 400);
    await press((d) => rows.hold("keep-1", d), wait, 220);
    const pick = [2, 1, 3, 1][n % 4];
    setChosen(pick);
    await press((d) => setDown(d ? pick : -1), wait);
    await wait(1000);
    const clip = clips[next.current++ % clips.length];
    setKept((k) => [clip, ...k].slice(0, 4));
    setChosen(-1);
  }, active);

  return (
    <div className={styles.pic}>
      <div className={styles.cards}>
        {kept.map((clip, i) => (
          <div
            key={`${clip.value}-${i}`}
            className={`${styles.clip} ${i === chosen ? `${styles.clipChosen} night` : ""}`}
          >
            <Key down={down === i}>{letters[i]}</Key>
            <span className={styles.clipValue}>{clip.value}</span>
            <span className={styles.clipNote}>{clip.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// MARK: - Speak

const said = [
  { text: "On my way, ten minutes out", reply: "We just sat down" },
  { text: "Order me the soup please", reply: "Done" },
  { text: "Parking now, see you inside", reply: "See you" },
  { text: "Yes, still coming to dinner", reply: "Good, table by the window" },
];
type Bubble = { id: number; out: boolean; text: string };
const speakThread = (): Bubble[] => [
  { id: 1, out: false, text: "Marlow on Fifth. We got the big table" },
  { id: 2, out: true, text: "Perfect, leaving now" },
  { id: 3, out: false, text: "Are you still coming to dinner?" },
];
/** Words in the draft: settled ones in ink, ones still being heard in grey. */
type Draft = { settled: string; hearing: string };
const speakStill: Draft = {
  settled: "Yes, still coming",
  hearing: "to dinner",
};

/** Talk into the draft: words arrive grey, settle as they are understood,
    and return lands them where you were writing. */
export function SpeakDoor({ active, rows }: DoorProps) {
  const [thread, setThread] = useState<Bubble[]>(speakThread);
  const [draft, setDraft] = useState<Draft>(speakStill);
  const [state, setState] = useState("Listening");
  const [talking, setTalking] = useState(false);
  const [send, setSend] = useState(false);
  const [meter, setMeter] = useState([3, 3, 3, 3, 3]);
  const cycle = useRef(0);
  const id = useRef(10);

  useEffect(() => {
    if (active) return;
    cycle.current = 0;
    setThread(speakThread());
    setDraft(speakStill);
    setState("Listening");
    setTalking(false);
    setSend(false);
  }, [active]);

  useEffect(() => {
    if (!talking) return void setMeter([3, 3, 3, 3, 3]);
    const timer = window.setInterval(
      () => setMeter((m) => m.map(() => 3 + Math.round(Math.random() * 9))),
      110,
    );
    return () => window.clearInterval(timer);
  }, [talking]);

  const say = (out: boolean, text: string) =>
    setThread((t) => [...t, { id: id.current++, out, text }].slice(-4));

  const land = async (wait: Wait, text: string, reply: string) => {
    await press(setSend, wait);
    say(true, text);
    setDraft({ settled: "", hearing: "" });
    setState("Landed in Messages");
    await wait(1000);
    say(false, reply);
  };

  useScript(async (wait) => {
    const n = cycle.current++;
    if (n === 0) {
      // From the still: the sentence settles and is sent.
      await wait(500);
      setDraft({ settled: "Yes, still coming to dinner", hearing: "" });
      await wait(700);
      await land(
        wait,
        "Yes, still coming to dinner",
        "Good, table by the window",
      );
      return;
    }
    const { text, reply } = said[(n - 1) % said.length];
    const words = text.split(" ");
    await wait(1000);
    await Promise.all([
      press((d) => rows.hold("speak-1", d), wait),
      wait(60).then(() => press((d) => rows.hold("speak-2", d), wait)),
    ]);
    setState("Listening");
    await wait(350);
    setTalking(true);
    for (let i = 1; i <= words.length; i++) {
      const settled = Math.max(0, i - 2);
      setDraft({
        settled: words.slice(0, settled).join(" "),
        hearing: words.slice(settled, i).join(" "),
      });
      await wait(260 + Math.random() * 120);
    }
    setTalking(false);
    await wait(300);
    setDraft({ settled: text, hearing: "" });
    await wait(700);
    await land(wait, text, reply);
  }, active);

  return (
    <div className={styles.pic}>
      <div className={styles.thread}>
        {thread.map((bubble) => (
          <div
            key={bubble.id}
            className={`${styles.bubble} ${bubble.out ? styles.out : styles.in}`}
          >
            {bubble.text}
          </div>
        ))}
      </div>
      <div className={styles.draft}>
        <div className={styles.draftHead}>
          <span>
            <span className={styles.meter} aria-hidden="true">
              {meter.map((h, i) => (
                <i key={i} style={{ height: h }} />
              ))}
            </span>
            {state}
          </span>
          <Key down={send}>⏎</Key>
        </div>
        <div className={styles.draftText}>
          {draft.settled}
          {draft.settled && draft.hearing ? " " : ""}
          <span className={styles.hearing}>{draft.hearing}</span>
          <span className={styles.block} />
        </div>
      </div>
    </div>
  );
}
