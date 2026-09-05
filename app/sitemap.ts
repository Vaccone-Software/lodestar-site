import type { MetadataRoute } from "next";
import { guide } from "@/data/guide";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://lodestar.vaccone.software/", priority: 1 },
    { url: "https://lodestar.vaccone.software/guide", priority: 0.9 },
    ...guide.map((p) => ({
      url: `https://lodestar.vaccone.software/guide/${p.slug}`,
      priority: 0.8,
    })),
    { url: "https://lodestar.vaccone.software/evidence", priority: 0.8 },
    { url: "https://lodestar.vaccone.software/changelog", priority: 0.5 },
  ];
}
