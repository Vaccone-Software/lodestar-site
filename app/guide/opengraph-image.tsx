import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "The Lodestar guide. One page per destination.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Guide",
    title: "One page per destination",
    line: "Each shown before it is described, with the parts nobody finds by pressing keys.",
    seed: 5,
  });
}
