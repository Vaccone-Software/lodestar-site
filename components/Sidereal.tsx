"use client";

import { useEffect, useState } from "react";

// The reading the sky is drawn at: local sidereal time, to the accuracy a
// timezone gives, which is the same figure Starfield turns the sky by.
// Rendered only on the client, so the server never bakes a stale clock.
function sidereal(): string {
  const days = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const gmst = 18.697374558 + 24.06570982441908 * days;
  const local = (((gmst - new Date().getTimezoneOffset() / 60) % 24) + 24) % 24;
  const h = Math.floor(local);
  const m = Math.floor((local - h) * 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function Sidereal() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(sidereal());
    const timer = window.setInterval(() => setNow(sidereal()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  if (!now) return null;
  return (
    <span className="text-faint/80">
      {" "}
      Sidereal time <span className="text-dim">{now}</span>.
    </span>
  );
}
