"use client";

import { useEffect, useState } from "react";
import { dmgFor, downloadFor } from "@/lib/releases";

// The page bakes a working link; the client asks /api/stable again so the
// pill tracks stable between rebuilds. Stable, not the newest build: the
// newest is preview, and a first install should be one that has soaked.
// When stable is not known the link is the releases page, never a guess.

/** A phone or a tablet: somewhere a disk image cannot be opened. iPadOS
    presents itself as a Mac, so a Mac that answers to touch is one too. */
function awayFromAMac(): boolean {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}


export default function DownloadPill({
  fallback,
  label = "Download",
  small = false,
  onDownload,
}: {
  fallback: string | null;
  label?: string;
  /** The bar's resting key; otherwise the lit key a page offers once. */
  small?: boolean;
  /** Called when the download starts, which the link still goes on to do. */
  onDownload?: () => void;
}) {
  const [href, setHref] = useState(downloadFor(fallback));
  // Most people who follow a link arrive on a phone, where the download
  // cannot run. There the pill sends the page on to the Mac instead: the
  // share sheet (AirDrop, Messages, Mail to yourself), or the link copied
  // where there is no share sheet. Decided after mount, so the page the
  // server renders is the Mac's.
  const [away, setAway] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    setAway(awayFromAMac());
    fetch("/api/stable")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tag?: unknown } | null) => {
        if (typeof data?.tag === "string") setHref(dmgFor(data.tag));
      })
      .catch(() => {});
  }, []);

  const cap = small ? "key cap" : "key cap big lit";

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
      <button type="button" onClick={send} className={cap}>
        {copied ? "Link copied" : small ? "Send to Mac" : "Send to my Mac"}
      </button>
    );
  }

  return (
    <a href={href} onClick={onDownload} className={cap}>
      {label}
    </a>
  );
}
