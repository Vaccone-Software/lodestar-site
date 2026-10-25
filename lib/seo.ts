import type { Metadata } from "next";
import { downloadFor } from "@/lib/releases";

// What search engines are told, in their own vocabulary. The app is
// described once, under one id, and every page either carries it (the
// homepage, the door pages) or points at it (the guide), so a search
// engine sees one free Mac app with many pages about it.

export const site = "https://lodestar.vaccone.software";
const appId = `${site}/#app`;

export function appJsonLd(tag: string | null, features?: string[]) {
  return {
    "@type": "SoftwareApplication",
    "@id": appId,
    name: "Lodestar",
    operatingSystem: "macOS 27 or later (Apple silicon)",
    applicationCategory: "UtilitiesApplication",
    description:
      "Free tools for the Mac: spelling and grammar checked as you type, any app or window one key and a letter away, clipboard history, and dictation you can edit.",
    url: `${site}/`,
    ...(tag ? { softwareVersion: tag.replace(/^v/, "") } : {}),
    downloadUrl: downloadFor(tag),
    releaseNotes: `${site}/changelog`,
    license: "https://github.com/Vaccone-Software/lodestar/blob/main/LICENSE.md",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Vaccone Software" },
    ...(features ? { featureList: features } : {}),
  };
}

/** The site and its maker, said once on the homepage, so a search engine
    names results "Lodestar" and knows who makes it. */
export function siteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${site}/#site`,
    name: "Lodestar",
    url: `${site}/`,
    publisher: { "@type": "Organization", name: "Vaccone Software" },
  };
}

/** A page's metadata, with its link preview made from the same words. Next
    replaces openGraph and twitter whole rather than merging them, so a page
    that sets neither previews as the homepage, and one that sets only
    openGraph keeps the homepage's twitter lines. `social` is the preview's
    title when it should differ from the search title. */
export function pageMetadata({
  title,
  description,
  path,
  social,
}: {
  title: string;
  description: string;
  path: string;
  social?: string;
}): Metadata {
  const preview = social ?? `Lodestar · ${title}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: preview, description, url: path, siteName: "Lodestar", type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: preview, description },
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${site}${crumb.path}`,
    })),
  };
}

/** One script tag's worth: several nodes in one graph. */
export function graph(...nodes: object[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
}

export { appId };
