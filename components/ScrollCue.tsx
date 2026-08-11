"use client";

import { useEffect, useState } from "react";

// The hero names its destination the way every gesture does. Present while
// the sky fills the screen, gone once you have left for it.
export default function ScrollCue() {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <a
      href="#premise"
      className={`text-faint hover:text-dim absolute bottom-8 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] whitespace-nowrap transition-[opacity,visibility] duration-500 ${
        away ? "invisible opacity-0" : "visible opacity-100"
      }`}
    >
      <span className="text-accent">01</span> · the premise ↓
    </a>
  );
}
