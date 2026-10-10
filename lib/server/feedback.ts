// Feedback from the app's Send Feedback window, forwarded by email. The
// address it reaches lives only in this deployment's environment, never in
// the app, the site or the source:
//   RESEND_API_KEY   the Resend key that sends it
//   FEEDBACK_TO      where it arrives
//   FEEDBACK_FROM    the sender, on a domain Resend has verified
// Without them the endpoint says it is not set up, and the app keeps the
// note on the clipboard so nothing written is lost.
//
// Each way a note can fail is its own error, and each error is one answer:
// the app reads the status, and these are the statuses it has always had.
//
// The route (app/api/feedback/route.ts) only runs this; the settings are
// read through lib/server/config.ts. Server only.

import { Effect, Predicate, Redacted, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/http";
import { feedback } from "@/lib/server/config";

const limits = {
  message: 10_000,
  replyTo: 200,
  field: 100,
  diagnostics: 60_000,
};

class NotFromLodestar extends Schema.TaggedError<NotFromLodestar>()(
  "NotFromLodestar",
  {},
) {}
class NotSetUp extends Schema.TaggedError<NotSetUp>()("NotSetUp", {}) {}
class Unreadable extends Schema.TaggedError<Unreadable>()("Unreadable", {}) {}
class Empty extends Schema.TaggedError<Empty>()("Empty", {}) {}
class NotSent extends Schema.TaggedError<NotSent>()("NotSent", {
  status: Schema.optional(Schema.Number),
  detail: Schema.String,
}) {}

function text(value: unknown, max: number): string | undefined {
  if (!Predicate.isString(value)) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

const send = Effect.fn("feedback.send")(function* (request: Request) {
  // Not a secret, just a door only the app walks through: a form or a
  // crawler posting here without it is turned away before anything sends.
  if (request.headers.get("x-lodestar-feedback") !== "1")
    return yield* new NotFromLodestar();
  const { key, to, from } = yield* feedback.pipe(
    Effect.mapError(() => new NotSetUp()),
  );

  const body = yield* Effect.tryPromise({
    try: () => request.json() as Promise<unknown>,
    catch: () => new Unreadable(),
  });
  const field = (name: string) =>
    Predicate.isObject(body)
      ? (body as Record<string, unknown>)[name]
      : undefined;
  const message = text(field("message"), limits.message);
  if (!message) return yield* new Empty();
  const replyTo = text(field("replyTo"), limits.replyTo);
  const validReply =
    replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? replyTo : undefined;
  const version = text(field("version"), limits.field) ?? "unknown";
  const macos = text(field("macos"), limits.field) ?? "unknown";
  const diagnostics = text(field("diagnostics"), limits.diagnostics);

  const lines = [
    message,
    "",
    "---",
    `Lodestar ${version} · macOS ${macos}`,
    validReply ? `Reply to: ${validReply}` : "No reply address given",
    ...(diagnostics ? ["", "Diagnostic report:", diagnostics] : []),
  ];
  const client = yield* HttpClient.HttpClient;
  const response = yield* HttpClientRequest.post(
    "https://api.resend.com/emails",
  ).pipe(
    HttpClientRequest.bearerToken(Redacted.value(key)),
    HttpClientRequest.bodyJsonUnsafe({
      from,
      to: [to],
      subject: `Lodestar feedback · ${version}: ${message.split("\n")[0].slice(0, 60)}`,
      text: lines.join("\n"),
      ...(validReply ? { reply_to: validReply } : {}),
    }),
    client.execute,
    Effect.mapError((error) => new NotSent({ detail: error.message })),
  );
  if (response.status < 200 || response.status >= 300) {
    const detail = yield* response.text.pipe(Effect.orElseSucceed(() => ""));
    return yield* new NotSent({ status: response.status, detail });
  }
});

/** The answer to one note: every failure is one status, so this never fails.
    The HTTP client and the settings come from whoever runs it. */
export const respond = (request: Request) =>
  send(request).pipe(
    Effect.as(Response.json({ ok: true })),
    Effect.catchTags({
      NotFromLodestar: () =>
        Effect.succeed(
          Response.json({ error: "not from Lodestar" }, { status: 400 }),
        ),
      NotSetUp: () =>
        Effect.succeed(
          Response.json({ error: "feedback is not set up" }, { status: 503 }),
        ),
      Unreadable: () =>
        Effect.succeed(Response.json({ error: "unreadable" }, { status: 400 })),
      Empty: () =>
        Effect.succeed(Response.json({ error: "empty" }, { status: 400 })),
      NotSent: (error) =>
        Effect.sync(() => {
          console.error(
            "feedback: resend refused",
            error.status ?? "no answer",
            error.detail,
          );
          return Response.json({ error: "could not send" }, { status: 502 });
        }),
    }),
  );
