import { card, cardSize } from "@/lib/card";

// The front page's card: the headline, and the line under it.
export const dynamic = "force-static";
export const alt = "Lodestar. Everything one key away";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Lodestar",
    title: "Everything one key away",
    oneLine: true,
    line: "Free tools that stay on your Mac",
    seed: 7,
  });
}
