"use client";

import { useEffect } from "react";

// esc goes home, as it steps back everywhere in Lodestar.
export default function EscHome() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.location.href = "/";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
