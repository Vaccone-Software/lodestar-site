// The stable channel: which build a Mac on stable takes, what a new
// visitor downloads, and what the Homebrew cask points at. The rule lives
// in lib/promotion.ts and the reading in lib/server, so this file only
// says it over HTTP.
//
// A good answer is cached at the edge for five minutes and served stale
// for a day while it refreshes, so GitHub stumbling is invisible. A
// failure is never cached: the next ask tries again.

import { Effect } from "effect";
import { runtime, stableAnswer } from "@/lib/server/stable";

const fresh = "public, s-maxage=300, stale-while-revalidate=86400";

const failure = (status: number, error: string) =>
  Response.json(
    { error },
    { status, headers: { "cache-control": "no-store" } },
  );

export function GET(): Promise<Response> {
  return runtime.runPromise(
    stableAnswer(Date.now()).pipe(
      Effect.map((body) =>
        Response.json(body, { headers: { "cache-control": fresh } }),
      ),
      Effect.catchTags({
        Unreachable: (error) => Effect.succeed(failure(503, error.message)),
        RateLimited: (error) => Effect.succeed(failure(503, error.message)),
        Malformed: (error) =>
          Effect.succeed(
            failure(
              502,
              `GitHub's answer was not a releases list: ${error.message}`,
            ),
          ),
        NoStable: (error) => Effect.succeed(failure(503, error.message)),
      }),
    ),
  );
}
