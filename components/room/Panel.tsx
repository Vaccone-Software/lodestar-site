"use client";

import Demo from "@/components/room/Demos";
import type { Door } from "@/data/doors";
import { chapters } from "@/data/room";
import styles from "./Room.module.css";

/** A door's panel: the pane a room opens on purpose, complete at once, with
    what the door says, a demo of it and the keys that reach it. */
export default function Panel({
  door,
  index,
  style,
  onClose,
}: {
  door: Door;
  index: number;
  style: React.CSSProperties;
  onClose: () => void;
}) {
  const chapter = chapters[door.slug];
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="panel-title"
      className={styles.panel}
      style={style}
    >
      <div id="panel-title" className={styles.title}>
        <span className="key lit">{index + 1}</span>
        {door.name}
      </div>
      <p className={styles.say}>{chapter.say}</p>
      <p className={styles.body}>{chapter.body}</p>
      <div className={styles.stagebox}>
        <Demo slug={door.slug} />
      </div>
      <div className={styles.foot}>
        <button type="button" onClick={onClose}>
          <span className="key">esc</span>Back
        </button>
        <span className={styles.keys}>
          {chapter.foot.map((item, i) =>
            "key" in item ? (
              <span key={i} className={item.lit ? "key lit" : "key"}>
                {item.key}
              </span>
            ) : (
              <span key={i}>{item.word}</span>
            ),
          )}
        </span>
      </div>
    </div>
  );
}
