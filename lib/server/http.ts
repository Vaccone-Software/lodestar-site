// The HTTP client every server route uses: Effect's fetch client, with
// fetch read at the moment of asking rather than when the runtime first
// looked. Next patches fetch for its data cache, and the tests stand in
// for GitHub and Resend the same way. Server only.

import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";

export const HttpLive = FetchHttpClient.layer;

export const fetchAtCallTime = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.provideService(FetchHttpClient.Fetch, ((input, init) =>
      globalThis.fetch(input, init)) as typeof fetch),
  );
