// The releases read with and without GITHUB_TOKEN, handed over through a
// ConfigProvider as the deployment would: the token goes to GitHub as a
// bearer header and nowhere else. Runs without a build.

import { afterEach, describe, expect, mock, test } from "bun:test";
import { ConfigProvider, Effect } from "effect";
import { Releases } from "@/lib/server/github";

const realFetch = globalThis.fetch;
let asked: Headers[] = [];

afterEach(() => {
  globalThis.fetch = realFetch;
});

const list = (env: Record<string, string>) => {
  asked = [];
  globalThis.fetch = mock(
    async (_url: string | URL | Request, init?: RequestInit) => {
      asked.push(new Headers(init?.headers));
      return Response.json([]);
    },
  ) as unknown as typeof fetch;
  return Effect.runPromise(
    Releases.use((releases) => releases.list).pipe(
      Effect.provide(Releases.layer),
      Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env }))),
    ),
  );
};

describe("the releases read", () => {
  test("with GITHUB_TOKEN, GitHub is asked with it as a bearer token", async () => {
    expect(await list({ GITHUB_TOKEN: "ghp_test" })).toEqual([]);
    expect(asked).toHaveLength(1);
    expect(asked[0].get("authorization")).toBe("Bearer ghp_test");
  });

  test("without it, GitHub is asked anonymously", async () => {
    await list({});
    expect(asked[0].get("authorization")).toBeNull();
  });

  test("an empty GITHUB_TOKEN counts as none", async () => {
    await list({ GITHUB_TOKEN: "" });
    expect(asked[0].get("authorization")).toBeNull();
  });
});
