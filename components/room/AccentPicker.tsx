"use client";

import { presets } from "@/lib/room/accent";
import styles from "./Room.module.css";

/** The Mac's accents, as a row of swatches. The room wears the one you pick,
    and says so when it is your Mac's own. */
export default function AccentPicker({
  accent,
  detected,
  onPick,
}: {
  accent: string;
  /** The preset the Mac's own accent matches, where the browser says. */
  detected: string | null;
  onPick: (hex: string) => void;
}) {
  return (
    <span className={styles.tint}>
      <span className={styles.label}>
        {detected && accent === detected
          ? "In your Mac’s accent"
          : "Wears your Mac’s accent"}
      </span>
      <span className={styles.dots}>
        {presets.map(({ name, hex }) => (
          <button
            key={hex}
            type="button"
            aria-label={name}
            aria-pressed={hex === accent}
            title={name}
            style={{ ["--c" as string]: hex }}
            onClick={() => onPick(hex)}
          />
        ))}
      </span>
    </span>
  );
}
