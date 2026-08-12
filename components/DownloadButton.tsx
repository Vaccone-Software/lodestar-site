"use client";

import { useEffect, useState } from "react";

// Same dual layer as LatestVersion: the build bakes a working link, the
// client re-reads the releases list so the button tracks new releases
// between deploys. The releases list, never releases/latest — that
// endpoint excludes prereleases, and every release before 1.0 is one.
const releases =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1";

function assetFor(tag: string) {
  const version = tag.replace(/^v/, "");
  return {
    href: `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}/lodestar-${version}.dmg`,
    name: `lodestar-${version}.dmg`,
  };
}

export default function DownloadButton({ fallback }: { fallback: string }) {
  const [asset, setAsset] = useState(assetFor(fallback));
  useEffect(() => {
    fetch(releases)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const assets: { name?: string; browser_download_url?: string }[] =
          data?.[0]?.assets ?? [];
        const dmg = assets.find((entry) => entry.name?.endsWith(".dmg"));
        if (dmg?.browser_download_url && dmg.name)
          setAsset({ href: dmg.browser_download_url, name: dmg.name });
      })
      .catch(() => {});
  }, []);
  return (
    <a
      href={asset.href}
      className="group border-accent/40 bg-accent/[0.07] hover:border-accent/70 hover:bg-accent/[0.13] flex w-full items-center justify-between gap-4 border px-4 py-3 text-left text-[13px] transition-colors sm:text-sm"
    >
      <span className="text-ink">Download for macOS</span>
      <span className="text-accent">{asset.name} ↓</span>
    </a>
  );
}
