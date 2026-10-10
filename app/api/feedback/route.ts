// POST /api/feedback: the app's Send Feedback window. What a note becomes
// and every answer it can get live in lib/server/feedback.ts; this runs it
// with the real HTTP client and the deployment's settings.

import { Effect } from "effect";
import { respond } from "@/lib/server/feedback";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";

export function POST(request: Request): Promise<Response> {
  return Effect.runPromise(
    respond(request).pipe(fetchAtCallTime, Effect.provide(HttpLive)),
  );
}
