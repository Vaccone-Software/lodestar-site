// GitHub's releases list, read once and read carefully: a time limit, a
// few quick retries when GitHub stumbles, and every entry decoded against
// the shape promotion needs, so a rate-limit page or a changed field is a
// named failure and never a wrong answer. Server only.
//
// GITHUB_TOKEN (lib/server/config.ts), when the deployment has one, lifts
// the anonymous limit of sixty requests an hour that Vercel's shared
// addresses can run through. It needs no permissions: the list is public.

import {
  Cause,
  Context,
  Effect,
  Exit,
  Layer,
  Option,
  Redacted,
  Schedule,
  Schema,
} from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";
import { unstable_cache } from "next/cache";
import { gitHubToken } from "@/lib/server/config";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";

export const releasesUrl =
  "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=100";

/** How long a read of the list is kept before GitHub is asked again. A
    failed ask keeps serving the last good list (see `layerCached`). */
export const freshFor = 300;

const Asset = Schema.Struct({
  name: Schema.String,
  browser_download_url: Schema.String,
});

/** One release, as much of it as promotion and the download read. */
export const GitHubRelease = Schema.Struct({
  tag_name: Schema.String,
  name: Schema.NullOr(Schema.String),
  draft: Schema.Boolean,
  published_at: Schema.NullOr(Schema.String),
  assets: Schema.Array(Asset),
});
export type GitHubRelease = typeof GitHubRelease.Type;

const GitHubReleases = Schema.Array(GitHubRelease);

/** GitHub did not answer, or answered with a failure. `transient` is a
    stumble worth one more try: no connection, a time out, a 5xx. */
export class Unreachable extends Schema.TaggedError<Unreachable>()(
  "Unreachable",
  {
    message: Schema.String,
    transient: Schema.Boolean,
  },
) {}

/** GitHub said no more for now. Asking again soon only makes it longer. */
export class RateLimited extends Schema.TaggedError<RateLimited>()(
  "RateLimited",
  {
    message: Schema.String,
  },
) {}

/** GitHub answered, but not with a releases list. */
export class Malformed extends Schema.TaggedError<Malformed>()("Malformed", {
  message: Schema.String,
}) {}

export type ReleasesError = Unreachable | RateLimited | Malformed;

const headers = (
  token: Option.Option<Redacted.Redacted<string>>,
): Record<string, string> => ({
  accept: "application/vnd.github+json",
  "user-agent": "lodestar-site",
  "x-github-api-version": "2022-11-28",
  ...Option.match(token, {
    onNone: () => ({}),
    onSome: (token) => ({ authorization: `Bearer ${Redacted.value(token)}` }),
  }),
});

const judge = (
  response: HttpClientResponse.HttpClientResponse,
): Effect.Effect<ReadonlyArray<GitHubRelease>, ReleasesError> => {
  if (
    response.status === 429 ||
    (response.status === 403 &&
      response.headers["x-ratelimit-remaining"] === "0")
  )
    return Effect.fail(
      new RateLimited({
        message: `GitHub's rate limit (HTTP ${response.status})`,
      }),
    );
  if (response.status < 200 || response.status >= 300)
    return Effect.fail(
      new Unreachable({
        message: `GitHub answered HTTP ${response.status}`,
        transient: response.status >= 500,
      }),
    );
  return HttpClientResponse.schemaBodyJson(GitHubReleases)(response).pipe(
    Effect.mapError((error) => new Malformed({ message: error.message })),
  );
};

const isReleasesError = (error: unknown): error is ReleasesError =>
  error instanceof Unreachable ||
  error instanceof RateLimited ||
  error instanceof Malformed;

/** Asks GitHub: eight seconds at most, two more tries for a stumble. */
const make = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient;
  const token = yield* gitHubToken;
  const once = client.get(releasesUrl, { headers: headers(token) }).pipe(
    Effect.mapError(
      (error) => new Unreachable({ message: error.message, transient: true }),
    ),
    Effect.flatMap(judge),
    fetchAtCallTime,
    Effect.timeout("8 seconds"),
    Effect.catchTag("TimeoutError", () =>
      Effect.fail(
        new Unreachable({
          message: "GitHub took longer than eight seconds",
          transient: true,
        }),
      ),
    ),
  );
  const list = once.pipe(
    Effect.retry({
      schedule: Schedule.exponential("250 millis").pipe(Schedule.jittered),
      times: 2,
      while: (error) => error._tag === "Unreachable" && error.transient,
    }),
    Effect.withSpan("Releases.list"),
  );
  return { list };
});

/** The list through Next's cache: kept `freshFor` seconds across every page
    and the endpoint, refreshed behind the answer, and the last good list
    kept when a refresh fails. Not fetch's own cache: Next skips that for
    a request carrying a token in a route that renders per request, which
    is exactly /api/stable with GITHUB_TOKEN set. A failure is never kept:
    the error comes back out typed, and the next ask tries again. */
const throughNextCache = (
  list: Effect.Effect<ReadonlyArray<GitHubRelease>, ReleasesError>,
) => {
  const cached = unstable_cache(
    async () => {
      const exit = await Effect.runPromiseExit(list);
      if (Exit.isSuccess(exit)) return exit.value;
      throw Cause.squash(exit.cause);
    },
    ["github-releases", releasesUrl],
    { revalidate: freshFor },
  );
  return Effect.tryPromise({
    try: () => cached(),
    catch: (error) =>
      isReleasesError(error)
        ? error
        : new Unreachable({ message: String(error), transient: false }),
  });
};

export class Releases extends Context.Service<
  Releases,
  { readonly list: Effect.Effect<ReadonlyArray<GitHubRelease>, ReleasesError> }
>()("lodestar-site/Releases") {
  /** GitHub, asked every time: for tests, and anywhere outside Next. */
  static readonly layer = Layer.effect(
    Releases,
    Effect.map(make, (service) => Releases.of(service)),
  ).pipe(Layer.provide(HttpLive));

  /** GitHub through Next's cache: what the site runs on. */
  static readonly layerCached = Layer.effect(
    Releases,
    Effect.map(make, ({ list }) =>
      Releases.of({ list: throughNextCache(list) }),
    ),
  ).pipe(Layer.provide(HttpLive));
}
