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
//     still waiting when it came; the stable beneath it stays.
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

const lineOf = (build: Build) =>
  `${build.version[0] ?? 0}.${build.version[1] ?? 0}`;
const held = (build: Build) => /\[held\]/i.test(build.title);
const newest = (builds: Build[]) =>
  builds.reduce((best, build) =>
    isNewer(build.version, best.version) ? build : best,
  );

/** The GitHub releases list as promotion reads it. */
export function parseBuilds(data: unknown): Build[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((entry) => {
    const version =
      typeof entry?.tag_name === "string" ? parseVersion(entry.tag_name) : null;
    const published =
      typeof entry?.published_at === "string"
        ? Date.parse(entry.published_at)
        : NaN;
    if (!version || Number.isNaN(published)) return [];
    const assets: { name?: string }[] = Array.isArray(entry.assets)
      ? entry.assets
      : [];
    return [
      {
        tag: entry.tag_name as string,
        version,
        published,
        title: typeof entry.name === "string" ? entry.name : "",
        hasZip: assets.some(
          (asset) =>
            asset.name?.startsWith("lodestar-") && asset.name.endsWith(".zip"),
        ),
        draft: entry.draft === true,
      },
    ];
  });
}

/**
 * The builds newer than stable, by line, less what a hold passed over: a
 * held build always, and its line's earlier builds once the hold is out
 * (published by `time`). Applied to the waiting builds only, so a hold
 * cannot take back a build that was already stable when it came.
 */
function waiting(candidates: Build[], time: number): Map<string, Build[]> {
  const lines = new Map<string, Build[]>();
  for (const build of candidates)
    lines.set(lineOf(build), [...(lines.get(lineOf(build)) ?? []), build]);
  for (const [line, members] of lines) {
    const holds = members.filter(
      (build) => held(build) && build.published <= time,
    );
    const hold = holds.length
      ? Math.max(...holds.map((build) => build.published))
      : undefined;
    const live = members.filter(
      (build) => !held(build) && (hold === undefined || build.published > hold),
    );
    if (live.length) lines.set(line, live);
    else lines.delete(line);
  }
  return lines;
}

/** The builds promotion may consider, oldest version first: published by
    now, not drafts, and carrying the zip the updater installs. */
function usable(builds: Build[], now: number): Build[] {
  return builds
    .filter((build) => !build.draft && build.hasZip && build.published <= now)
    .sort((a, b) =>
      isNewer(a.version, b.version)
        ? 1
        : isNewer(b.version, a.version)
          ? -1
          : 0,
    );
}

const soakFor = (line: string, stableLine: string) =>
  line === stableLine ? policy.patchSoak : policy.minorSoak;
const eligibleAt = (build: Build, since: number, soak: number) =>
  Math.max(since + soak, build.published + policy.settle);

/** Walks time forward from the newest release before channels (or the
    oldest in the list) to `now`, moving stable each time a build becomes
    eligible. Returns where it stands and the pool it walked. */
function walk(
  builds: Build[],
  now: number,
): { stable: Build | null; pool: Build[] } {
  const pool = usable(builds, now);
  const unheld = pool.filter((build) => !held(build));
  if (!unheld.length) return { stable: null, pool };

  const before = unheld.filter((build) => isNewer(history, build.version));
  let current = before.length ? before[before.length - 1] : unheld[0];
  let time = current.published;
  for (;;) {
    const candidates = pool.filter((build) =>
      isNewer(build.version, current.version),
    );
    const eligible: [Build, number][] = [];
    for (const [line, members] of waiting(candidates, time)) {
      const since = Math.min(...members.map((build) => build.published));
      const soak = soakFor(line, lineOf(current));
      for (const build of members)
        eligible.push([build, eligibleAt(build, since, soak)]);
    }
    if (!eligible.length) break;
    const moment = Math.max(Math.min(...eligible.map(([, at]) => at)), time);
    if (moment > now) break;
    // A hold published before that moment changes what is waiting: step
    // to it and look again, as the app's walk does.
    const holds = candidates.filter(
      (build) =>
        held(build) && build.published > time && build.published <= moment,
    );
    if (holds.length) {
      time = Math.min(...holds.map((build) => build.published));
      continue;
    }
    current = newest(
      eligible.filter(([, at]) => at <= moment).map(([build]) => build),
    );
    time = moment;
  }
  return { stable: current, pool };
}

/** The stable build at `now`, or null when there is none. */
export function stable(builds: Build[], now: number): Build | null {
  return walk(builds, now).stable;
}

/** The newest build at `now`: what a Mac on preview takes. */
export function preview(builds: Build[], now: number): Build | null {
  const pool = usable(builds, now);
  return pool.length ? pool[pool.length - 1] : null;
}

export type Pending = {
  line: string;
  kind: "minor" | "patch";
  since: number;
  promotes: number;
  build: Build;
};

/** Every line newer than stable, soonest first: when its clock started,
    when it lands, and the build that lands then. */
export function pending(builds: Build[], now: number): Pending[] {
  const { stable: current, pool } = walk(builds, now);
  if (!current) return [];
  const candidates = pool.filter((build) =>
    isNewer(build.version, current.version),
  );
  return [...waiting(candidates, now)]
    .map(([line, members]): Pending => {
      const kind = line === lineOf(current) ? "patch" : "minor";
      const since = Math.min(...members.map((build) => build.published));
      const soak = soakFor(line, lineOf(current));
      const promotes = Math.min(
        ...members.map((build) => eligibleAt(build, since, soak)),
      );
      const build = newest(
        members.filter((member) => eligibleAt(member, since, soak) <= promotes),
      );
      return { line, kind, since, promotes, build };
    })
    .sort((a, b) => a.promotes - b.promotes);
}
