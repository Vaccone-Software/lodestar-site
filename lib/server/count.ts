// The daily count: how many Macs used Lodestar today, and nothing more.
//
// The app posts once in a UTC day, after the first time its person uses it,
// with exactly three facts: its Lodestar version, its update channel and a
// coarse install age. It sends no ID and no date, and the Mac remembers
// which day it last sent, so this side has nothing that could tie one day's
// post to another's or to a Mac. The day is the server's, read when the
// post arrives.
//
// Each post adds one to four counters of that day's hash: the total, the
// version, the channel and the age, each on its own. That answers every
// question the count is for (how many, on which builds, how new) without
// a row per Mac. The IP address a request shows is not read, logged or
// kept.
//
// The body must be exactly those three fields with known shapes. Anything
// else is refused, which keeps junk out without keeping addresses to rate
// limit by, and makes a mistake in a future app build loud rather than
// quietly counted.
//
// The route (app/api/count/route.ts) only runs this; the store's settings
// are read through lib/server/config.ts. Server only.

import { Effect, Predicate, Redacted, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import { countStore } from "@/lib/server/config";

export const channels = ["stable", "preview"] as const;
export const ages = ["0", "1-6", "7-29", "30-89", "90+"] as const;
export type Channel = (typeof channels)[number];
export type Age = (typeof ages)[number];

/** A post the count takes. */
export type Post = { version: string; channel: Channel; age: Age };

/** A release's version as the app reports it: three plain numbers, no "v"
    and no suffix, bounded so junk cannot mint endless counters. */
const versionShape = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

class NotFromLodestar extends Schema.TaggedError<NotFromLodestar>()(
  "NotFromLodestar",
  {},
) {}
class NotSetUp extends Schema.TaggedError<NotSetUp>()("NotSetUp", {}) {}
class Refused extends Schema.TaggedError<Refused>()("Refused", {}) {}
class StoreFailed extends Schema.TaggedError<StoreFailed>()("StoreFailed", {
  status: Schema.optional(Schema.Number),
  detail: Schema.String,
}) {}

/** The UTC day a moment falls in, as the store's key names it. */
export const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);

const keyOf = (day: string) => `count:${day}`;

/** The post a body is, or undefined for anything that is not exactly the
    three fields with values the app can send. */
export function parsePost(body: unknown): Post | undefined {
  if (!Predicate.isObject(body) || Array.isArray(body)) return undefined;
  const fields = body as Record<string, unknown>;
  const keys = Object.keys(fields).sort();
  if (keys.join(",") !== "age,channel,version") return undefined;
  const { version, channel, age } = fields;
  if (!Predicate.isString(version) || !versionShape.test(version))
    return undefined;
  if (!channels.includes(channel as Channel)) return undefined;
  if (!ages.includes(age as Age)) return undefined;
  return { version, channel: channel as Channel, age: age as Age };
}

/** The four increments one post makes, as Upstash's pipeline takes them. */
export const increments = (post: Post, day: string) =>
  [
    ["HINCRBY", keyOf(day), "total", "1"],
    ["HINCRBY", keyOf(day), `version:${post.version}`, "1"],
    ["HINCRBY", keyOf(day), `channel:${post.channel}`, "1"],
    ["HINCRBY", keyOf(day), `age:${post.age}`, "1"],
  ] as const;

/** Runs commands in one Upstash pipeline; any command's error fails it. */
const pipeline = Effect.fn("count.pipeline")(function* (
  commands: ReadonlyArray<ReadonlyArray<string>>,
) {
  const { url, token } = yield* countStore.pipe(
    Effect.mapError(() => new NotSetUp()),
  );
  const client = yield* HttpClient.HttpClient;
  const response = yield* HttpClientRequest.post(
    `${url.replace(/\/+$/, "")}/pipeline`,
  ).pipe(
    HttpClientRequest.bearerToken(Redacted.value(token)),
    HttpClientRequest.bodyJsonUnsafe(commands),
    client.execute,
    Effect.mapError((error) => new StoreFailed({ detail: error.message })),
  );
  const text = yield* response.text.pipe(Effect.orElseSucceed(() => ""));
  if (response.status < 200 || response.status >= 300)
    return yield* new StoreFailed({ status: response.status, detail: text });
  const results = yield* Effect.try({
    try: () => JSON.parse(text) as unknown,
    catch: () => new StoreFailed({ detail: "unreadable answer" }),
  });
  if (
    !Array.isArray(results) ||
    results.length !== commands.length ||
    results.some((entry) => !Predicate.isObject(entry) || "error" in entry)
  )
    return yield* new StoreFailed({ detail: text.slice(0, 500) });
  return results.map((entry) => (entry as { result: unknown }).result);
});

const count = Effect.fn("count.add")(function* (request: Request, now: number) {
  // Not a secret, just a door only the app walks through: a browser or a
  // crawler posting here is turned away before anything is counted.
  if (request.headers.get("x-lodestar-count") !== "1")
    return yield* new NotFromLodestar();
  const body = yield* Effect.tryPromise({
    try: () => request.json() as Promise<unknown>,
    catch: () => new Refused(),
  });
  const post = parsePost(body);
  if (!post) return yield* new Refused();
  yield* pipeline(increments(post, dayOf(now)));
});

const plain = (status: number, error: string) =>
  Response.json(
    { error },
    { status, headers: { "cache-control": "no-store" } },
  );

/** The answer to one post: 204 counted, 400 refused (the app does not try
    again), 503 or 502 when the store is missing or failed (the app tries
    again later that day). This never fails. */
export const respond = (request: Request, now: number) =>
  count(request, now).pipe(
    Effect.as(
      new Response(null, {
        status: 204,
        headers: { "cache-control": "no-store" },
      }),
    ),
    Effect.catchTags({
      NotFromLodestar: () => Effect.succeed(plain(400, "not from Lodestar")),
      Refused: () => Effect.succeed(plain(400, "refused")),
      NotSetUp: () => Effect.succeed(plain(503, "count is not set up")),
      StoreFailed: (error) =>
        Effect.sync(() => {
          console.error(
            "count: store failed",
            error.status ?? "no answer",
            error.detail,
          );
          return plain(502, "could not count");
        }),
    }),
  );
