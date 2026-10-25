"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Key from "@/components/Key";
import { KeepDoor, SpeakDoor, SwitchDoor, WriteDoor, type RowKeys } from "@/components/home/Doors";
import styles from "./Home.module.css";

// A door's page shows the same window the homepage does, grown to fill its
// half of the page and always playing, with the door's keys beneath it
// pressed as the picture presses them.

const base = { width: 340, height: 300 };

const pictures = { write: WriteDoor, switch: SwitchDoor, keep: KeepDoor, speak: SpeakDoor };

const gestures: Record<keyof typeof pictures, { name: string; legend: string }[]> = {
  write: [
    { name: "write-1", legend: "lode" },
    { name: "write-2", legend: "⇥" },
  ],
  switch: [
    { name: "switch-1", legend: "lode" },
    { name: "switch-2", legend: "letter" },
  ],
  keep: [{ name: "keep-1", legend: "⇧⌘V" }],
  speak: [
    { name: "speak-1", legend: "lode" },
    { name: "speak-2", legend: "." },
  ],
};

export default function DoorShow({ slug, name }: { slug: keyof typeof pictures; name: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [down, setDown] = useState<Record<string, boolean>>({});
  const [letter, setLetter] = useState("m");
  const rows: RowKeys = useMemo(
    () => ({ hold: (key, d) => setDown((s) => (s[key] === d ? s : { ...s, [key]: d })), letter: setLetter }),
    [],
  );

  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const fit = () => setScale(element.clientWidth / base.width);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Picture = pictures[slug];
  return (
    <figure className="m-0 grid w-full justify-items-center gap-5">
      <div ref={frame} className="relative w-full" style={{ aspectRatio: `${base.width} / ${base.height}` }} aria-hidden="true">
        <div
          className={`${styles.door} ${styles.chosen} clay absolute top-0 left-0 origin-top-left`}
          style={{ ...base, transform: `scale(${scale})`, cursor: "default" }}
        >
          <span className={styles.doorName}>{name}</span>
          <Picture active rows={rows} />
        </div>
      </div>
      <figcaption className="inline-flex items-center gap-1">
        {gestures[slug].map((g) => (
          <Key key={g.name} down={!!down[g.name]}>
            {g.legend === "letter" ? letter : g.legend}
          </Key>
        ))}
      </figcaption>
    </figure>
  );
}
