import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "The Lodestar changelog. Every release, as it shipped.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Changelog",
    title: "Every release, as it shipped",
    line: "A minor release changes what Lodestar is. A patch keeps a promise the last one made.",
    seed: 9,
  });
}
