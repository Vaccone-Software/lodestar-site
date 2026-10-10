// The stable channel, as the app computes it (Sources/LodestarCore/
// Promotion.swift in the app's repository): a pure function of the public
// releases list and the clock. Every build ships to preview the moment it
// is published; stable takes it once its line has soaked. Nothing is
// flipped or stored, so the site, the app's updater and the Homebrew job
// each compute the same answer from the same list. tests/fixtures/
// promotion.json is the app's own fixture, copied, so the two languages
// are held to the same answers.
//
//   - A line is a major.minor. Its clock starts at its first build newer
//     than stable. Patches never reset it; a lone patch starts its own.
//   - A new minor soaks seven days, a patch line three.
//   - No build is taken younger than a day; the one before it goes.
//   - "[held]" in a title passes over that build and its line's builds
//     published before it.
//   - Releases below 0.48.0 shipped before channels, to everyone.

export type Build = {
  tag: string;
  version: number[];
  published: number; // ms since the epoch
  title: string;
  hasZip: boolean;
  draft: boolean;
};

const day = 86_400_000;
export const policy = { minorSoak: 7 * day, patchSoak: 3 * day, settle: day };
export const history = [0, 48, 0];

export function parseVersion(tag: string): number[] | null {
  const parts = tag.replace(/^v/, "").split(".");
  if (!parts.length || parts.some((part) => !/^\d+$/.test(part))) return null;
  return parts.map(Number);
}

/** Strictly newer, place by place; missing places read as zero. */
export function isNewer(a: number[], b: number[]): boolean {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

const lineOf = (build: Build) => `${build.version[0] ?? 0}.${build.version[1] ?? 0}`;
const held = (build: Build) => /\[held\]/i.test(build.title);
const newest = (builds: Build[]) =>
  builds.reduce((best, build) => (isNewer(build.version, best.version) ? build : best));

/** The GitHub releases list as promotion reads it. */
export function parseBuilds(data: unknown): Build[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) => {
    const version = typeof entry?.tag_name === "string" ? parseVersion(entry.tag_name) : null;
    const published = typeof entry?.published_at === "string" ? Date.parse(entry.published_at) : NaN;
    if (!version || Number.isNaN(published)) return [];
    const assets: { name?: string }[] = Array.isArray(entry.assets) ? entry.assets : [];
    return [
      {
        tag: entry.tag_name as string,
        version,
        published,
        title: typeof entry.name === "string" ? entry.name : "",
        hasZip: assets.some((asset) => asset.name?.startsWith("lodestar-") && asset.name.endsWith(".zip")),
        draft: entry.draft === true,
      },
    ];
  });
}

/** The stable build at `now`, or null when there is none. */
export function stable(builds: Build[], now: number): Build | null {
  const shipped = builds.filter((build) => !build.draft && build.hasZip && build.published <= now);
  const lastHold = new Map<string, number>();
  for (const build of shipped.filter(held))
    lastHold.set(lineOf(build), Math.max(lastHold.get(lineOf(build)) ?? build.published, build.published));
  const pool = shipped
    .filter((build) => {
      const hold = lastHold.get(lineOf(build));
      return hold === undefined || build.published > hold;
    })
    .sort((a, b) => (isNewer(a.version, b.version) ? 1 : isNewer(b.version, a.version) ? -1 : 0));
  if (!pool.length) return null;

  const before = pool.filter((build) => isNewer(history, build.version));
  let current = before.length ? before[before.length - 1] : pool[0];
  let time = current.published;
  for (;;) {
    const candidates = pool.filter((build) => isNewer(build.version, current.version));
    const lines = new Map<string, Build[]>();
    for (const build of candidates) lines.set(lineOf(build), [...(lines.get(lineOf(build)) ?? []), build]);
    const eligible: [Build, number][] = [];
    for (const [line, members] of lines) {
      const since = Math.min(...members.map((build) => build.published));
      const soak = line === lineOf(current) ? policy.patchSoak : policy.minorSoak;
      for (const build of members)
        eligible.push([build, Math.max(since + soak, build.published + policy.settle)]);
    }
    if (!eligible.length) break;
    const moment = Math.max(Math.min(...eligible.map(([, at]) => at)), time);
    if (moment > now) break;
    current = newest(eligible.filter(([, at]) => at <= moment).map(([build]) => build));
    time = moment;
  }
  return current;
}
