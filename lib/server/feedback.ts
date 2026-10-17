// Feedback from the app's Send Feedback window, forwarded by email. The
// address it reaches lives only in this deployment's environment, never in
// the app, the site or the source:
//   RESEND_API_KEY   the Resend key that sends it
//   FEEDBACK_TO      where it arrives
//   FEEDBACK_FROM    the sender, on a domain Resend has verified
// Without them the endpoint says it is not set up, and the app keeps the
// note on the clipboard so nothing written is lost.
//
// A note that carries an Idempotency-Key is sent once however often it is
// posted: the app keeps a note until it knows it arrived, so a note whose
// answer was lost is posted again with the same key, and the key goes on to
// Resend, which answers a repeat with the first answer instead of sending
// the email again (Resend keeps a key for 24 hours).
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

/** The key as the app sends it: the app draws 32 hex digits, and anything of
    8 to 128 letters, digits, dots, colons, underscores and hyphens is taken.
    Anything else is ignored, not refused: an older app sends none, and a
    note without a key is a note that must still arrive. */
const keyShape = /^[A-Za-z0-9._:-]{8,128}$/;

/** What Resend is given as the email's Idempotency-Key, or undefined for no
    key. Resend's keys are one space for the whole account (1 to 256
    characters), so the app's is made a path under this endpoint's own name:
    nothing else that sends through the account can meet it, and a key
    someone invented cannot stand in for another endpoint's. */
export function resendKey(request: Request): string | undefined {
  const key = request.headers.get("idempotency-key")?.trim();
  return key && keyShape.test(key) ? `lodestar-feedback/${key}` : undefined;
}

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
  const idempotency = resendKey(request);

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
    (email) =>
      idempotency
        ? HttpClientRequest.setHeader(email, "Idempotency-Key", idempotency)
        : email,
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
