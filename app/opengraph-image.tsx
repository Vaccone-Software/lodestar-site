import { headline, subline } from "@/data/home";
import { card, cardSize } from "@/lib/card";

// The front page's card: the headline, and the line under it.
export const dynamic = "force-static";
export const alt = "Lodestar. Everything one key away";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Lodestar",
    title: headline,
    oneLine: true,
    line: subline,
  });
}
