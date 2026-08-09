"use client";

import { useEffect, useState } from "react";

// The releases list, not releases/latest: that endpoint excludes
// prereleases, and every release before 1.0 is one.
const releases =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1";

export default function LatestVersion({ fallback }: { fallback: string }) {
  const [version, setVersion] = useState(fallback);
  useEffect(() => {
    fetch(releases)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const tag = data?.[0]?.tag_name;
        if (typeof tag === "string" && tag.startsWith("v")) setVersion(tag);
      })
      .catch(() => {});
  }, []);
  return <>{version}</>;
}
