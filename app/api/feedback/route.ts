// Feedback from the app's Send Feedback window, forwarded by email. The
// address it reaches lives only in this deployment's environment, never in
// the app, the site or the source:
//   RESEND_API_KEY   the Resend key that sends it
//   FEEDBACK_TO      where it arrives
//   FEEDBACK_FROM    the sender, on a domain Resend has verified
// Without them the endpoint says it is not set up, and the app keeps the
// note on the clipboard so nothing written is lost.

const limits = { message: 10_000, replyTo: 200, field: 100, diagnostics: 60_000 };

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export async function POST(request: Request) {
  // Not a secret, just a door only the app walks through: a form or a
  // crawler posting here without it is turned away before anything sends.
  if (request.headers.get("x-lodestar-feedback") !== "1") {
    return Response.json({ error: "not from Lodestar" }, { status: 400 });
  }
  const key = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_TO;
  const from = process.env.FEEDBACK_FROM;
  if (!key || !to || !from) {
    return Response.json({ error: "feedback is not set up" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "unreadable" }, { status: 400 });
  }
  const message = text(body.message, limits.message);
  if (!message) return Response.json({ error: "empty" }, { status: 400 });
  const replyTo = text(body.replyTo, limits.replyTo);
  const validReply = replyTo && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? replyTo : undefined;
  const version = text(body.version, limits.field) ?? "unknown";
  const macos = text(body.macos, limits.field) ?? "unknown";
  const diagnostics = text(body.diagnostics, limits.diagnostics);

  const lines = [
    message,
    "",
    "---",
    `Lodestar ${version} · macOS ${macos}`,
    validReply ? `Reply to: ${validReply}` : "No reply address given",
    ...(diagnostics ? ["", "Diagnostic report:", diagnostics] : []),
  ];
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Lodestar feedback · ${version}: ${message.split("\n")[0].slice(0, 60)}`,
      text: lines.join("\n"),
      ...(validReply ? { reply_to: validReply } : {}),
    }),
  });
  if (!response.ok) {
    console.error("feedback: resend refused", response.status, await response.text());
    return Response.json({ error: "could not send" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
