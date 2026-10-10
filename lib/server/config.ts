// Every setting the server reads from its deployment, in one place and
// through Effect's Config: a secret is Redacted from the moment it is
// read, so it never reaches a log or an error message, and a test hands
// the server its settings with a ConfigProvider instead of rewriting
// process.env. Server only.

import { Config, Option } from "effect";

/** GITHUB_TOKEN, when the deployment has one: lifts GitHub's anonymous
    limit of sixty requests an hour. It needs no permissions. */
export const gitHubToken = Config.option(Config.Redacted("GITHUB_TOKEN"));

/** What Send Feedback needs, all three or none: the Resend key, where a
    note arrives, and the sender on a domain Resend has verified. */
export const feedback = Config.all({
  key: Config.Redacted("RESEND_API_KEY"),
  to: Config.NonEmptyString("FEEDBACK_TO"),
  from: Config.NonEmptyString("FEEDBACK_FROM"),
});

/** Whether this is Next's server or build (Next sets NEXT_RUNTIME), where
    the releases list goes through Next's cache, rather than the tests. */
export const insideNext = Config.option(
  Config.NonEmptyString("NEXT_RUNTIME"),
).pipe(Config.map(Option.isSome));
