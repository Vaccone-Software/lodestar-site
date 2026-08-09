"use client";

import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(command).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="group border-hairline flex w-full items-center justify-between gap-4 border bg-white/[0.03] px-4 py-3 text-left text-[13px] transition-colors hover:border-white/25 sm:text-sm"
    >
      <span>
        <span className="text-accent">$ </span>
        {command}
      </span>
      <span
        className={copied ? "text-accent" : "text-faint group-hover:text-dim"}
      >
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
