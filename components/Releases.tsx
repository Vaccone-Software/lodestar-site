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

/* A release's tagline is either in its name ("Lodestar v0.24.1: the
   tagline") or, as the notes are written now, the first short paragraph
   of its body. The tag already carries the version, so the heading keeps
   only the tagline, and the body keeps what follows it. */
function split(release: Release): { title: string; body: string[] } {
  const all = paragraphs(release.body);
  const named = release.name.match(/^Lodestar v?[\d.]+:\s*(.+)$/);
  if (named) return { title: named[1], body: all };
  if (all.length > 1 && all[0].length <= 90)
    return { title: all[0].replace(/\.$/, ""), body: all.slice(1) };
  return { title: release.name, body: all };
}
function heading(release: Release): string {
  return split(release).title;
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

function parts(tag: string): [number, number, number] {
  const [a, b, c] = tag.replace(/^v/, "").split(".").map(Number);
  return [a || 0, b || 0, c || 0];
}

/* A series is one minor version and the patches that kept its promises.
   The release that named it (x.y.0) opens the series; when the list the
   API returns does not reach back to it, the newest patch stands in. */
type Series = {
  key: string;
  kind: "major" | "minor";
  opener: Release | null;
  patches: Release[];
  newest: Release;
};

function group(releases: Release[]): Series[] {
  const map = new Map<string, Series>();
  for (const release of releases) {
    const [major, minor, patch] = parts(release.tag);
    const key = `${major}.${minor}`;
    let series = map.get(key);
    if (!series) {
      series = {
        key,
        kind: minor === 0 ? "major" : "minor",
        opener: null,
        patches: [],
        newest: release,
      };
      map.set(key, series);
    }
    if (patch === 0) series.opener = release;
    else series.patches.push(release);
  }
  return [...map.values()];
}

function Body({ release }: { release: Release }) {
  return (
    <div className="text-dim max-w-[58ch] space-y-4 text-[clamp(1rem,1.25vw,1.08rem)] leading-[1.62]">
      {split(release).body.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
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
  const series = group(items);
  return (
    <div className="space-y-20">
      {series.map((s) => {
        const lead = s.opener ?? s.newest;
        const patches = s.patches.filter((p) => p.tag !== lead.tag);
        return (
          <section key={s.key}>
            {/* The series: a keycap for the version, its kind, and the
                tagline of the release that opened it. */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="key text-[22px]">{s.key}</span>
              <span className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
                {s.kind} · {shown(lead.date)}
              </span>
            </div>
            <h2 className="font-display text-ink mt-5 max-w-[22ch] text-[clamp(1.7rem,3.4vw,2.4rem)] leading-[1.08] font-normal tracking-[-0.02em]">
              {heading(lead)}
            </h2>
            <div className="mt-5">
              <Body release={lead} />
            </div>

            {patches.length > 0 && (
              <div className="border-hairline mt-10 border-t">
                <p className="text-faint mt-4 font-mono text-[11px] tracking-[0.2em] uppercase">
                  {patches.length === 1 ? "One patch" : `${patches.length} patches`}
                </p>
                <ul className="mt-2">
                  {patches.map((patch) => (
                    <li key={patch.tag} className="border-hairline border-b">
                      <details className="group">
                        <summary className="flex cursor-pointer list-none items-baseline gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
                          <span className="key shrink-0 text-[13px]">
                            {patch.tag.replace(/^v/, "")}
                          </span>
                          <span className="text-ink/90 flex-1 text-[16px] leading-snug">
                            {heading(patch)}
                          </span>
                          <span className="text-faint hidden shrink-0 font-mono text-[11px] sm:inline">
                            {shown(patch.date)}
                          </span>
                          <span className="text-faint font-mono text-[11px] transition-transform group-open:rotate-90">
                            ›
                          </span>
                        </summary>
                        <div className="pt-1 pb-6 pl-[3.6rem]">
                          <Body release={patch} />
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
