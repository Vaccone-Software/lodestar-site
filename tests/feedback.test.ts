// POST /api/feedback's answers (lib/server/feedback.ts), with Resend played
// by a stand-in fetch and the deployment's settings handed over through a
// ConfigProvider, never written into process.env: every answer the app
// reads, and the email it sends.
// Runs without a build: `bun test tests/feedback.test.ts`.

import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { ConfigProvider, Effect } from "effect";
import { respond } from "@/lib/server/feedback";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";

const realFetch = globalThis.fetch;
const env = {
  RESEND_API_KEY: "re_test",
  FEEDBACK_TO: "to@example.com",
  FEEDBACK_FROM: "from@example.com",
};
let settings: Record<string, string> = { ...env };
let sent: { url: string; init: RequestInit }[] = [];

const resend = (respond: () => Response) => {
  sent = [];
  globalThis.fetch = mock(
    async (url: string | URL | Request, init?: RequestInit) => {
      sent.push({ url: String(url), init: init ?? {} });
      return respond();
    },
  ) as unknown as typeof fetch;
};

const post = (body: unknown, header = true) =>
  run(
    new Request("https://lodestar.vaccone.software/api/feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(header ? { "x-lodestar-feedback": "1" } : {}),
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const run = (request: Request) =>
  Effect.runPromise(
    respond(request).pipe(
      fetchAtCallTime,
      Effect.provide(HttpLive),
      Effect.provide(
        ConfigProvider.layer(ConfigProvider.fromEnv({ env: settings })),
      ),
    ),
  );

beforeEach(() => {
  settings = { ...env };
  resend(() => Response.json({ id: "sent" }));
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("/api/feedback", () => {
  test("a note from the app is sent, and the answer is ok", async () => {
    const response = await post({
      message: "  The pill is lovely\nsecond line ",
      replyTo: "me@example.com",
      version: "0.47.0",
      macos: "26.1",
      diagnostics: "log lines",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe("https://api.resend.com/emails");
    expect(new Headers(sent[0].init.headers).get("authorization")).toBe(
      "Bearer re_test",
    );
    const email = JSON.parse(
      new TextDecoder().decode(sent[0].init.body as Uint8Array),
    );
    expect(email.from).toBe("from@example.com");
    expect(email.to).toEqual(["to@example.com"]);
    expect(email.reply_to).toBe("me@example.com");
    expect(email.subject).toBe(
      "Lodestar feedback · 0.47.0: The pill is lovely",
    );
    expect(email.text).toBe(
      "The pill is lovely\nsecond line\n\n---\nLodestar 0.47.0 · macOS 26.1\nReply to: me@example.com\n\nDiagnostic report:\nlog lines",
    );
  });

  test("a reply address that is not one is left out", async () => {
    await post({ message: "hi", replyTo: "not an address" });
    const email = JSON.parse(
      new TextDecoder().decode(sent[0].init.body as Uint8Array),
    );
    expect(email.reply_to).toBeUndefined();
    expect(email.text).toContain("No reply address given");
    expect(email.text).toContain("Lodestar unknown · macOS unknown");
  });

  test("without the app's header it is turned away, and nothing sends", async () => {
    const response = await post({ message: "hi" }, false);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "not from Lodestar" });
    expect(sent).toHaveLength(0);
  });

  test("without the deployment's settings it says so", async () => {
    delete settings.RESEND_API_KEY;
    const response = await post({ message: "hi" });
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "feedback is not set up" });
    expect(sent).toHaveLength(0);
  });

  test("a body that is not JSON is unreadable", async () => {
    const response = await post("{not json");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "unreadable" });
  });

  test("an empty note is empty", async () => {
    for (const body of [{ message: "   " }, {}, [1, 2], "5"]) {
      const response = await post(body);
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "empty" });
    }
    expect(sent).toHaveLength(0);
  });

  test("Resend refusing is a 502", async () => {
    resend(() => new Response("bad from address", { status: 422 }));
    const response = await post({ message: "hi" });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "could not send" });
  });

  test("Resend out of reach is a 502, not a crash", async () => {
    resend(() => {
      throw new TypeError("fetch failed");
    });
    const response = await post({ message: "hi" });
    expect(response.status).toBe(502);
  });
});
