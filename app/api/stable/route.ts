// The stable channel: which build a Mac on stable takes, what a new
// visitor downloads, and what the Homebrew cask points at. The rule lives
// in lib/promotion.ts and the reading in lib/server, so this file only
// says it over HTTP.
//
// A good answer is kept at the edge for a minute, with no stale window:
// a day-long stale-while-revalidate let Vercel's edge serve one answer
// for hours while its background refresh never landed (seen 2026-10-10,
// age 6440 s, two releases behind). GitHub stumbling stays invisible
// without it, because the list itself is kept five minutes and its last
// good copy outlives a failed refresh (lib/server/github.ts). A failure is
// never cached: the next ask tries again.

import { Effect } from "effect";
import { runtime, stableAnswer } from "@/lib/server/stable";

const fresh = "public, max-age=0, s-maxage=60";

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
