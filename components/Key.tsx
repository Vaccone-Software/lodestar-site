// A key on the page, drawn as the app draws it (design/10-key.md). Lit means
// the one key to press next, in the orange, the way the app's own footer
// lights the key it is waiting on.

const punctuation = new Set([
  ".",
  ",",
  "'",
  ";",
  "/",
  "-",
  "`",
  "\\",
  "[",
  "]",
  "=",
]);

/** A bare keystroke is shown as typed: lowercase. A capital stays only in a
    chord, where Shift or another modifier is part of the key (⇧W, ⌘K). */
export function legend(key: string): string {
  return /^[A-Z]$/.test(key) ? key.toLowerCase() : key;
}

/** The band a legend is centred on: the x-height for a legend that is all
    lowercase, the cap height for anything else; punctuation alone is drawn
    larger, as a speck at the letters' size would be lost. */
export function band(text: string): string {
  if (punctuation.has(text)) return "punct";
  return /^[a-z]+$/.test(text) ? "x" : "";
}

export default function Key({
  children,
  lit,
  down,
  quiet,
  className = "",
}: {
  children: string;
  lit?: boolean;
  down?: boolean;
  quiet?: boolean;
  className?: string;
}) {
  const text = legend(children);
  const classes = [
    "key",
    band(text),
    lit && "lit",
    down && "down",
    quiet && "quiet",
    className,
  ];
  return <kbd className={classes.filter(Boolean).join(" ")}>{text}</kbd>;
}

export function Keys({
  keys,
  lit = [],
  quiet = false,
  className = "",
}: {
  keys: string[];
  lit?: string[];
  quiet?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`.trim()}>
      {keys.map((key, i) =>
        key === "×2" ? (
          <span key={i} className="twice">
            ×2
          </span>
        ) : (
          <Key key={`${key}-${i}`} lit={lit.includes(key)} quiet={quiet}>
            {key}
          </Key>
        ),
      )}
    </span>
  );
}

/** A written sequence: "!A" is a key lit, "then" is the word between two
    presses. Where a page already has its one lit thing (a door page's
    Download), the sequence draws every key at rest. */
export function KeySequence({
  keys,
  lighting = true,
}: {
  keys: string[];
  lighting?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, i) =>
        key === "then" ? (
          <span key={i} className="text-faint mx-1 text-[13px]">
            then
          </span>
        ) : (
          <Key key={i} lit={lighting && key.startsWith("!")}>
            {key.replace(/^!/, "")}
          </Key>
        ),
      )}
    </span>
  );
}
