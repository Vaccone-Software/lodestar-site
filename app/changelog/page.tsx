import type { Metadata } from "next";
import Releases from "@/components/Releases";
import { parseReleases, releasesUrl, type Release } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Lodestar · changelog",
  description: "Every Lodestar release, in the words it shipped with.",
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
    <main className="mx-auto max-w-[780px] px-[6vw] py-[9vh] lg:px-8">
      <a
        href="/"
        className="text-faint hover:text-dim font-mono text-[11px] tracking-[0.08em] uppercase"
      >
        ← Lodestar
      </a>
      <h1 className="font-display text-ink mt-8 text-[clamp(2rem,4vw,3rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
        Changelog
      </h1>
      <p className="text-dim mt-4 max-w-[54ch] text-[clamp(1rem,1.3vw,1.12rem)] leading-[1.62]">
        Every release, in the words it shipped with.
      </p>
      <div className="border-hairline mt-12 border-t pt-12">
        <Releases fallback={releases} />
      </div>
    </main>
  );
}
