"use client";

import { useMemo, useState } from "react";
import { guide } from "@/data/guide";
import { Keys as KeyCaps } from "@/components/Key";

// The launcher's idea, turned on the guide: type what you want to do, and
// the lessons that answer it remain. Empty, it lists the pages.
type Hit = { page: string; slug: string; title: string; keys: string[]; rule: string; hidden?: boolean };

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
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function GuideSearch() {
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    return index.filter((h) => {
      const hay = `${h.page} ${h.title} ${h.rule} ${h.keys.join(" ")}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [q]);
  return (
    <div>
      <label className="border-hairline flex items-center gap-3 border bg-white/[0.03] px-4 py-3 focus-within:border-white/30">
        <span className="text-accent font-mono text-[13px]">/</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to do?"
          className="text-ink placeholder:text-faint w-full bg-transparent text-[16px] outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {q ? (
          <span className="text-faint font-mono text-[11px]">
            {hits.length === 1 ? "1 lesson" : `${hits.length} lessons`}
          </span>
        ) : null}
      </label>
      {q ? (
        <ul className="border-hairline mt-6 border-t">
          {hits.map((h) => (
            <li key={`${h.slug}-${h.title}`} className="border-hairline border-b">
              <a href={`/guide/${h.slug}#${anchor(h.title)}`} className="group block py-4">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">{h.page}</span>
                  {h.hidden ? <span className="glint font-mono text-[10px]">✦ few know this</span> : null}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="font-display text-ink text-[20px] group-hover:underline group-hover:decoration-white/30 group-hover:underline-offset-4">{h.title}</span>
                  {h.keys.length ? <KeyCaps keys={h.keys} className="text-[14px]" /> : null}
                </div>
                <p className="text-dim mt-2 max-w-[62ch] text-[15px] leading-[1.6]">{h.rule}</p>
              </a>
            </li>
          ))}
          {hits.length === 0 ? (
            <li className="text-dim py-6 text-[15px]">Nothing answers that yet. Try a verb: open, copy, paste, undo, save.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
