import type { Metadata } from "next";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import Releases from "@/components/Releases";
import { parseReleases, releasesUrl, type Release } from "@/lib/releases";
import { stableRelease } from "@/lib/server/stable";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Changelog and Release Notes",
  description:
    "Every release of Lodestar, the free Mac app, in the words it shipped with: what is new, what changed and what was fixed, version by version.",
  path: "/changelog",
  social: "Lodestar · Every release, as it shipped",
});

// Built once and rebuilt in the background at most ten minutes after a
// release, so a new release reaches the page without a deploy; the client
// re-reads the API as well.
async function baked(): Promise<Release[]> {
  try {
    const response = await fetch(releasesUrl, { next: { revalidate: 600 } });
    return parseReleases(await response.json());
  } catch {
    return [];
  }
}

export default async function Page() {
  const releases = await baked();
  // The download in the nav is stable; the list below is every build.
  const latest = (await stableRelease()).tag;
  return (
    <>
      <Nav tag={latest} current="changelog" />
      <main
        id="main"
        className="mx-auto max-w-[760px] px-4 pt-10 pb-16 md:px-6"
      >
        <p className="text-dim text-[13px] font-semibold">Changelog</p>
        <h1 className="font-display text-ink mt-3 text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance">
          Every release, as it shipped
        </h1>
        <p className="text-dim mt-4 max-w-[52ch] text-[18px] leading-[1.5]">
          A minor release changes what Lodestar is. A patch keeps a promise the
          last one made. Each series opens with the release that named it, and
          its patches follow.
        </p>
        <div className="border-hairline mt-12 border-t pt-12">
          <Releases fallback={releases} />
        </div>
        <Foot className="border-hairline mt-16 border-t pt-6" />
      </main>
    </>
  );
}
