import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // The guide joins once its pages exist; until then it is a door and
  // asks not to be indexed.
  return [
    { url: "https://lodestar.vaccone.software/", priority: 1 },
    { url: "https://lodestar.vaccone.software/evidence", priority: 0.8 },
    { url: "https://lodestar.vaccone.software/changelog", priority: 0.5 },
  ];
}
