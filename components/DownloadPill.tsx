"use client";

import { useEffect, useState } from "react";
import { parseBuilds, stable } from "@/lib/promotion";
import { dmgFor, releasesUrl } from "@/lib/releases";

// The build bakes a working link; the client re-reads the releases list so
// the pill tracks stable between deploys. Stable, not the newest build:
// the newest is preview, and a first install should be one that has
// soaked (lib/promotion.ts).

/** A phone or a tablet: somewhere a disk image cannot be opened. iPadOS
    presents itself as a Mac, so a Mac that answers to touch is one too. */
function awayFromAMac(): boolean {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

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
  // Most people who follow a link arrive on a phone, where the download
  // cannot run. There the pill sends the page on to the Mac instead: the
  // share sheet (AirDrop, Messages, Mail to yourself), or the link copied
  // where there is no share sheet. Decided after mount, so the page the
  // server renders is the Mac's.
  const [away, setAway] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setAway(awayFromAMac());
    fetch(releasesUrl)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const tag = stable(parseBuilds(data), Date.now())?.tag;
        const entry = Array.isArray(data) ? data.find((release) => release?.tag_name === tag) : null;
        const assets: { name?: string; browser_download_url?: string }[] = entry?.assets ?? [];
        const dmg = assets.find((entry) => entry.name?.endsWith(".dmg"));
        if (dmg?.browser_download_url) setHref(dmg.browser_download_url);
      })
      .catch(() => {});
  }, []);

  if (away) {
    const send = async () => {
      const url = window.location.origin + window.location.pathname;
      if (navigator.share) {
        try {
          await navigator.share({ title: "Lodestar", text: "Lodestar, free tools for your Mac", url });
          return;
        } catch (error) {
          // Closing the sheet is an answer, not a failure.
          if ((error as Error)?.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } catch {}
    };
    return (
      <button type="button" onClick={send} className={`glass${small ? " small" : ""}`}>
        {copied ? "Link copied" : small ? "Send to Mac" : "Send to my Mac"}{" "}
        <span className="arrow">→</span>
      </button>
    );
  }

  return (
    <a href={href} className={`glass${small ? " small" : ""}`}>
      {label} <span className="arrow">→</span>
    </a>
  );
}
