import { card, cardSize } from "@/lib/card";
import { guide } from "@/data/guide";

// A card for each page of the guide: a lesson link unfurls as its page.
export const dynamic = "force-static";
export const size = cardSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return guide.map((p) => ({ slug: p.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = guide.find((p) => p.slug === slug);
  const index = guide.findIndex((p) => p.slug === slug);
  return card({
    eyebrow: `Guide · ${String(index + 1).padStart(2, "0")} of ${guide.length}`,
    title: page?.name ?? "Guide",
    line: page?.blurb ?? "One page per destination.",
    seed: 11 + index,
  });
}
