"use client";

import { useEffect, useState } from "react";
import Key from "@/components/Key";
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
    <div className="text-dim max-w-[65ch] space-y-4 text-[16px] leading-[1.6]">
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
            {/* The series: its version on a key, its kind and day in quiet
                ink, then the tagline of the release that opened it. */}
            <div className="text-dim flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]">
              <Key>{s.key}</Key>
              <span>
                {s.kind === "major" ? "Major" : "Minor"} · {shown(lead.date)}
              </span>
            </div>
            <h2 className="font-display text-ink mt-4 max-w-[26ch] text-[clamp(1.5rem,3vw,2rem)] leading-[1.12] font-bold tracking-[-0.02em] text-balance">
              {heading(lead)}
            </h2>
            <div className="mt-5">
              <Body release={lead} />
            </div>

            {patches.length > 0 && (
              <div className="pane mt-10 px-2 py-2">
                <p className="text-dim px-3 pt-2 pb-1 text-[13px] font-semibold">
                  {patches.length === 1
                    ? "One patch"
                    : `${patches.length} patches`}
                </p>
                <ul>
                  {patches.map((patch) => (
                    <li
                      key={patch.tag}
                      className="border-hairline border-b last:border-b-0"
                    >
                      <details className="group">
                        <summary className="hover:bg-raised/60 flex cursor-pointer list-none items-center gap-4 rounded-[10px] px-3 py-3 [&::-webkit-details-marker]:hidden">
                          <span className="w-[4.5rem] shrink-0">
                            <Key quiet>{patch.tag.replace(/^v/, "")}</Key>
                          </span>
                          <span className="text-ink flex-1 text-[16px] leading-snug font-medium">
                            {heading(patch)}
                          </span>
                          <span className="text-dim hidden shrink-0 text-[13px] tabular-nums sm:inline">
                            {shown(patch.date)}
                          </span>
                          <span
                            className="text-dim text-[16px] leading-none group-open:rotate-90"
                            aria-hidden="true"
                          >
                            ›
                          </span>
                        </summary>
                        <div className="px-3 pt-1 pb-6 sm:pl-[6.5rem]">
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
