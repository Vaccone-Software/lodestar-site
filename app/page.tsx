import CopyCommand from "@/components/CopyCommand";
import DownloadButton from "@/components/DownloadButton";
import LatestVersion from "@/components/LatestVersion";
import Mark from "@/components/Mark";
import ScrollCue from "@/components/ScrollCue";
import Starfield from "@/components/Starfield";
import { specification } from "@/data/gestures";

const repo = "https://github.com/Vaccone-Software/lodestar";

// Baked at build so the static page is right on deploy day; the client
// re-reads the API so it stays right between deploys.
async function latestTag(): Promise<string> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1",
    );
    const data = await response.json();
    const tag = data?.[0]?.tag_name;
    if (typeof tag === "string" && tag.startsWith("v")) return tag;
  } catch {}
  return "v0.9.8";
}

function SectionLabel({
  index,
  title,
  href,
}: {
  index: string;
  title: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group border-hairline mb-8 flex items-baseline gap-3 border-b pb-3"
    >
      <span className="text-accent text-xs tracking-[0.25em]">{index}</span>
      <h2 className="text-dim group-hover:text-ink text-xs tracking-[0.25em] uppercase transition-colors">
        {title}
      </h2>
    </a>
  );
}

function Keys({ children }: { children: string }) {
  return (
    <kbd className="group-hover/row:border-accent/40 inline-block rounded-[5px] border border-white/15 bg-white/[0.04] px-1.5 py-0.5 text-[12px] whitespace-nowrap transition-colors">
      {children}
    </kbd>
  );
}

export default async function Page() {
  const baked = await latestTag();
  return (
    <main>
      {/* The hero escapes the column so the sky can run full bleed; the
          constellations need the whole viewport to land on screen. */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <Starfield />
        <div className="to-ground pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent" />
        <div className="relative flex flex-col items-center">
          <Mark size={104} />
          <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">
            Lodestar
          </h1>
          <p className="text-dim mt-4 max-w-md text-balance">
            Keyboard navigation for macOS. Destination over process.
          </p>
          <div className="mt-10 w-full max-w-xl">
            <DownloadButton fallback={baked} />
            <div className="mt-3">
              <CopyCommand command="brew install --cask vaccone-software/tap/lodestar" />
            </div>
            <p className="text-faint mt-3 text-xs">
              notarized ·{" "}
              <a
                href={`${repo}/releases`}
                className="text-dim hover:text-ink underline decoration-white/25 underline-offset-4"
              >
                all releases
              </a>
              {" · "}
              <LatestVersion fallback={baked} /> · macOS 13 or later · Fair
              Source
            </p>
          </div>
        </div>
        <ScrollCue />
      </section>

      <div className="mx-auto max-w-2xl px-6">
        <section id="premise" className="py-20">
          <SectionLabel index="01" title="The premise" href="#premise" />
          <div className="text-dim space-y-5 leading-relaxed">
            <p>
              Most window tools ask you to manage windows. Arrange them, resize
              them, cycle through them.{" "}
              <span className="text-ink">
                Lodestar starts from a different premise: you never wanted to
                manage windows. You wanted to be somewhere.
              </span>
            </p>
            <p>
              So every gesture names a destination, and the system takes you
              there. Full screen, instantly, silently. <Keys>hyper S</Keys> and
              you are in Slack. Not launching, not arranging. There.
            </p>
            <p>
              One grammar spans launching, windows, the inside of apps, and the
              web. Learn it once. Your hands know it everywhere.
            </p>
          </div>
        </section>

        <section id="specification" className="py-20">
          <SectionLabel
            index="02"
            title="The specification"
            href="#specification"
          />
          <div className="space-y-12">
            {specification.map((group) => (
              <div key={group.label}>
                <h3 className="text-ink mb-4 text-sm">{group.label}</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    {group.gestures.map((gesture) => (
                      <tr
                        key={gesture.keys}
                        className="border-hairline group/row border-t transition-colors last:border-b hover:bg-white/[0.02]"
                      >
                        <td className="w-36 py-2.5 pr-4 align-top sm:w-44">
                          <Keys>{gesture.keys}</Keys>
                        </td>
                        <td className="text-dim group-hover/row:text-ink py-2.5 text-[13px] leading-relaxed transition-colors sm:text-sm">
                          {gesture.meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        <section id="philosophy" className="py-20">
          <SectionLabel index="03" title="The philosophy" href="#philosophy" />
          <div className="text-dim space-y-5 leading-relaxed">
            <p>
              Every feature faces one test before it ships:{" "}
              <span className="text-ink">
                does it become a fixed gesture the hand owns, or does it force a
                fresh decision every time?
              </span>{" "}
              If it forces decisions, it gets cut.
            </p>
            <p>
              That is why chains wait indefinitely instead of timing out. Why
              successful navigation is silent: the screen changing is the
              feedback. Why windows you did not summon are left alone. And why
              the system teaches its own map: hold hyper, and every destination
              shows itself.
            </p>
            <p>
              The full reasoning is written down:{" "}
              <a
                href={`${repo}/blob/main/DESIGN.md`}
                className="text-ink underline decoration-white/25 underline-offset-4"
              >
                the design
              </a>
              ,{" "}
              <a
                href={`${repo}/blob/main/GUIDE.md`}
                className="text-ink underline decoration-white/25 underline-offset-4"
              >
                the reference
              </a>
              , and{" "}
              <a
                href={`${repo}/blob/main/FINDINGS.md`}
                className="text-ink underline decoration-white/25 underline-offset-4"
              >
                the engineering ledger
              </a>
              , where every platform assumption was probed before it was
              trusted.
            </p>
          </div>
        </section>

        <section id="install" className="py-20">
          <SectionLabel index="04" title="Install" href="#install" />
          <div className="text-dim space-y-5 leading-relaxed">
            <DownloadButton fallback={baked} />
            <CopyCommand command="brew install --cask vaccone-software/tap/lodestar" />
            <p>
              The download is a notarized DMG: drag Lodestar to Applications.
              Homebrew lands the same app.
            </p>
            <p>
              Open it, grant Accessibility, and Lodestar wakes on its own. Hyper
              is right ⌘, which stops being a command key. That is the trade,
              and it is configurable.
            </p>
            <p>
              Your config is one commented YAML file with schema backed
              completion, validated against your machine. A global CLI comes
              along: <Keys>lodestar check</Keys> <Keys>lodestar diagnose</Keys>{" "}
              <Keys>lodestar apps</Keys>. Agents get a stable contract in{" "}
              <a
                href={`${repo}/blob/main/AGENTS.md`}
                className="text-ink underline decoration-white/25 underline-offset-4"
              >
                AGENTS.md
              </a>
              .
            </p>
            <p className="text-faint">
              SIP stays on. Spaces stay untouched. One private API call,
              documented. 234 tests.
            </p>
          </div>
        </section>

        <footer className="border-hairline text-faint flex flex-col items-center gap-4 border-t py-16 text-center text-xs">
          <Mark size={40} />
          <p>Built and maintained by one person at Vaccone.</p>
          <p>
            <a href={repo} className="text-dim hover:text-ink">
              GitHub
            </a>
            {" · "}FSL 1.1 with an MIT future grant{" · "}© 2026 Vaccone
            Software Company
          </p>
        </footer>
      </div>
    </main>
  );
}
