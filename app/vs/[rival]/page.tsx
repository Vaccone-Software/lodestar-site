import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DownloadPill from "@/components/DownloadPill";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import { rivals } from "@/data/rivals";
import { doors } from "@/data/doors";
import { stableRelease } from "@/lib/server/stable";
import {
  appJsonLd,
  breadcrumbs,
  graph,
  makerJsonLd,
  pageMetadata,
} from "@/lib/seo";

// Lodestar beside the app people search for it instead of: the same facts
// for both, what the other one does that Lodestar does not, and where each
// fact about the other came from. Fair, or not at all: a page that only
// flatters is one nobody trusts and no answer quotes.
export const dynamicParams = false;

export function generateStaticParams() {
  return rivals.map((r) => ({ rival: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ rival: string }>;
}): Promise<Metadata> {
  const { rival: slug } = await params;
  const rival = rivals.find((r) => r.slug === slug);
  if (!rival) return {};
  return pageMetadata({
    title: rival.title,
    description: rival.description,
    path: `/vs/${rival.slug}`,
    social: `Lodestar · ${rival.h1}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ rival: string }>;
}) {
  const { rival: slug } = await params;
  const rival = rivals.find((r) => r.slug === slug);
  if (!rival) notFound();
  const door = doors.find((d) => d.slug === rival.door)!;
  const { tag } = await stableRelease();
  const jsonLd = graph(
    appJsonLd(tag),
    breadcrumbs([
      { name: "Lodestar", path: "/" },
      { name: door.name, path: `/${door.slug}` },
      { name: `Lodestar and ${rival.name}`, path: `/vs/${rival.slug}` },
    ]),
    makerJsonLd(),
  );
  // Three narrow columns on a phone rather than a table that hides the
  // other app off to the side.
  const cell = "border-hairline border-b px-2.5 py-3 align-top md:px-4";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Nav tag={tag} current={door.slug} />
      <main
        id="main"
        className="mx-auto grid max-w-[1000px] gap-12 px-4 pt-10 pb-16 md:px-6"
      >
        <section>
          <p className="text-dim text-[16px] font-medium">
            {door.name} · Lodestar and {rival.name}
          </p>
          <h1 className="font-display mt-2 mb-4 max-w-[20ch] text-[clamp(36px,4.4vw,56px)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
            {rival.h1}
          </h1>
          <p className="text-dim mb-8 max-w-[60ch] text-[18px] leading-[1.5]">
            {rival.answer}
          </p>
          <div className="inline-grid justify-items-stretch gap-3">
            <DownloadPill fallback={tag} />
            <span className="text-dim text-center text-[13px]">
              Free · macOS 27 or later · Apple silicon
            </span>
          </div>
        </section>

        <section className="pane p-1 md:p-2">
          <table className="w-full border-collapse text-left text-[14px] leading-[1.45] [overflow-wrap:anywhere] md:text-[15px]">
            <caption className="sr-only">
              Lodestar and {rival.name}, fact by fact
            </caption>
            <thead>
              <tr className="text-dim text-[13px]">
                <th scope="col" className={`${cell} w-[26%] font-semibold`}>
                  <span className="sr-only">Fact</span>
                </th>
                <th scope="col" className={`${cell} text-ink font-semibold`}>
                  Lodestar
                </th>
                <th scope="col" className={`${cell} font-semibold`}>
                  {rival.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {rival.rows.map((row) => (
                <tr key={row.fact} className="last:[&>*]:border-b-0">
                  <th scope="row" className={`${cell} text-dim font-medium`}>
                    {row.fact}
                  </th>
                  <td className={cell}>{row.lodestar}</td>
                  <td className={`${cell} text-dim`}>{row.rival}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="pane p-6">
            <h2 className="mb-4 text-[18px] font-semibold tracking-[-0.01em]">
              Choose {rival.name} if
            </h2>
            <ul className="grid gap-2.5">
              {rival.theirs.map((line) => (
                <li key={line} className="text-dim text-[15px] leading-[1.45]">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="pane p-6">
            <h2 className="mb-4 text-[18px] font-semibold tracking-[-0.01em]">
              Choose Lodestar if
            </h2>
            <ul className="grid gap-2.5">
              {rival.ours.map((line) => (
                <li key={line} className="text-dim text-[15px] leading-[1.45]">
                  {line}
                </li>
              ))}
            </ul>
            <a
              href={`/${door.slug}`}
              className="text-dim hover:text-ink mt-5 inline-block text-[13px] font-medium transition-colors"
            >
              How {door.name} works
            </a>
          </div>
        </section>

        <section className="text-faint text-[13px] leading-[1.6]">
          <p>
            What this page says of {rival.name} comes from its own pages, read{" "}
            {rival.checked}. {rival.name} is a trademark of its owner, and
            Lodestar is not affiliated with it. Something here out of date? Send
            a note from Lodestar&apos;s menu and it will be put right.
          </p>
          <ul className="mt-2 grid gap-1">
            {rival.sources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  rel="nofollow noopener"
                  className="hover:text-dim break-all transition-colors"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <Foot />
      </main>
    </>
  );
}
