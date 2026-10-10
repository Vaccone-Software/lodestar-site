// The stable rule, held to the app's own answers: tests/fixtures/
// promotion.json is a copy of Tests/LodestarCoreTests/Fixtures/
// promotion.json in the app's repository, where PromotionTests runs the
// same cases through Promotion.swift. A change to either rule that the
// other does not make fails here or there. Runs without a build:
// `bun test tests/promotion.test.ts`.

import { describe, expect, test } from "bun:test";
import fixture from "./fixtures/promotion.json";
import {
  history,
  parseBuilds,
  parseVersion,
  pending,
  policy,
  preview,
  stable,
  type Build,
} from "@/lib/promotion";

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
        expect(stable(builds, Date.parse(check.now))?.tag ?? null).toBe(
          check.stable,
        );
    });
  }

  test("reads GitHub's list", () => {
    const builds = parseBuilds([
      {
        tag_name: "v0.47.0",
        name: "Lodestar 0.47.0",
        draft: false,
        published_at: "2026-10-09T23:00:01Z",
        assets: [
          { name: "lodestar-0.47.0.zip" },
          { name: "lodestar-0.47.0.dmg" },
        ],
      },
      {
        tag_name: "v0.46.0",
        name: null,
        draft: true,
        published_at: null,
        assets: [],
      },
      { tag_name: "nightly", published_at: "2026-10-01T00:00:00Z", assets: [] },
    ]);
    expect(builds.map((build) => build.tag)).toEqual(["v0.47.0"]);
    expect(builds[0].hasZip).toBe(true);
    expect(parseBuilds({ message: "rate limited" })).toEqual([]);
  });

  // Days from one start, as the app's tests count them.
  const start = Date.parse("2026-01-01T00:00:00Z");
  const at = (days: number) => start + days * day;
  const build = (tag: string, days: number, title = ""): Build => ({
    tag,
    version: parseVersion(tag)!,
    published: at(days),
    title,
    hasZip: true,
    draft: false,
  });

  test("preview is the newest build out by now", () => {
    const builds = [
      build("v1.47.0", 0),
      build("v1.48.0", 1),
      build("v1.48.1", 3),
    ];
    expect(preview(builds, at(2))?.tag).toBe("v1.48.0");
    expect(preview(builds, at(3))?.tag).toBe("v1.48.1");
    expect(preview([], at(3))).toBeNull();
  });

  test("pending names each line, when it lands, and what lands", () => {
    const builds = [
      build("v1.47.0", 0),
      build("v1.47.1", 1),
      build("v1.48.0", 2),
      build("v1.48.1", 8.5),
    ];
    const lines = pending(builds, at(3));
    expect(lines.map((line) => [line.line, line.kind, line.build.tag])).toEqual(
      [
        ["1.47", "patch", "v1.47.1"],
        ["1.48", "minor", "v1.48.0"],
      ],
    );
    expect(lines[0].since).toBe(at(1));
    expect(lines[0].promotes).toBe(at(4));
    expect(lines[1].promotes).toBe(at(9));
    // The newest patch is too young at the minor's day; the one before goes.
    expect(
      pending(builds, at(5)).map((line) => [line.build.tag, line.promotes]),
    ).toEqual([["v1.48.0", at(9)]]);
    expect(stable(builds, at(9))?.tag).toBe("v1.48.0");
    expect(
      pending(builds, at(9.5)).map((line) => [line.kind, line.build.tag]),
    ).toEqual([["patch", "v1.48.1"]]);
  });

  test("a held line restarts in pending too", () => {
    const builds = [
      build("v1.47.0", 0),
      build("v1.48.0", 1, "Lodestar 1.48.0 [held]"),
      build("v1.48.1", 4),
    ];
    expect(
      pending(builds, at(5)).map((line) => [
        line.build.tag,
        line.since,
        line.promotes,
      ]),
    ).toEqual([["v1.48.1", at(4), at(11)]]);
  });

  test("nothing waiting is nothing pending", () => {
    expect(pending([build("v1.47.0", 0)], at(30))).toEqual([]);
    expect(pending([], at(30))).toEqual([]);
  });
});
