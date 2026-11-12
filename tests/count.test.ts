// POST /api/count's answers and the reading behind the public page
// (lib/server/count.ts), with Upstash played by a stand-in fetch and the
// store's settings handed over through a ConfigProvider, never written into
// process.env: what a post adds, every post it refuses, and every answer
// the app reads.
// Runs without a build: `bun test tests/count.test.ts`.

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ConfigProvider, Effect } from "effect";
import {
  daysBefore,
  dayOf,
  parsePost,
  readDays,
  respond,
} from "@/lib/server/count";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";

const realFetch = globalThis.fetch;
const env = {
  UPSTASH_REDIS_REST_URL: "https://store.example.upstash.io/",
  UPSTASH_REDIS_REST_TOKEN: "token",
};
let settings: Record<string, string> = { ...env };
let sent: { url: string; init: RequestInit }[] = [];

const upstash = (respond: (commands: unknown) => Response) => {
  sent = [];
  globalThis.fetch = mock(
    async (url: string | URL | Request, init?: RequestInit) => {
      sent.push({ url: String(url), init: init ?? {} });
      return respond(JSON.parse(String(init?.body ?? "null")));
    },
  ) as unknown as typeof fetch;
};

const okFor = (commands: unknown) =>
  Response.json((commands as unknown[]).map(() => ({ result: 1 })));

const run = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(
    effect.pipe(
      fetchAtCallTime,
      Effect.provide(HttpLive),
      Effect.provide(
        ConfigProvider.layer(ConfigProvider.fromEnv({ env: settings })),
      ),
    ) as Effect.Effect<A, E, never>,
  );

const now = Date.parse("2026-11-12T15:30:00Z");
const good = { version: "0.54.25", channel: "stable", age: "7-29" };
const last = () => JSON.parse(String(sent.at(-1)!.init.body)) as string[][];

const post = (body: unknown, header = true, at = now): Promise<Response> =>
  run(
    respond(
      new Request("https://lodestar.vaccone.software/api/count", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(header ? { "x-lodestar-count": "1" } : {}),
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
      at,
    ),
  );

const quietly = async (body: () => Promise<void>) => {
  const error = console.error;
  console.error = () => {};
  try {
    await body();
  } finally {
    console.error = error;
  }
};

beforeEach(() => {
  settings = { ...env };
  upstash(okFor);
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("/api/count", () => {
  test("a post adds one to the day's total, version, channel and age", async () => {
    const response = await post(good);
    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe("https://store.example.upstash.io/pipeline");
    expect(new Headers(sent[0].init.headers).get("authorization")).toBe(
      "Bearer token",
    );
    expect(last()).toEqual([
      ["HINCRBY", "count:2026-11-12", "total", "1"],
      ["HINCRBY", "count:2026-11-12", "version:0.54.25", "1"],
      ["HINCRBY", "count:2026-11-12", "channel:stable", "1"],
      ["HINCRBY", "count:2026-11-12", "age:7-29", "1"],
    ]);
  });

  test("every channel and age the app can send is counted", async () => {
    for (const channel of ["stable", "preview"])
      for (const age of ["0", "1-6", "7-29", "30-89", "90+"]) {
        const response = await post({ ...good, channel, age });
        expect(response.status).toBe(204);
        expect(last().map((command) => command[2])).toEqual([
          "total",
          "version:0.54.25",
          `channel:${channel}`,
          `age:${age}`,
        ]);
      }
  });

  test("the day is the server's UTC day, never the app's", async () => {
    await post(good, true, Date.parse("2026-11-12T23:59:59Z"));
    expect(last()[0][1]).toBe("count:2026-11-12");
    await post(good, true, Date.parse("2026-11-13T00:00:00Z"));
    expect(last()[0][1]).toBe("count:2026-11-13");
  });

  test("Vercel's marketplace names reach the same store", async () => {
    settings = {
      KV_REST_API_URL: "https://kv.example",
      KV_REST_API_TOKEN: "kv",
    };
    const response = await post(good);
    expect(response.status).toBe(204);
    expect(sent[0].url).toBe("https://kv.example/pipeline");
    expect(new Headers(sent[0].init.headers).get("authorization")).toBe(
      "Bearer kv",
    );
  });

  test("without the app's header nothing is counted", async () => {
    const response = await post(good, false);
    expect(response.status).toBe(400);
    expect(sent).toHaveLength(0);
  });

  test.each([
    ["not JSON", "{"],
    ["an array", [["0.54.25", "stable", "0"]]],
    ["null", null],
    ["a missing version", { channel: "stable", age: "0" }],
    ["a missing age", { version: "0.54.25", channel: "stable" }],
    ["an unknown channel", { ...good, channel: "beta" }],
    ["an unknown age", { ...good, age: "8" }],
    ["a number for an age", { ...good, age: 0 }],
    ["a tag for a version", { ...good, version: "v0.54.25" }],
    ["a suffixed version", { ...good, version: "0.54.25-dev" }],
    ["a two part version", { ...good, version: "0.54" }],
    ["an endless version", { ...good, version: "0.54.123456" }],
    ["a number for a version", { ...good, version: 54 }],
    ["an id alongside", { ...good, id: "abc" }],
    ["a date alongside", { ...good, day: "2026-11-12" }],
  ])("%s is refused and nothing is counted", async (_, body) => {
    const response = await post(body);
    expect(response.status).toBe(400);
    expect(sent).toHaveLength(0);
  });

  test("without a store the answer says so, and the app tries later", async () => {
    settings = {};
    const response = await post(good);
    expect(response.status).toBe(503);
    expect(sent).toHaveLength(0);
  });

  test.each([
    ["an error status", () => new Response("down", { status: 500 })],
    [
      "a command's error",
      () =>
        Response.json([
          { result: 1 },
          { error: "WRONGTYPE" },
          { result: 1 },
          { result: 1 },
        ]),
    ],
    ["too few results", () => Response.json([{ result: 1 }])],
    ["an unreadable answer", () => new Response("<html>")],
  ])("a store that fails with %s answers 502", async (_, answer) => {
    upstash(answer);
    await quietly(async () => {
      expect((await post(good)).status).toBe(502);
    });
  });

  test("a store that cannot be reached answers 502", async () => {
    globalThis.fetch = mock(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await quietly(async () => {
      expect((await post(good)).status).toBe(502);
    });
  });
});

describe("parsePost", () => {
  test("takes exactly the three fields, in any order", () => {
    expect(
      parsePost({ age: "90+", version: "1.0.0", channel: "preview" }),
    ).toEqual({ version: "1.0.0", channel: "preview", age: "90+" });
  });
});

describe("reading the count", () => {
  test("the days read are the whole UTC days before now, oldest first", () => {
    expect(daysBefore(now, 3)).toEqual([
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
    ]);
    expect(dayOf(now)).toBe("2026-11-12");
  });

  test("each day's flat answer becomes its counters, versions newest first", async () => {
    upstash((commands) => {
      expect(commands).toEqual([
        ["HGETALL", "count:2026-11-10"],
        ["HGETALL", "count:2026-11-11"],
      ]);
      return Response.json([
        { result: [] },
        {
          result: [
            "total",
            "7",
            "version:0.54.9",
            "1",
            "version:0.54.25",
            "4",
            "version:0.55.0",
            "2",
            "channel:stable",
            "5",
            "channel:preview",
            "2",
            "age:30-89",
            "7",
            "unknown",
            "3",
          ],
        },
      ]);
    });
    const days = await run(readDays(now, 2));
    expect(days[0]).toEqual({
      day: "2026-11-10",
      total: 0,
      versions: [],
      channel: { stable: 0, preview: 0 },
      age: { "0": 0, "1-6": 0, "7-29": 0, "30-89": 0, "90+": 0 },
    });
    expect(days[1].total).toBe(7);
    expect(days[1].versions).toEqual([
      { version: "0.55.0", count: 2 },
      { version: "0.54.25", count: 4 },
      { version: "0.54.9", count: 1 },
    ]);
    expect(days[1].channel).toEqual({ stable: 5, preview: 2 });
    expect(days[1].age["30-89"]).toBe(7);
  });
});
