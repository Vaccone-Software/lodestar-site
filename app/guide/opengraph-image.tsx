import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "The Lodestar guide. One page per destination.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Guide",
    title: "Everything Lodestar does, and the keys for it",
    line: "One page per destination, with the parts nobody finds by pressing keys",
    seed: 5,
  });
}
