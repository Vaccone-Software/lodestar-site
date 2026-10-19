"use client";

import { useState } from "react";
import { useScript } from "@/components/room/hooks";
import type { Slug } from "@/lib/room/layout";
import styles from "./Room.module.css";

// The four demos, in the app's own grammar, each checked against DESIGN.md
// and the source. They are drawn, not recorded, and they play on a loop that
// starts from its own beginning; reduced motion plays one and rests on its
// last frame.

function Cap({
  children,
  lit,
  down,
}: {
  children: React.ReactNode;
  lit?: boolean;
  down?: boolean;
}) {
  return (
    <span className={["key", lit && "lit", down && "down"].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

// MARK: - Write

const sentence = "See you tomorow at ten.";
const misspelt = "tomorow";

/** The editor marks a word the moment it is finished, offers its fix on a
    letter with `lode ⇥`, and the letter applies it in the field you were
    writing in. */
function Write() {
  const [typed, setTyped] = useState("");
  const [fixed, setFixed] = useState(false);
  const [lens, setLens] = useState<"off" | "open" | "press">("off");
  const [note, setNote] = useState("");

  useScript(
    async (wait) => {
      setTyped("");
      setFixed(false);
      setLens("off");
      setNote("");
      for (let i = 1; i <= sentence.length; i++) {
        setTyped(sentence.slice(0, i));
        await wait(55);
      }
      await wait(900);
      setLens("open");
      await wait(900);
      setLens("press");
      await wait(200);
      setLens("off");
      setFixed(true);
      setNote("Fixed where you were writing");
      await wait(1800);
    },
    { gap: 1000 },
  );

  const at = sentence.indexOf(misspelt);
  const ended = typed.length > at + misspelt.length;
  return (
    <div className={styles.demo}>
      <div className={styles.sheet}>
        <div className={styles.meta}>Mail · To Sam · Thursday</div>
        <div className={styles.hand}>
          {fixed ? (
            "See you tomorrow at ten."
          ) : ended ? (
            <>
              {typed.slice(0, at)}
              <span className={styles.under}>{misspelt}</span>
              {typed.slice(at + misspelt.length)}
            </>
          ) : (
            typed
          )}
        </div>
      </div>
      {lens === "off" ? null : (
        <div className={styles.fix}>
          tomorrow
          <Cap lit>lode</Cap>
          <Cap lit>⇥</Cap>
          <Cap lit={lens === "press"} down={lens === "press"}>
            A
          </Cap>
        </div>
      )}
      <div className={styles.note}>{note}</div>
    </div>
  );
}

// MARK: - Switch

const apps = [
  { name: "Browser", letter: "B", left: "0", top: 0 },
  { name: "Notes", letter: "N", left: "13%", top: 16 },
  { name: "Mail", letter: "M", left: "26%", top: 32 },
];

/** Holding lode alone peeks the map: every letter and the app it opens,
    with the icon. A letter then brings the app forward, or opens it. */
function Switch() {
  const [map, setMap] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [front, setFront] = useState(false);
  const [note, setNote] = useState("");

  useScript(
    async (wait) => {
      setMap(false);
      setPressed(false);
      setFront(false);
      setNote("Hold lode, and the map shows every letter");
      await wait(1100);
      setMap(true);
      await wait(1200);
      setPressed(true);
      await wait(260);
      setMap(false);
      setFront(true);
      setNote("Mail, by the letter you gave it");
      await wait(2200);
    },
    { gap: 1000 },
  );

  return (
    <div className={styles.demo}>
      <div className={styles.wins}>
        {apps.map((app, i) => (
          <div
            key={app.name}
            className={`${styles.win} ${front && app.name === "Mail" ? styles.front : ""}`}
            style={{
              left: app.left,
              top: app.top,
              zIndex: app.name === "Mail" ? (front ? 5 : 0) : i + 1,
            }}
          >
            <div className={styles.bar}>
              <i />
              <i />
              <i />
              <span>{app.name}</span>
            </div>
          </div>
        ))}
        {map ? (
          <div className={styles.map}>
            {apps.map((app) => (
              <div key={app.name}>
                <Cap lit={pressed && app.name === "Mail"}>{app.letter}</Cap>
                {app.name}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className={styles.note}>{note}</div>
    </div>
  );
}

// MARK: - Keep

/** The strip stands over the keys that paste: the newest on J, under the
    right index finger, a step taller, then K, L and the semicolon. The
    letter picks the clip and pastes it as it was copied. */
const clips = [
  { letter: "J", text: "Notes for Thursday" },
  { letter: "K", text: "12 ft" },
  { letter: "L", text: "#FF4F00", swatch: true },
  { letter: ";", text: "lodestar.app" },
];

function Keep() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState(false);
  const [note, setNote] = useState("");

  useScript(
    async (wait) => {
      setOpen(false);
      setChosen(false);
      setNote("⇧⌘V, and the strip is there, complete");
      await wait(1100);
      setOpen(true);
      await wait(1400);
      setChosen(true);
      await wait(500);
      setOpen(false);
      setNote("Pasted where you were");
      await wait(2000);
    },
    { gap: 1000 },
  );

  return (
    <div className={styles.demo}>
      {open ? (
        <div className={styles.strip}>
          {clips.map((clip, i) => (
            <div
              key={clip.letter}
              className={`${styles.clip} ${chosen && clip.swatch ? styles.raised : ""}`}
              style={{
                height: 92 - i * 6,
                gridColumn: i === 0 ? "span 2" : undefined,
              }}
            >
              <Cap lit={chosen && clip.swatch}>{clip.letter}</Cap>
              {clip.swatch ? <div className={styles.swatch} /> : null}
              <span>{clip.text}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.note}>{note}</div>
    </div>
  );
}

// MARK: - Speak

const spoken = "Let’s move the review to Friday, and send the draft.".split(
  " ",
);

/** The draft's top edge is the voice, lit in the accent while the microphone
    is live and as long as the voice is loud. Words arrive grey while they
    can still change and turn to ink when every pass is done. The draft pastes
    where your cursor was when you press return, and not before. */
function Speak() {
  const [heard, setHeard] = useState(0);
  const [settled, setSettled] = useState(0);
  const [level, setLevel] = useState(0);
  const [pasted, setPasted] = useState(false);

  useScript(
    async (wait) => {
      setHeard(0);
      setSettled(0);
      setLevel(0);
      setPasted(false);
      for (let i = 1; i <= spoken.length; i++) {
        setHeard(i);
        setLevel(20 + Math.random() * 60);
        // A word settles a little after it is heard.
        setSettled(Math.max(0, i - 2));
        await wait(230);
      }
      setLevel(0);
      await wait(520);
      setSettled(spoken.length);
      await wait(800);
      setPasted(true);
      await wait(1900);
    },
    { gap: 1000 },
  );

  return (
    <div className={styles.demo}>
      <div className={styles.draft}>
        <span className={styles.light} style={{ width: `${level}%` }} />
        <div className={styles.text}>
          {spoken.slice(0, heard).map((word, i) => (
            <span key={i} className={i >= settled ? styles.grey : undefined}>
              {word}{" "}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.note}>
        {pasted ? (
          <>
            <Cap lit>⏎</Cap> Pasted where your cursor was
          </>
        ) : null}
      </div>
    </div>
  );
}

/** A door's demo. */
export default function Demo({ slug }: { slug: Slug }) {
  switch (slug) {
    case "write":
      return <Write />;
    case "switch":
      return <Switch />;
    case "keep":
      return <Keep />;
    case "speak":
      return <Speak />;
  }
}
