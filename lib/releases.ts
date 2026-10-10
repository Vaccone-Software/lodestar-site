import { parseBuilds, stable } from "@/lib/promotion";

// One shape for a release, shared by the page that bakes the list at
// build and the client that re-reads it between deploys.
export type Release = {
  tag: string;
  name: string;
  date: string;
  body: string;
};

// The releases list, not releases/latest: that endpoint excludes
// prereleases, and every release before 1.0 is one. A hundred, so the
// stable walk (lib/promotion.ts) sees months and not a week of patches.
export const releasesUrl =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=100";

export function parseReleases(data: unknown): Release[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((entry) => typeof entry?.tag_name === "string")
    .map((entry) => ({
      tag: entry.tag_name as string,
      name:
        typeof entry.name === "string" && entry.name
          ? entry.name
          : (entry.tag_name as string),
      date: typeof entry.published_at === "string" ? entry.published_at : "",
      body: typeof entry.body === "string" ? entry.body : "",
    }));
}

/** The stable release's tag and date: what a new visitor downloads. The
    newest build is preview, for the Macs that asked for it; stable is the
    one that has soaked (lib/promotion.ts). Pages are built once and rebuilt
    in the background at most an hour later, so stable moving reaches the
    page without a deploy; the download pill re-reads it in the browser as
    well. (Never no-store: that renders every page on every request.) */
export async function stableRelease(): Promise<{ tag: string; date: string }> {
  try {
    const response = await fetch(releasesUrl, { next: { revalidate: 3600 } });
    const found = stable(parseBuilds(await response.json()), Date.now());
    if (found) return { tag: found.tag, date: new Date(found.published).toISOString() };
  } catch {}
  return { tag: "v0.47.0", date: "" };
}

/** The disk image a tag ships as. */
export function dmgFor(tag: string): string {
  const version = tag.replace(/^v/, "");
  return `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}/lodestar-${version}.dmg`;
}
