import { card, cardSize } from "@/lib/card";

// The front page's card: the headline, and the line under it.
export const dynamic = "force-static";
export const alt = "Lodestar. Master your Mac.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Lodestar",
    title: "Master your Mac",
    line: "Free tools that make your Mac second nature",
    seed: 7,
  });
}
