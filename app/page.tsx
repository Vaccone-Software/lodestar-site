import CopyCommand from "@/components/CopyCommand";
import DownloadButton from "@/components/DownloadButton";
import LatestVersion from "@/components/LatestVersion";
import Mark from "@/components/Mark";
import Starfield from "@/components/Starfield";

const repo = "https://github.com/Vaccone-Software/lodestar";

// Baked at build so the static page is right on deploy day; the client
// re-reads the API so it stays right between deploys.
//
// no-store is load bearing. Next keeps a persistent data cache between
// builds, and a cached answer here bakes whatever version was current the
// last time the cache was written.
async function latestTag(): Promise<string> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/Vaccone-Software/lodestar/releases?per_page=1",
      { cache: "no-store" },
    );
    const data = await response.json();
    const tag = data?.[0]?.tag_name;
    if (typeof tag === "string" && tag.startsWith("v")) return tag;
  } catch {}
  return "v0.11.5";
}

/** The shots are photographed against the page's own ground, so their edges
    must not announce themselves. Inline rather than a class: a utility layer
    that also touches mask-image beats a plain rule and the frame comes back. */
const feather = {
  WebkitMaskImage:
    "radial-gradient(100% 100% at 50% 50%, #000 40%, transparent 90%)",
  maskImage: "radial-gradient(100% 100% at 50% 50%, #000 40%, transparent 90%)",
} as const;

/** A gesture, the name of what it opens, and what that thing actually is.
    A keycap with no name beside it is a crossword clue. */
function KeyRow({
  keys,
  name,
  children,
}: {
  keys: string[];
  name?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-hairline flex items-baseline gap-x-4 border-t py-3">
      <span className="flex shrink-0 items-center gap-1.5">
        {keys.map((key) => (
          <span
            key={key}
            className="border-hairline text-ink/90 inline-flex items-center rounded-[5px] border bg-white/[0.06] px-2 py-1 font-mono text-[11.5px] leading-none"
          >
            {key}
          </span>
        ))}
      </span>
      <span className="text-dim text-[15px] leading-snug">
        {name ? <span className="text-ink">{name}: </span> : null}
        {children}
      </span>
    </div>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-hairline border-t py-[9vh]">
      <div className="mx-auto max-w-[1180px] px-[6vw] lg:px-10">
        <h2 className="font-display text-ink text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {intro ? (
          <div className="text-dim mt-6 max-w-[54ch] space-y-4 text-[clamp(1rem,1.3vw,1.12rem)] leading-[1.62]">
            {intro}
          </div>
        ) : null}
        {children ? <div className="mt-14 space-y-14">{children}</div> : null}
      </div>
    </section>
  );
}

/** One thing inside a section: what it is, the gesture, and a photograph of
    it. Two of these give a section its visual separation without inventing a
    layout for every case. */
function Item({
  text,
  rows,
  shot,
  caption,
  flip,
  framed,
}: {
  text?: React.ReactNode;
  rows?: React.ReactNode;
  shot?: string;
  caption?: string;
  flip?: boolean;
  /** A whole window rather than a panel: it gets an edge on purpose, because
      feathering a browser screenshot into the page only makes it look like a
      mistake. */
  framed?: boolean;
}) {
  return (
    <div
      className={`grid items-center gap-x-14 gap-y-8 ${shot ? "lg:grid-cols-2" : ""}`}
    >
      <div className={flip ? "lg:order-2" : ""}>
        {text ? (
          <div className="text-dim max-w-[48ch] space-y-4 text-[clamp(1rem,1.3vw,1.12rem)] leading-[1.62]">
            {text}
          </div>
        ) : null}
        {rows ? (
          <div className={`max-w-[48ch] ${text ? "mt-7" : ""}`}>{rows}</div>
        ) : null}
      </div>
      {shot ? (
        <figure className={flip ? "lg:order-1" : ""}>
          {framed ? (
            <img
              src={shot}
              alt=""
              className="border-hairline w-full rounded-lg border"
            />
          ) : (
            <img src={shot} alt="" style={feather} className="w-full" />
          )}
          {caption ? (
            <figcaption className="text-faint mt-3 text-center font-mono text-[11px]">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </div>
  );
}

export default async function Page() {
  const baked = await latestTag();
  return (
    <main>
      {/* The real northern sky, and the product in it. The first screen shows
          the thing rather than announcing its name at 19vw. */}
      <section className="relative flex min-h-svh flex-col justify-between overflow-hidden px-[5vw] py-[3.5vh]">
        <Starfield />
        <div className="to-ground pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent" />

        <div className="text-faint relative flex items-baseline justify-between font-mono text-[11px] tracking-[0.08em] uppercase">
          <span>Vaccone Software</span>
          <span>macOS 13 or later</span>
        </div>

        <div className="flex-1" />

        <div className="relative flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Mark size={44} />
            <h1 className="font-display text-ink mt-6 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
              Lodestar
            </h1>
            <p className="mt-4 max-w-[26ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.4]">
              An opinionated way to navigate and operate your computer.
            </p>
          </div>
          <div className="w-full max-w-[330px] shrink-0">
            <DownloadButton fallback={baked} />
            <p className="text-faint mt-2 font-mono text-[11px]">
              notarized · <LatestVersion fallback={baked} /> · Fair Source
            </p>
          </div>
        </div>
      </section>

      <Section
        title="Applications"
        intro={
          <>
            <p>
              Lodestar navigates to the application you want without
              distraction. Anything you open or focus through it becomes
              maximized and hides the others. Everything else about your windows
              keeps working the way you are used to.
            </p>
            <p>
              Applications you use constantly can be assigned a letter, or a
              short set of letters, and opened directly without a list.
            </p>
          </>
        }
      >
        <Item
          shot="/shots/launcher.webp"
          caption="the launcher, ordered by what you actually use"
          text={
            <p>
              The launcher is a list of your applications. Type part of a name
              to narrow it, and the one you choose comes to the front.
            </p>
          }
          rows={
            <>
              <KeyRow keys={["lode", "space"]} name="Launcher">
                a list of your applications, narrowed as you type
              </KeyRow>
              <KeyRow keys={["⇧"]} name="Beside">
                arrive next to the current window instead of in front of it
              </KeyRow>
            </>
          }
        />
        <Item
          shot="/shots/graph.webp"
          caption="the graph, drawn while the key is held"
          flip
          text={
            <p>
              The graph is the set of letters you assign to the applications you
              use most. Hold the key and it draws itself, so nothing has to be
              remembered before it is learned, and a letter can lead to another
              letter when one is not enough.
            </p>
          }
          rows={
            <>
              <KeyRow keys={["lode", "<letter>"]} name="Graph">
                a set of letters you assign, to navigate to the applications you
                use most
              </KeyRow>
              <KeyRow keys={["⇧"]} name="Beside">
                arrive next to the current window instead of in front of it
              </KeyRow>
            </>
          }
        />
      </Section>

      <Section title="Interactions">
        <Item
          shot="/shots/hints.webp"
          caption="hints on a page, one label per link and button"
          framed
          text={
            <p>
              Hints put a letter on every button, link and field in the window
              you are in. Type the letter and it is clicked.
            </p>
          }
          rows={
            <KeyRow keys={["lode", ";"]} name="Hints">
              a letter on everything clickable in the window
            </KeyRow>
          }
        />
        <Item
          shot="/shots/scroll.webp"
          caption="scroll, and the keys it answers to"
          flip
          text={
            <p>
              Scroll moves the content inside the window, with no mouse and no
              trackpad.
            </p>
          }
          rows={
            <KeyRow keys={["lode", "`"]} name="Scroll">
              move the content inside the window from the keyboard
            </KeyRow>
          }
        />
        <Item
          shot="/shots/select.webp"
          caption="type lode, and every match on screen wears a label"
          framed
          text={
            <p>
              Select takes the mouse&apos;s last job. Type a few characters of
              any text on screen, pick the start, pick the end, and the span is
              selected. It reads the screen itself, so it works the same in a
              terminal, a browser, and a chat.
            </p>
          }
          rows={
            <KeyRow keys={["lode", "/"]} name="Select">
              type what you see, pick the start, pick the end
            </KeyRow>
          }
        />
        <Item
          flip
          shot="/shots/commands.webp"
          caption="the commands bar, an app's menus under search"
          text={
            <p>
              Commands searches the frontmost application&apos;s entire menu
              bar. Type part of a command and run it, without hunting through
              submenus. Each row wears the application&apos;s own shortcut, so
              the faster path teaches itself as you go.
            </p>
          }
          rows={
            <KeyRow keys={["lode", "-"]} name="Commands">
              the frontmost app&apos;s menu items, searched and run
            </KeyRow>
          }
        />
      </Section>

      <Section
        title="Ask"
        intro={
          <>
            <p>
              Ask opens a name you saved, a domain, or a search in your browser.
            </p>
            <p>
              Destinations can also be assigned to a browser profile. Work opens
              in your work profile and personal in your personal one, without
              choosing each time, and links you click in other applications can
              follow the same rules.
            </p>
          </>
        }
      >
        <Item
          shot="/shots/ask.webp"
          caption="a destination, and the profile it will open in"
          rows={
            <KeyRow keys={["lode", "⏎"]} name="Ask">
              names, domains and searches, opened in your browser
            </KeyRow>
          }
        />
      </Section>

      <Section title="Draft">
        <Item
          shot="/shots/draft.webp"
          caption="dictation with vim motions · Ecclesiastes 1:3–5 (ESV)"
          text={
            <>
              <p>
                The draft takes dictation. Speak, and the words appear in a
                panel at the foot of the screen while the application you were
                in keeps its cursor. Typed characters land in the same
                sentence, so a spoken thought and a typed identifier read as
                one line. Return pastes it exactly where your cursor was.
              </p>
              <p>
                Escape is vim, the whole grammar, for fixing a word without
                reaching for anything. Recognition runs on your Mac, and
                nothing you say leaves it.
              </p>
            </>
          }
          rows={
            <>
              <KeyRow keys={["lode", "."]} name="Speak">
                dictate into the application you were in
              </KeyRow>
              <KeyRow keys={["lode", "⇧."]} name="Edit">
                the field&apos;s text pulled in, silent
              </KeyRow>
              <KeyRow keys={["esc"]} name="Vim">
                the whole grammar, one escape away
              </KeyRow>
            </>
          }
        />
      </Section>

      <Section
        title="Clipboard history"
        intro={
          <>
            <p>
              Everything you copy is kept. Opening the history lays the recent
              entries out in the same places every time, each under the same
              letter, so pasting something from earlier is one keystroke.
            </p>
            <p>
              Entries you reach for constantly can be pinned to a numbered slot
              that never changes. The history stays on your machine and never
              leaves it.
            </p>
          </>
        }
      >
        <Item
          shot="/shots/clipboard.webp"
          caption="pinned entries on the left, recent ones along the bottom"
          rows={
            <>
              <KeyRow keys={["⇧⌘V"]} name="Clipboard history">
                everything you have copied
              </KeyRow>
              <KeyRow keys={["<number>"]} name="Pins">
                entries you keep, in a slot that never moves
              </KeyRow>
              <KeyRow keys={["<letter>"]}>
                pastes that entry as plain text, ⇧ keeps its formatting
              </KeyRow>
            </>
          }
        />
      </Section>

      <Section
        title="Meetings"
        intro={
          <p>
            A few minutes before a meeting begins, a chip appears with the join
            link behind a single key. You arrive on time without keeping a
            calendar tab open in the corner of your attention.
          </p>
        }
      >
        <Item
          shot="/shots/meeting.webp"
          caption="the meeting chip, a few minutes before the start"
          text={
            <p>
              Meeting links follow the same profile rules as everything else, so
              a work call opens in your work profile. Meetings are off by
              default, and Lodestar asks for calendar access only when you turn
              them on.
            </p>
          }
        />
      </Section>

      <Section
        title="The coach"
        intro={
          <p>
            Lodestar&apos;s gestures are designed to become muscle memory, and
            the coach is how they become it sooner. It watches how you actually
            navigate and offers the faster path you have not taken yet: an
            application you keep finding through the launcher earns the offer of
            its own letter.
          </p>
        }
      >
        <Item
          flip
          shot="/shots/coach.webp"
          caption="one offer at a time, priced from your own use"
          text={
            <p>
              One suggestion at a time, as a quiet chip, never a stream of
              notifications. Offers you are not ready for wait in the menu, and
              everything the coach learns about how you work stays on your
              machine.
            </p>
          }
        />
      </Section>

      <Section
        title="Permissions"
        intro={
          <>
            <p>
              Lodestar asks for what it needs and nothing more. Accessibility
              moves windows, reads menus, and clicks what you aim at. Screen
              Recording lets select and hints read the text on the screen.
              Calendar access exists for meetings and is requested only if you
              turn them on.
            </p>
            <p>
              Nothing leaves your machine. There is no account and no server.
              What Lodestar observes about your navigation stays in local files
              you can read, and its only request of the network is asking GitHub
              for a newer version. The source is public, so none of this is
              taken on faith.
            </p>
          </>
        }
      />

      <section className="border-hairline border-t px-[6vw] py-[11vh] lg:px-10">
        <div className="mx-auto max-w-[520px]">
          <DownloadButton fallback={baked} />
          <div className="mt-3">
            <CopyCommand command="brew install --cask vaccone-software/tap/lodestar" />
          </div>
          <p className="text-faint mt-4 font-mono text-[11px] leading-relaxed">
            macOS 13 or later · notarized · Fair Source ·{" "}
            <a href={repo} className="text-dim underline underline-offset-4">
              source
            </a>{" "}
            ·{" "}
            <a
              href="/changelog"
              className="text-dim underline underline-offset-4"
            >
              changelog
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
