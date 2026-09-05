import { card, cardSize } from "@/lib/card";

// The front page's card: the headline, and the line under it.
export const dynamic = "force-static";
export const alt = "Lodestar. Your Mac, under one key.";
export const size = cardSize;
export const contentType = "image/png";

export default function Image() {
  return card({
    eyebrow: "Keyboard navigation for macOS",
    title: "Your Mac, under one key",
    line: "Every place you go on your Mac, named from the keyboard. Lodestar learns which ones you reach for.",
    seed: 7,
  });
}
