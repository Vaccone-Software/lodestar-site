import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DownloadPill from "@/components/DownloadPill";
import Foot from "@/components/Foot";
import { KeySequence } from "@/components/Key";
import Loop from "@/components/Loop";
import Nav from "@/components/Nav";
import { doors } from "@/data/doors";
import { latestRelease } from "@/lib/releases";

// The four doors and nothing else: any other name is a 404, and the guide,
// the evidence and the changelog keep their own routes.
export const dynamicParams = false;

export function generateStaticParams() {
  return doors.map((door) => ({ door: door.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ door: string }>;
}): Promise<Metadata> {
  const { door: slug } = await params;
  const door = doors.find((d) => d.slug === slug);
  if (!door) return {};
  return {
    title: `${door.name}: ${door.h1}`,
    description: door.description,
    alternates: { canonical: `/${door.slug}` },
    openGraph: { title: `Lodestar · ${door.h1}`, description: door.description, url: `/${door.slug}` },
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-faint mb-3 text-[11.5px] font-semibold tracking-[0.14em] uppercase">
      {children}
    </h2>
  );
}

// One screen: the promise and the picture, then everything else in a band
// beneath them, so nothing waits below the fold. Short windows and phones
// scroll instead.
export default async function Page({
  params,
}: {
  params: Promise<{ door: string }>;
}) {
  const { door: slug } = await params;
  const door = doors.find((d) => d.slug === slug);
  if (!door) notFound();
  const { tag } = await latestRelease();
  return (
    <>
      <Nav tag={tag} current={door.slug} />
      <main
        id="main"
        className="mx-auto grid max-w-[1320px] px-4 pb-10 md:px-7 [@media(min-width:901px)_and_(min-height:701px)]:h-[calc(100svh-78px)] [@media(min-width:901px)_and_(min-height:701px)]:min-h-[640px] [@media(min-width:901px)_and_(min-height:701px)]:grid-rows-[minmax(0,1fr)_auto] [@media(min-width:901px)_and_(min-height:701px)]:pb-8"
      >
        <section className="grid min-h-0 items-center gap-6 [@media(min-width:901px)_and_(min-height:701px)]:grid-cols-[1fr_1.1fr]">
          <div className="over-sky">
            <p className="text-accent text-[12px] font-semibold tracking-[0.16em] uppercase">
              {door.name}
            </p>
            <h1 className="mt-3 mb-3.5 text-[clamp(40px,4.6vw,68px)] leading-[0.98] font-semibold tracking-[-0.045em]">
              {door.h1}
            </h1>
            <p className="mb-6 max-w-[28em] text-[clamp(16px,1.25vw,19px)] leading-[1.5] text-[#d3cdc6]">
              {door.lede}
            </p>
            <DownloadPill fallback={tag} />
            <span className="text-faint mt-3 block text-[12.5px]">
              Free · Apple silicon, macOS 14 or later
            </span>
          </div>
          <div className="relative -order-1 mx-auto aspect-[4/3] w-full max-w-[520px] [@media(min-width:901px)_and_(min-height:701px)]:order-none [@media(min-width:901px)_and_(min-height:701px)]:aspect-auto [@media(min-width:901px)_and_(min-height:701px)]:h-full [@media(min-width:901px)_and_(min-height:701px)]:max-h-[520px] [@media(min-width:901px)_and_(min-height:701px)]:max-w-none">
            <Loop
              src={`/media/doors/${door.slug}`}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </section>
        <section className="border-hairline mt-6 grid gap-7 border-t pt-5 [@media(min-width:901px)_and_(min-height:701px)]:mt-0 [@media(min-width:901px)_and_(min-height:701px)]:grid-cols-[1.25fr_1fr_1.1fr] [@media(min-width:901px)_and_(min-height:701px)]:gap-9">
          <div>
            <Label>How it works</Label>
            <ol className="grid gap-3">
              {door.steps.map((step, i) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[22px_1fr_auto] items-baseline gap-x-2.5 gap-y-1"
                >
                  <span className="text-accent text-[12px] font-semibold">
                    0{i + 1}
                  </span>
                  <b className="text-[15px] font-semibold tracking-[-0.005em]">
                    {step.title}
                  </b>
                  <span className="text-[16px]">
                    {step.keys ? <KeySequence keys={step.keys} /> : null}
                  </span>
                  <p className="text-dim col-span-2 col-start-2 text-[13.5px] leading-[1.45]">
                    {step.line}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Label>What it will not do</Label>
            <ul>
              {door.never.map((line) => (
                <li
                  key={line}
                  className="border-hairline border-b py-[7px] text-[14px] leading-[1.4] text-[#d6d0c9] first:pt-0 last:border-b-0"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Label>{door.detailTitle}</Label>
            <div className="grid gap-[7px]">
              {door.detail.map((row) => (
                <div
                  key={row.name}
                  className="border-hairline grid grid-cols-[92px_1fr_auto] items-center gap-2.5 rounded-[9px] border bg-white/[0.03] px-2.5 py-[7px]"
                >
                  <b className="text-[13.5px] font-semibold">{row.name}</b>
                  <span className="text-dim text-[13px] leading-[1.35]">
                    {row.line}
                  </span>
                  <span className="text-[15px]">
                    {row.keys ? <KeySequence keys={row.keys} /> : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Foot className="mt-8 [@media(min-width:901px)_and_(min-height:701px)]:hidden" />
      </main>
      <Foot className="fixed right-7 bottom-2 left-7 hidden text-[#57534e] [@media(min-width:901px)_and_(min-height:701px)]:flex" />
    </>
  );
}
