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

/** The newest release's tag and date. Pages are built once and rebuilt in
    the background at most an hour after a release, so a new version reaches
    the page without a deploy; the download pill re-reads it in the browser
    as well. (Never no-store: that renders every page on every request.) */
export async function latestRelease(): Promise<{ tag: string; date: string }> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1",
      { next: { revalidate: 3600 } },
    );
    const data = await response.json();
    const tag = data?.[0]?.tag_name;
    const date = data?.[0]?.published_at;
    if (typeof tag === "string" && tag.startsWith("v"))
      return { tag, date: typeof date === "string" ? date : "" };
  } catch {}
  return { tag: "v0.39.6", date: "" };
}

/** The disk image a tag ships as. */
export function dmgFor(tag: string): string {
  const version = tag.replace(/^v/, "");
  return `https://github.com/Vaccone-Software/lodestar/releases/download/${tag}/lodestar-${version}.dmg`;
}
