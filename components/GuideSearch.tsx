"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { guide } from "@/data/guide";
import Key, { Keys as KeyCaps } from "@/components/Key";

// The launcher's idea, turned on the guide: type what you want to do, and
// the lessons that answer it remain. Empty, it lists the pages.
type Hit = {
  page: string;
  slug: string;
  title: string;
  keys: string[];
  rule: string;
  hidden?: boolean;
};

const index: Hit[] = guide.flatMap((page) =>
  [page.first, ...page.ready].map((l) => ({
    page: page.name,
    slug: page.slug,
    title: l.title,
    keys: l.keys,
    rule: l.rule,
    hidden: l.hidden,
  })),
);

function anchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function GuideSearch() {
  const [q, setQ] = useState("");
  const field = useRef<HTMLInputElement>(null);
  // Slash searches, as it does in Keep and the draft.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || document.activeElement === field.current) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      event.preventDefault();
      field.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return index.filter((h) => {
      const hay =
        `${h.page} ${h.title} ${h.rule} ${h.keys.join(" ")}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [q]);
  return (
    <div>
      <label className="well flex h-[52px] items-center gap-3 px-4 focus-within:outline-1 focus-within:-outline-offset-1 focus-within:outline-[rgb(241_235_226/0.24)] focus-within:outline-solid">
        <input
          ref={field}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to do?"
          className="text-ink placeholder:text-dim caret-accent w-full bg-transparent text-[16px] outline-none"
          // The well shows the focus with its deeper edge; the page's
          // focus outline is unlayered and would draw a second ring.
          style={{ outline: "none" }}
          autoComplete="off"
          spellCheck={false}
        />
        {q ? (
          <span className="text-dim shrink-0 text-[13px]">
            {hits.length === 1 ? "1 lesson" : `${hits.length} lessons`}
          </span>
        ) : (
          <Key quiet>/</Key>
        )}
      </label>
      {q ? (
        <ul className="pane mt-4 grid gap-0.5 p-2">
          {hits.map((h) => (
            <li key={`${h.slug}-${h.title}`}>
              <a
                href={`/guide/${h.slug}#${anchor(h.title)}`}
                className="hover:bg-raised block rounded-[10px] px-4 py-4 transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-dim text-[13px] font-medium">
                    {h.page}
                  </span>
                  {h.hidden ? (
                    <span className="text-faint text-[13px]">
                      Few know this
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="text-ink text-[18px] font-semibold tracking-[-0.01em]">
                    {h.title}
                  </span>
                  {h.keys.length ? <KeyCaps keys={h.keys} /> : null}
                </div>
                <p className="text-dim mt-2 max-w-[62ch] text-[16px] leading-[1.5]">
                  {h.rule}
                </p>
              </a>
            </li>
          ))}
          {hits.length === 0 ? (
            <li className="text-dim px-4 py-6 text-[16px]">
              Nothing answers that yet. Try a verb: open, copy, paste, undo,
              save.
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
