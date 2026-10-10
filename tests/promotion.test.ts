// The stable rule, held to the app's own answers: tests/fixtures/
// promotion.json is a copy of Tests/LodestarCoreTests/Fixtures/
// promotion.json in the app's repository, where PromotionTests runs the
// same cases through Promotion.swift. A change to either rule that the
// other does not make fails here or there. Runs without a build:
// `bun test tests/promotion.test.ts`.

import { describe, expect, test } from "bun:test";
import fixture from "./fixtures/promotion.json";
import { history, parseBuilds, parseVersion, policy, stable } from "@/lib/promotion";

const day = 86_400_000;

describe("promotion", () => {
  test("the policy is the app's", () => {
    expect(policy.minorSoak).toBe(fixture.policy.minorSoakDays * day);
    expect(policy.patchSoak).toBe(fixture.policy.patchSoakDays * day);
    expect(policy.settle).toBe(fixture.policy.settleDays * day);
    expect(history).toEqual(parseVersion(fixture.policy.historyBelow)!);
  });

  for (const item of fixture.cases) {
    test(item.name, () => {
      const builds = item.releases.map((release) => ({
        tag: release.tag,
        version: parseVersion(release.tag)!,
        published: Date.parse(release.published),
        title: release.title,
        hasZip: release.zip,
        draft: release.draft,
      }));
      for (const check of item.checks)
        expect(stable(builds, Date.parse(check.now))?.tag ?? null).toBe(check.stable);
    });
  }

  test("reads GitHub's list", () => {
    const builds = parseBuilds([
      {
        tag_name: "v0.47.0",
        name: "Lodestar 0.47.0",
        draft: false,
        published_at: "2026-10-09T23:00:01Z",
        assets: [{ name: "lodestar-0.47.0.zip" }, { name: "lodestar-0.47.0.dmg" }],
      },
      { tag_name: "v0.46.0", name: null, draft: true, published_at: null, assets: [] },
      { tag_name: "nightly", published_at: "2026-10-01T00:00:00Z", assets: [] },
    ]);
    expect(builds.map((build) => build.tag)).toEqual(["v0.47.0"]);
    expect(builds[0].hasZip).toBe(true);
    expect(parseBuilds({ message: "rate limited" })).toEqual([]);
  });
});
