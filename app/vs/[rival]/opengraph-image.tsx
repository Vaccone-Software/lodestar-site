import { card, cardSize } from "@/lib/card";
import { doors } from "@/data/doors";
import { rivals } from "@/data/rivals";

// A comparison unfurls as its claim, under the door it belongs to.
export const dynamic = "force-static";
export const size = cardSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return rivals.map((r) => ({ rival: r.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ rival: string }>;
}) {
  const { rival: slug } = await params;
  const rival = rivals.find((r) => r.slug === slug) ?? rivals[0];
  const door = doors.find((d) => d.slug === rival.door)!;
  return card({
    eyebrow: `${door.name} · Lodestar and ${rival.name}`,
    title: rival.h1,
    line: rival.description,
  });
}
