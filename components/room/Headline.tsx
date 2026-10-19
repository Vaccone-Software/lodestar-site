"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useScript } from "@/components/room/hooks";
import { headline, subline } from "@/data/room";
import styles from "./Room.module.css";

/** Where Write's fix chip stands, under the word it mends. */
type Chip = { left: number; top: number };

type Phase = "idle" | "typo" | "lens" | "press";

/** The room's voice: the headline arrives word by word, grey while it is
    heard and settling as it is understood. Write acts on it, because it can
    do so truthfully: the last word is misspelled, a thin line finds it, the
    lens offers the fix and a letter mends it. No other door acts on the
    page, since the site never shows Lodestar doing what it does not do. */
export default function Headline({
  mending,
  ref,
}: {
  /** Write's door is under the pointer. */
  mending: boolean;
  ref?: React.Ref<HTMLDivElement>;
}) {
  const words = headline.split(" ");
  const last = words.length - 1;
  const word = useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [chip, setChip] = useState<Chip | null>(null);

  useScript(
    async (wait) => {
      setPhase("idle");
      await wait(200);
      setPhase("typo");
      await wait(700);
      const target = word.current;
      if (target) {
        setChip({
          left: target.offsetLeft,
          top: target.offsetTop + target.offsetHeight + 16,
        });
      }
      setPhase("lens");
      await wait(1000);
      setPhase("press");
      await wait(180);
      setPhase("idle");
      setChip(null);
    },
    { active: mending },
  );

  // Put away mid-way, the word is mended where it stands.
  useEffect(
    () => () => {
      setPhase("idle");
      setChip(null);
    },
    [mending],
  );

  const wrong = mending && phase !== "idle";
  return (
    <div ref={ref} className={styles.voice}>
      <h1 aria-label={headline}>
        {words.map((text, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span
              ref={i === last ? word : undefined}
              aria-hidden="true"
              className={`${styles.word} ${i === last && wrong ? styles.typo : ""}`}
              style={{ ["--n" as string]: i }}
            >
              {i === last && wrong ? "awya" : text}
            </span>
          </Fragment>
        ))}
      </h1>
      <p>{subline}</p>
      {mending && chip ? (
        <div className={styles.chip} style={chip}>
          {words[last]}
          <span className="key lit">lode</span>
          <span className="key lit">⇥</span>
          <span className={`key ${phase === "press" ? "lit down" : ""}`}>
            A
          </span>
        </div>
      ) : null}
    </div>
  );
}
