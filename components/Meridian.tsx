"use client";

import { useEffect } from "react";

// Drives the meridian's drawn length from the scroll position: it grows
// from the first destination to the last as the reader passes them.
export default function Meridian() {
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(".meridian");
    if (!list) return;
    const update = () => {
      const rect = list.getBoundingClientRect();
      const line = window.innerHeight * 0.55;
      const drawn = Math.max(0, Math.min(rect.height, line - rect.top));
      list.style.setProperty("--drawn", `${(drawn / rect.height) * 100}%`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return null;
}
