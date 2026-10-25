import type { Metadata } from "next";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import { stableRelease } from "@/lib/server/stable";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Lodestar keeps what it records on your Mac. It has no account and no server that receives your data. What leaves your Mac, and when, is listed here.",
  alternates: { canonical: "/privacy" },
};

// What Lodestar keeps, what leaves the Mac and when, and what the site
// itself sees. Every line here is checked against the app's code: the
// network calls are the update check, the downloads the person agrees to
// and the feedback note they send, and nothing else. Change this page when
// any of that changes.

const label = "text-dim text-[13px] font-semibold";
const link = "text-ink decoration-ink/40 hover:decoration-ink underline underline-offset-4";
const email = "privacy@vaccone.software";
const updated = "25 October 2026";

const kept = [
  "Your settings, saved breaths and parked windows",
  "Your clipboard history, including text read from copied images",
  "The logbook of how you move between apps and windows, which the coach learns from",
  "The health record: keystroke timing, pointer movement, voice features when you dictate and your daily rhythm. It never records which keys you press, and never any audio",
  "A log of what Lodestar did, for working out what went wrong",
];

const leaves: { name: string; line: string }[] = [
  {
    name: "Update checks",
    line: "Lodestar asks this site, or GitHub for preview builds, for the newest version, and downloads updates from GitHub. The request carries Lodestar's version number and nothing about you, though like any web request it shows the server your IP address.",
  },
  {
    name: "Models you turn on",
    line: "When you turn on the editor or a dictation model and agree to the download, Lodestar fetches the model from Hugging Face.",
  },
  {
    name: "Feedback you send",
    line: "Send Feedback sends your note, the reply address if you give one, and the Lodestar and macOS versions. It reaches us by email through Resend. A diagnostic report goes with it only if you tick the box, and you can read it first. It can name windows that were open.",
  },
  {
    name: "Exports you make",
    line: "Exporting your health record writes it to a folder you choose. Where it goes from there is up to you.",
  },
];

const never = [
  "No account and no sign in",
  "No analytics or tracking in the app",
  "No ads",
  "Nothing sold, and nothing shared with anyone",
];

export default async function PrivacyPage() {
  const { tag } = await stableRelease();
  return (
    <>
      <Nav tag={tag} />
      <main id="main" className="min-h-svh px-4 pt-10 pb-16 md:px-6">
        <div className="mx-auto max-w-[920px]">
          <p className={label}>Privacy</p>
          <h1 className="font-display mt-3 max-w-[20ch] text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            What you do stays on your Mac
          </h1>
          <p className="text-dim mt-6 max-w-[62ch] text-[18px] leading-[1.55]">
            Lodestar has no account and no server that receives what it records. Everything it keeps stays on
            your Mac, and Vaccone Software never sees it.
          </p>
          <p className="text-dim mt-3 text-[13px]">Updated {updated}</p>

          <section className="pane mt-10 p-6 md:p-8">
            <h2 className="text-[18px] font-semibold">What Lodestar keeps, on your Mac</h2>
            <ul className="text-dim mt-3 max-w-[66ch] list-disc space-y-2 pl-5 text-[16px] leading-[1.55]">
              {kept.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-dim mt-5 max-w-[66ch] text-[16px] leading-[1.6]">
              The health record, the logbook, the clipboard history and the saved state are encrypted with
              AES-256, under keys kept in your login keychain. All of it lives in{" "}
              <code className="text-ink text-[15px]">~/.config/lodestar</code> and{" "}
              <code className="text-ink text-[15px]">~/.local/share/lodestar</code>.
            </p>
            <p className="text-dim mt-3 max-w-[66ch] text-[16px] leading-[1.6]">
              Dictation, the editor&apos;s grammar checks and settings search run on your Mac. What you say and
              write is not sent to a server.
            </p>
          </section>

          <section className="border-hairline mt-14 border-t pt-10">
            <h2 className="text-[23px] font-semibold tracking-[-0.01em]">What leaves your Mac, and when</h2>
            <p className="text-dim mt-2 max-w-[62ch] text-[16px] leading-[1.6]">
              Only these, and nothing else.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {leaves.map((item) => (
                <div key={item.name} className="pane p-6">
                  <h3 className="text-[16px] font-semibold">{item.name}</h3>
                  <p className="text-dim mt-2 text-[15px] leading-[1.55]">{item.line}</p>
                </div>
              ))}
            </div>
            <p className="text-dim mt-5 max-w-[66ch] text-[16px] leading-[1.6]">
              Sites and searches you open with Lodestar open in your browser, so the site you chose sees that
              visit as it would any other.
            </p>
          </section>

          <section className="border-hairline mt-14 grid gap-10 border-t pt-10 md:grid-cols-2">
            <div>
              <h2 className="text-[18px] font-semibold">What we never do</h2>
              <ul className="text-dim mt-3 list-disc space-y-2 pl-5 text-[16px] leading-[1.55]">
                {never.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">Research</h2>
              <p className="text-dim mt-2 text-[16px] leading-[1.6]">
                Lodestar does not give your record to researchers. If you join a study, you join it through the
                research group, under their ethics approval and their consent form, and you choose what to
                export to them. See{" "}
                <a href="/research" className={link}>
                  Research
                </a>
                .
              </p>
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">This website</h2>
              <p className="text-dim mt-2 text-[16px] leading-[1.6]">
                The site runs on Vercel, which keeps the usual server logs. Vercel Analytics counts page visits
                without cookies and without telling us who you are. Send to my Mac uses your phone&apos;s own
                share sheet, so nothing is sent to us.
              </p>
            </div>
            <div>
              <h2 className="text-[18px] font-semibold">Removing it</h2>
              <p className="text-dim mt-2 text-[16px] leading-[1.6]">
                Uninstall, under Quit in Lodestar&apos;s menu, can also remove everything Lodestar has kept, with
                the keys that open it. To have a feedback note you sent deleted, write to us.
              </p>
            </div>
          </section>

          <section className="border-hairline mt-14 border-t pt-10">
            <h2 className="text-[18px] font-semibold">Questions</h2>
            <p className="text-dim mt-2 max-w-[62ch] text-[16px] leading-[1.6]">
              Lodestar is made by Vaccone Software. Write to{" "}
              <a href={`mailto:${email}`} className={link}>
                {email}
              </a>
              .
            </p>
          </section>

          <Foot className="border-hairline mt-14 border-t pt-6" />
        </div>
      </main>
    </>
  );
}
