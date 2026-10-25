import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DownloadPill from "@/components/DownloadPill";
import { KeySequence } from "@/components/Key";
import DoorShow from "@/components/home/DoorShow";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import { doors } from "@/data/doors";
import { guide } from "@/data/guide";
import { stableRelease } from "@/lib/server/stable";
import { appJsonLd, breadcrumbs, graph, pageMetadata } from "@/lib/seo";

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
  return pageMetadata({
    title: door.title,
    description: door.description,
    path: `/${door.slug}`,
    social: `Lodestar · ${door.h1}`,
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-[18px] font-semibold tracking-[-0.01em]">{children}</h2>;
}

// One screen: the promise and the door's own window, then everything else
// in three panes beneath them, so nothing waits below the fold. Short
// windows and phones scroll instead.
export default async function Page({
  params,
}: {
  params: Promise<{ door: string }>;
}) {
  const { door: slug } = await params;
  const door = doors.find((d) => d.slug === slug);
  if (!door) notFound();
  const { tag } = await stableRelease();
  // The guide page that goes deeper: the door page stays one screen, and
  // the depth is one link away, for readers and for search engines alike.
  const deeper = guide.find((page) => page.slug === door.guide[0]);
  const jsonLd = graph(
    appJsonLd(tag, [door.lede, ...door.steps.map((step) => `${step.title}: ${step.line}`)]),
    breadcrumbs([
      { name: "Lodestar", path: "/" },
      { name: door.name, path: `/${door.slug}` },
    ]),
  );
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Nav tag={tag} current={door.slug} />
      <main id="main" className="mx-auto grid max-w-[1180px] gap-12 px-4 pt-8 pb-12 md:px-6 md:pt-12">
        <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14">
          <div className="order-2 md:order-1">
            <p className="text-dim text-[16px] font-medium">{door.name}</p>
            <h1 className="font-display mt-2 mb-4 text-[clamp(36px,4.4vw,56px)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
              {door.h1}
            </h1>
            <p className="text-dim mb-8 max-w-[30em] text-[18px] leading-[1.45]">{door.lede}</p>
            <div className="inline-grid justify-items-stretch gap-3">
              <DownloadPill fallback={tag} />
              <span className="text-dim text-center text-[13px]">Free · macOS 27 or later · Apple silicon</span>
            </div>
          </div>
          <div className="order-1 mx-auto w-full max-w-[520px] md:order-2">
            <DoorShow slug={door.slug} name={door.name} />
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_1fr_1.1fr]">
          <div className="pane p-6">
            <div className="flex items-baseline justify-between gap-4">
              <Label>How it works</Label>
              {deeper ? (
                <a href={`/guide/${deeper.slug}`} className="text-dim hover:text-ink mb-4 text-[13px] font-medium transition-colors">
                  The full guide to {door.name}
                </a>
              ) : null}
            </div>
            <ol className="grid gap-4">
              {door.steps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[20px_1fr_auto] items-baseline gap-x-3 gap-y-1">
                  <span className="text-faint text-[13px] font-semibold tabular-nums">{i + 1}</span>
                  <b className="text-[16px] font-medium">{step.title}</b>
                  <span>{step.keys ? <KeySequence keys={step.keys} lighting={false} /> : null}</span>
                  <p className="text-dim col-span-2 col-start-2 text-[13px] leading-[1.45]">{step.line}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="pane p-6">
            <Label>What it will not do</Label>
            <ul>
              {door.never.map((line) => (
                <li
                  key={line}
                  className="border-hairline text-dim border-b py-2.5 text-[15px] leading-[1.4] first:pt-0 last:border-b-0 last:pb-0"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="pane p-6">
            <Label>{door.detailTitle}</Label>
            <div className="grid gap-2">
              {door.detail.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-[12px] bg-raised px-3 py-2.5"
                >
                  <b className="text-[14px] font-semibold">{row.name}</b>
                  <span className="text-dim text-[13px] leading-[1.35]">{row.line}</span>
                  <span>{row.keys ? <KeySequence keys={row.keys} lighting={false} /> : null}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Foot />
      </main>
    </>
  );
}
