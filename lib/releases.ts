// One shape for a release, shared by the page that bakes the list at
// build and the client that re-reads it between deploys.
export type Release = {
  tag: string;
  name: string;
  date: string;
  body: string;
};

// The releases list, not releases/latest: that endpoint excludes
// prereleases, and every release before 1.0 is one.
export const releasesUrl =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=50";

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

/** The newest release's tag and date, baked at build so a static page is
    right on deploy day. no-store is load bearing: Next keeps a persistent
    data cache between builds, and a cached answer here bakes whatever
    version was current the last time the cache was written. */
export async function latestRelease(): Promise<{ tag: string; date: string }> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1",
      { cache: "no-store" },
    );
    const data = await response.json();
    const tag = data?.[0]?.tag_name;
    const date = data?.[0]?.published_at;
    if (typeof tag === "string" && tag.startsWith("v"))
      return { tag, date: typeof date === "string" ? date : "" };
  } catch {}
  return { tag: "v0.39.0", date: "" };
}

/** The disk image a tag ships as. */
export function dmgFor(tag: string): string {
  const version = tag.replace(/^v/, "");
  return `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}/lodestar-${version}.dmg`;
}
