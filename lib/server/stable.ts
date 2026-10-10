// The stable channel, answered: the one place it is decided. The app's
// updater, the Homebrew job and every download on this site ask here, so
// a change to the rule (lib/promotion.ts) is a deploy of this site and
// never an update every Mac has to take first. Server only.

import { Effect, Layer, ManagedRuntime, Schema } from "effect";
import {
  parseVersion,
  pending,
  policy,
  preview,
  stable,
  type Build,
} from "@/lib/promotion";
import { insideNext } from "@/lib/server/config";
import { Releases, type GitHubRelease } from "@/lib/server/github";

/** What GET /api/stable returns. The app decodes exactly this. */
export type StableAnswer = {
  tag: string;
  version: string;
  published: string;
  zip: { name: string; url: string };
  preview: { tag: string };
  pending: {
    line: string;
    kind: "minor" | "patch";
    since: string;
    promotes: string;
    tag: string;
  }[];
  policy: { minorSoakDays: number; patchSoakDays: number; settleDays: number };
};

/** The list has no build that could be stable: empty, or every build held. */
export class NoStable extends Schema.TaggedError<NoStable>()("NoStable", {
  message: Schema.String,
}) {}

const day = 86_400_000;

/** ISO 8601 to the second, the way GitHub writes it: no milliseconds, so
    Foundation's default ISO8601DateFormatter reads it. */
export const iso = (ms: number) =>
  new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");

const zipOf = (release: GitHubRelease) =>
  release.assets.find(
    (asset) =>
      asset.name.startsWith("lodestar-") && asset.name.endsWith(".zip"),
  );

const toBuild = (release: GitHubRelease): Build[] => {
  const version = parseVersion(release.tag_name);
  const published =
    release.published_at === null ? NaN : Date.parse(release.published_at);
  if (!version || Number.isNaN(published)) return [];
  return [
    {
      tag: release.tag_name,
      version,
      published,
      title: release.name ?? "",
      hasZip: zipOf(release) !== undefined,
      draft: release.draft,
    },
  ];
};

/** The answer for a releases list at `now`, or null when nothing is stable. */
export function answer(
  releases: ReadonlyArray<GitHubRelease>,
  now: number,
): StableAnswer | null {
  const builds = releases.flatMap(toBuild);
  const found = stable(builds, now);
  const newest = preview(builds, now);
  const zip =
    found && zipOf(releases.find((release) => release.tag_name === found.tag)!);
  if (!found || !newest || !zip) return null;
  return {
    tag: found.tag,
    version: found.version.join("."),
    published: iso(found.published),
    zip: { name: zip.name, url: zip.browser_download_url },
    preview: { tag: newest.tag },
    pending: pending(builds, now).map((line) => ({
      line: line.line,
      kind: line.kind,
      since: iso(line.since),
      promotes: iso(line.promotes),
      tag: line.build.tag,
    })),
    policy: {
      minorSoakDays: policy.minorSoak / day,
      patchSoakDays: policy.patchSoak / day,
      settleDays: policy.settle / day,
    },
  };
}

export const stableAnswer = Effect.fn("stableAnswer")(function* (now: number) {
  const releases = yield* Releases.use((service) => service.list);
  const found = answer(releases, now);
  if (!found)
    return yield* new NoStable({ message: "no release is stable yet" });
  return found;
});

// One runtime for the server, shared by the endpoint and every page. Inside
// Next's server and build (lib/server/config.ts) the list goes through
// Next's cache; anywhere else (the tests) GitHub is asked directly.
const memoMap = Layer.makeMemoMapUnsafe();
export const runtime = ManagedRuntime.make(
  Layer.unwrap(
    Effect.map(insideNext, (inside) =>
      inside ? Releases.layerCached : Releases.layer,
    ),
  ),
  { memoMap },
);

/** The stable answer for a page, or null when GitHub cannot say. A page
    never fails for it: the download falls back to the releases page. */
export function stableForPage(): Promise<StableAnswer | null> {
  return runtime.runPromise(
    stableAnswer(Date.now()).pipe(Effect.orElseSucceed(() => null)),
  );
}

/** The stable tag and its date, for a page and its download. A null tag
    sends the download to the releases page rather than to a guess. */
export async function stableRelease(): Promise<{
  tag: string | null;
  date: string;
}> {
  const found = await stableForPage();
  return found
    ? { tag: found.tag, date: found.published }
    : { tag: null, date: "" };
}
