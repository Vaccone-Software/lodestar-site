import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://lodestar.vaccone.software/" },
    { url: "https://lodestar.vaccone.software/changelog" },
  ];
}
