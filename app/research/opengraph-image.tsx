import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "Lodestar for research. Years of the hands, measured while people work.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Research",
    title: "Years of the hands, measured while people work",
    line: "Every keystroke's timing, the pointer, daily rhythm and voice, for as long as people use it.",
  });
}
