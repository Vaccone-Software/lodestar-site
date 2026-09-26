"use client";

import { useEffect, useRef, useState } from "react";
import DownloadPill from "@/components/DownloadPill";
import Loop from "@/components/Loop";
import crops from "@/data/hero.json";
import { doors } from "@/data/doors";
import styles from "./Hero.module.css";

type Crop = { x0: number; x1: number; y0: number; y1: number; w: number; h: number };

// Where each rendered loop sits in the render's frame, as the crop Blender
// wrote beside it: the page places it exactly where it was rendered.
function place(crop: Crop): React.CSSProperties {
  return {
    ["--x0" as string]: crop.x0,
    ["--x1" as string]: crop.x1,
    ["--y0" as string]: crop.y0,
    ["--y1" as string]: crop.y1,
    ["--ar" as string]: `${crop.w} / ${crop.h}`,
  };
}

const phone = "(max-width: 760px), (max-aspect-ratio: 1/1)";

export default function Hero({ tag }: { tag: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);

  // 1em is 1% of the frame's width on a desktop, so the headline and the
  // pictures keep their proportions at every size.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = window.matchMedia(phone).matches
        ? ""
        : `${el.offsetWidth / 100}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const table = crops as Record<string, Crop>;
  return (
    <section className={styles.hero} aria-label="Lodestar">
      <div
        ref={stage}
        className={`${styles.stage} ${focus ? styles.focus : ""}`}
      >
        <div
          data-pole
          className={`${styles.obj} ${styles.mark}`}
          style={place(table.mark)}
        >
          <Loop src="/media/hero/mark" className={styles.media} />
        </div>
        <h1 className={`${styles.title} over-sky`}>Master your Mac</h1>
        <div className={`${styles.sub} over-sky`}>
          <p>Free tools that make your Mac second nature</p>
          <DownloadPill fallback={tag} />
          <span className={styles.fine}>Apple silicon · macOS 14 or later</span>
        </div>
        {doors.map((door) => (
          <a
            key={door.slug}
            href={`/${door.slug}`}
            data-k={door.slug}
            className={`${styles.obj} ${styles.door} ${focus === door.slug ? styles.on : ""}`}
            style={{ ...place(table[door.slug]), gridArea: door.slug }}
            aria-label={`${door.name}: ${door.what}`}
            onMouseEnter={() => setFocus(door.slug)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(door.slug)}
            onBlur={() => setFocus(null)}
          >
            <Loop src={`/media/hero/${door.slug}`} className={styles.media} />
            <div className={`${styles.label} over-sky`}>
              <div className={styles.name}>
                {door.name} <span>→</span>
              </div>
              <p className={styles.what}>{door.what}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
