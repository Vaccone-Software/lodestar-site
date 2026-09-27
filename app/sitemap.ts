import type { MetadataRoute } from "next";
import { doors } from "@/data/doors";
import { guide } from "@/data/guide";
import { latestRelease } from "@/lib/releases";
import { site } from "@/lib/seo";

export const dynamic = "force-static";

// Every page changes when a release does: the download, the version, and
// the guide the release documents. The latest release's date is the
// honest last-modified for all of them.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { date } = await latestRelease();
  const lastModified = date ? new Date(date) : new Date();
  const page = (path: string, priority: number) => ({ url: `${site}${path}`, lastModified, priority });
  return [
    page("/", 1),
    ...doors.map((d) => page(`/${d.slug}`, 0.95)),
    page("/guide", 0.9),
    ...guide.map((p) => page(`/guide/${p.slug}`, 0.8)),
    page("/evidence", 0.8),
    page("/changelog", 0.5),
  ];
}
