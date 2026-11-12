// POST /api/count: the app's daily count. What a post is, what it adds and
// every answer it can get live in lib/server/count.ts; this runs it with the
// real HTTP client and the deployment's settings. Never cached.

import { Effect } from "effect";
import { respond } from "@/lib/server/count";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export function POST(request: Request): Promise<Response> {
  return Effect.runPromise(
    respond(request, Date.now()).pipe(
      fetchAtCallTime,
      Effect.provide(HttpLive),
    ),
  );
}
