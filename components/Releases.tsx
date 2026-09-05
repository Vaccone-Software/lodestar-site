"use client";

import { useEffect, useState } from "react";
import { parseReleases, releasesUrl, type Release } from "@/lib/releases";

/* The notes arrive hard-wrapped at the width they were written at.
   Blank lines separate paragraphs; single newlines are only the wrap. */
function paragraphs(body: string): string[] {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

/* Release names read "Lodestar v0.24.1: the tagline". The tag and date
   line already carries the version, so the heading keeps the tagline. */
function heading(release: Release): string {
  const match = release.name.match(/^Lodestar v[\d.]+:\s*(.+)$/);
  return match ? match[1] : release.name;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* Formatted from the ISO string itself: a Date object would shift the
   day with the reader's timezone and split server from client. */
function shown(date: string): string {
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${months[month - 1]} ${day}, ${year}`;
}

export default function Releases({ fallback }: { fallback: Release[] }) {
  const [items, setItems] = useState(fallback);
  useEffect(() => {
    fetch(releasesUrl)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const parsed = parseReleases(data);
        if (parsed.length) setItems(parsed);
      })
      .catch(() => {});
  }, []);
  return (
    <div className="space-y-16">
      {items.map((release) => (
        <article key={release.tag}>
          <h2 className="font-display text-ink text-[clamp(1.3rem,2.4vw,1.7rem)] leading-tight font-normal tracking-[-0.015em]">
            {heading(release)}
          </h2>
          <p className="text-faint mt-3 flex items-center gap-3 font-mono text-[11px]">
            <span className="key text-[13px]">{release.tag}</span>
            <span>{shown(release.date)}</span>
          </p>
          <div className="text-dim mt-5 max-w-[58ch] space-y-4 text-[clamp(1rem,1.25vw,1.08rem)] leading-[1.62]">
            {paragraphs(release.body).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
