import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "Lodestar for research. What Lodestar records.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Research",
    title: "What Lodestar records",
    line: "Every keystroke's timing, every pointer movement, voice and daily rhythm, for as long as people use it.",
  });
}
