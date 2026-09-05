"use client";

import { useEffect, useState } from "react";

// The releases list, not releases/latest: that endpoint excludes
// prereleases, and every release before 1.0 is one. The build bakes the
// version and date it saw; the client re-reads so the line tracks new
// releases between deploys.
const releases =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1";

/** "notarized today", "notarized 3 days ago", "notarized 2 weeks ago":
    the project is alive, said without a word of marketing. */
function age(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "notarized";
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return "notarized today";
  if (days === 1) return "notarized yesterday";
  if (days < 14) return `notarized ${days} days ago`;
  if (days < 60) return `notarized ${Math.floor(days / 7)} weeks ago`;
  return `notarized ${Math.floor(days / 30)} months ago`;
}

export default function LatestVersion({
  fallback,
  fallbackDate = "",
}: {
  fallback: string;
  fallbackDate?: string;
}) {
  const [version, setVersion] = useState(fallback);
  const [date, setDate] = useState(fallbackDate);
  // The age is a function of the reader's clock, so it is computed after
  // hydration and never disagrees with the server's render.
  const [when, setWhen] = useState<string | null>(null);
  useEffect(() => {
    fetch(releases)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const tag = data?.[0]?.tag_name;
        if (typeof tag === "string" && tag.startsWith("v")) setVersion(tag);
        const published = data?.[0]?.published_at;
        if (typeof published === "string") setDate(published);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    setWhen(date ? age(date) : "notarized");
  }, [date]);
  return (
    <>
      {version} · {when ?? "notarized"}
    </>
  );
}
