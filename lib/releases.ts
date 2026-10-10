// One shape for a release, shared by the page that bakes the list at
// build and the client that re-reads it between deploys.
export type Release = {
  tag: string;
  name: string;
  date: string;
  body: string;
};

// The releases list, not releases/latest: that endpoint excludes
// prereleases, and every release before 1.0 is one. The changelog lists
// every build from it; which one is stable is the server's to say
// (lib/server/stable.ts, GET /api/stable). Safe in the browser.
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

/** The disk image a tag ships as. */
export function dmgFor(tag: string): string {
  const version = tag.replace(/^v/, "");
  return `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}/lodestar-${version}.dmg`;
}

/** Where a download goes when stable is not known: the releases page,
    never a guessed version. */
export const releasesPage =
  "https://github.com/Vaccone-Software/lodestar/releases";

/** The download for a stable tag, or the releases page without one. */
export function downloadFor(tag: string | null): string {
  return tag ? dmgFor(tag) : releasesPage;
}
