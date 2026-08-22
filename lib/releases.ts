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
