import type { Metadata } from "next";
import { Effect } from "effect";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import {
  ages,
  channels,
  floor,
  readDays,
  shown,
  type Age,
  type Channel,
  type Day,
} from "@/lib/server/count";
import { HttpLive, fetchAtCallTime } from "@/lib/server/http";
import { stableRelease } from "@/lib/server/stable";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Daily Count",
  description:
    "How many Macs use Lodestar each day, counted once a day with no ID. Every number the site keeps about it is shown here.",
  path: "/count",
  social: "Lodestar · How many Macs use it",
});

// The daily count, shown as the site keeps it (lib/server/count.ts): the
// whole days before today, read again every few minutes (the layout's
// revalidate is the shorter, so it wins). Any number under the floor
// is said as "fewer than", so a quiet day never shows what one Mac sent.

const label = "text-dim text-[13px] font-semibold";
const link =
  "text-ink decoration-ink/40 hover:decoration-ink underline underline-offset-4";

const ageNames: Record<Age, string> = {
  "0": "Installed that day",
  "1-6": "Within a week",
  "7-29": "Within a month",
  "30-89": "Within three months",
  "90+": "Longer",
};
const channelNames: Record<Channel, string> = {
  stable: "Stable",
  preview: "Preview",
};

async function days(): Promise<Day[] | null> {
  return Effect.runPromise(
    readDays(Date.now(), 30).pipe(
      fetchAtCallTime,
      Effect.provide(HttpLive),
      Effect.orElseSucceed(() => null),
    ),
  );
}

const say = (value: number) => {
  const number = shown(value);
  return number === null ? `Fewer than ${floor}` : number.toLocaleString("en");
};

const mean = (values: number[]) =>
  values.length
    ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;

const dateName = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export default async function CountPage() {
  const [{ tag }, read] = await Promise.all([stableRelease(), days()]);
  const week = read?.slice(-7) ?? [];
  return (
    <>
      <Nav tag={tag} />
      <main id="main" className="min-h-svh px-4 pt-10 pb-16 md:px-6">
        <div className="mx-auto max-w-[920px]">
          <p className={label}>Daily count</p>
          <h1 className="font-display mt-3 max-w-[20ch] text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
            How many Macs use Lodestar
          </h1>
          <p className="text-dim mt-6 max-w-[62ch] text-[18px] leading-[1.55]">
            Once a day, after you first use it, Lodestar tells this site that a
            Mac used it. It sends no ID and nothing about what you did. These
            are the only numbers the site keeps about it, shown in full.
          </p>

          {read === null ? (
            <section className="pane mt-10 p-6 md:p-8">
              <p className="text-dim text-[16px] leading-[1.6]">
                The count could not be read just now. It is read again in a few
                minutes.
              </p>
            </section>
          ) : (
            <>
              <section className="mt-10 grid gap-4 md:grid-cols-2">
                <div className="pane p-6">
                  <h2 className={label}>Yesterday</h2>
                  <p className="mt-2 text-[32px] font-semibold tracking-[-0.02em]">
                    {say(read.at(-1)!.total)}
                  </p>
                </div>
                <div className="pane p-6">
                  <h2 className={label}>A day, over the last week</h2>
                  <p className="mt-2 text-[32px] font-semibold tracking-[-0.02em]">
                    {say(mean(week.map((d) => d.total)))}
                  </p>
                </div>
              </section>

              <section className="border-hairline mt-14 grid gap-10 border-t pt-10 md:grid-cols-2">
                <div>
                  <h2 className="text-[18px] font-semibold">
                    How long ago it was installed
                  </h2>
                  <p className="text-dim mt-1 text-[15px]">
                    A day, over the last week
                  </p>
                  <dl className="mt-4 space-y-2 text-[16px]">
                    {ages.map((age) => (
                      <div key={age} className="flex justify-between gap-4">
                        <dt className="text-dim">{ageNames[age]}</dt>
                        <dd>{say(mean(week.map((d) => d.age[age])))}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold">Update channel</h2>
                  <p className="text-dim mt-1 text-[15px]">
                    A day, over the last week
                  </p>
                  <dl className="mt-4 space-y-2 text-[16px]">
                    {channels.map((channel) => (
                      <div key={channel} className="flex justify-between gap-4">
                        <dt className="text-dim">{channelNames[channel]}</dt>
                        <dd>
                          {say(mean(week.map((d) => d.channel[channel])))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              <section className="border-hairline mt-14 border-t pt-10">
                <h2 className="text-[18px] font-semibold">The last 30 days</h2>
                <dl className="mt-4 grid gap-x-10 gap-y-2 text-[16px] sm:grid-cols-2">
                  {[...read].reverse().map((d) => (
                    <div key={d.day} className="flex justify-between gap-4">
                      <dt className="text-dim">{dateName(d.day)}</dt>
                      <dd>{say(d.total)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </>
          )}

          <section className="border-hairline mt-14 border-t pt-10">
            <h2 className="text-[18px] font-semibold">How it is counted</h2>
            <p className="text-dim mt-2 max-w-[66ch] text-[16px] leading-[1.6]">
              Each Mac sends two things: its update channel, and roughly how
              long ago Lodestar was installed. The site adds one to that
              day&apos;s total, one to the channel and one to the install age,
              and keeps the three apart, so nothing it holds describes a single
              Mac. Days are counted in UTC. The address a request comes from is
              not kept. Any number under {floor} is shown as fewer than {floor}.
              You can turn the count off in Lodestar&apos;s Settings, under
              Daily count. See{" "}
              <a href="/privacy" className={link}>
                Privacy
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
