"use client";

import { useState } from "react";

// A link to this exact lesson. Click copies the full address and says so
// for a moment; the href still works as a plain anchor for anyone who
// would rather right-click it.
export default function Permalink({ anchor }: { anchor: string }) {
  const [copied, setCopied] = useState(false);
  const href = `#${anchor}`;
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}${href}`;
        history.replaceState(null, "", href);
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => {});
      }}
      className="text-faint hover:text-dim ml-3 inline-flex items-baseline gap-1.5 font-mono text-[11px] tracking-[0.06em] transition-colors"
      aria-label="Copy a link to this lesson"
      title="Copy a link to this lesson"
    >
      <span className={copied ? "text-accent" : ""}>{copied ? "copied" : "link"}</span>
    </a>
  );
}
