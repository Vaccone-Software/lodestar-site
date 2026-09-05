import type { Metadata } from "next";
import Header from "@/components/Header";
import Releases from "@/components/Releases";
import { parseReleases, releasesUrl, type Release } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Every Lodestar release, in the words it shipped with.",
  alternates: { canonical: "/changelog" },
};

// Baked at build so the page is right on deploy day; the client re-reads
// the API so releases that land between deploys appear anyway. no-store
// for the same reason it is load bearing on the front page: Next's data
// cache would otherwise bake whichever answer it saw first.
async function baked(): Promise<Release[]> {
  try {
    const response = await fetch(releasesUrl, { cache: "no-store" });
    return parseReleases(await response.json());
  } catch {
    return [];
  }
}

export default async function Page() {
  const releases = await baked();
  return (
    <main className="dust mx-auto max-w-[840px] px-[6vw] pt-28 pb-24 lg:px-8">
      <Header />
      <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
        Changelog
      </p>
      <h1 className="font-display text-ink mt-4 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-normal tracking-[-0.02em]">
        Every release, as it shipped
      </h1>
      <p className="text-dim mt-5 max-w-[52ch] text-[17px] leading-[1.6]">
        A minor release changes what Lodestar is. A patch keeps a promise the
        last one made. Each series opens with the release that named it, and
        its patches follow.
      </p>
      <div className="border-hairline mt-12 border-t pt-12">
        <Releases fallback={releases} />
      </div>
    </main>
  );
}
