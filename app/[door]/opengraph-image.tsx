import { card, cardSize } from "@/lib/card";
import { doors } from "@/data/doors";

// A card for each door: a link to a door unfurls as its promise.
export const dynamic = "force-static";
export const size = cardSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return doors.map((door) => ({ door: door.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ door: string }>;
}) {
  const { door: slug } = await params;
  const door = doors.find((d) => d.slug === slug) ?? doors[0];
  return card({
    eyebrow: door.name,
    title: door.h1,
    line: door.lede,
    seed: 3 + doors.indexOf(door),
  });
}
