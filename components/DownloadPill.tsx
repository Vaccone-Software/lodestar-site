"use client";

import { useEffect, useState } from "react";
import { dmgFor } from "@/lib/releases";

// The build bakes a working link; the client re-reads the releases list so
// the pill tracks new releases between deploys. The list, never
// releases/latest: that endpoint excludes prereleases, and every release
// before 1.0 is one.
const releases =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1";

export default function DownloadPill({
  fallback,
  label = "Download for Mac",
  small = false,
}: {
  fallback: string;
  label?: string;
  small?: boolean;
}) {
  const [href, setHref] = useState(dmgFor(fallback));
  useEffect(() => {
    fetch(releases)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const assets: { name?: string; browser_download_url?: string }[] =
          data?.[0]?.assets ?? [];
        const dmg = assets.find((entry) => entry.name?.endsWith(".dmg"));
        if (dmg?.browser_download_url) setHref(dmg.browser_download_url);
      })
      .catch(() => {});
  }, []);
  return (
    <a href={href} className={`glass${small ? " small" : ""}`}>
      {label} <span className="arrow">→</span>
    </a>
  );
}
