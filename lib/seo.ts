import { dmgFor } from "@/lib/releases";

// What search engines are told, in their own vocabulary. The app is
// described once, under one id, and every page either carries it (the
// homepage, the door pages) or points at it (the guide), so a search
// engine sees one free Mac app with many pages about it.

export const site = "https://lodestar.vaccone.software";
const appId = `${site}/#app`;

export function appJsonLd(tag: string, features?: string[]) {
  return {
    "@type": "SoftwareApplication",
    "@id": appId,
    name: "Lodestar",
    operatingSystem: "macOS 14 or later (Apple silicon)",
    applicationCategory: "UtilitiesApplication",
    description:
      "Free tools for the Mac: spelling and grammar checked in every app, any app or window one key and a letter away, clipboard history, and dictation you can edit.",
    url: `${site}/`,
    softwareVersion: tag.replace(/^v/, ""),
    downloadUrl: dmgFor(tag),
    releaseNotes: `${site}/changelog`,
    license: "https://github.com/Vaccone-Software/lodestar/blob/main/LICENSE.md",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Vaccone Software" },
    ...(features ? { featureList: features } : {}),
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
