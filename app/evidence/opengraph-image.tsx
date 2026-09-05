import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "Lodestar evidence. Every claim, and its measurement.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Evidence",
    title: "Every claim, and its measurement",
    line: "One hand, fourteen days, seventy thousand events, read at the source.",
    seed: 3,
  });
}
