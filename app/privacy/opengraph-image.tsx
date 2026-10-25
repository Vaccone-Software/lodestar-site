import { card, cardSize } from "@/lib/card";

export const dynamic = "force-static";
export const alt = "Lodestar privacy. What you do stays on your Mac.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Privacy",
    title: "What you do stays on your Mac",
    line: "No account, and no server that receives what Lodestar records.",
  });
}
