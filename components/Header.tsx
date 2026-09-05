"use client";

import { useEffect, useState } from "react";

// A thin bar that is transparent over the sky and takes a hairline and a
// veil once the reader has left it, so Download is never more than a glance
// away. The mark stays in the hero, where the sky turns around it.
export default function Header() {
  const [away, setAway] = useState(false);
  useEffect(() => {
    const onScroll = () => setAway(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        away
          ? "border-hairline border-b bg-[#0a0a0c]/70 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-[5vw] py-3.5 font-mono text-[11.5px] tracking-[0.06em] lg:px-8">
        <a href="/" className="text-ink/90 hover:text-ink">
          Lodestar
        </a>
        <div className="flex items-center gap-6">
          <a href="/guide" className="text-dim hover:text-ink transition-colors">
            Guide
          </a>
          <a
            href="/evidence"
            className="text-dim hover:text-ink transition-colors"
          >
            Evidence
          </a>
          <a
            href="/changelog"
            className="text-dim hover:text-ink hidden transition-colors sm:inline"
          >
            Changelog
          </a>
          <a
            href="#download"
            className="text-accent hover:text-[#ff7a3d] transition-colors"
          >
            Download
          </a>
        </div>
      </nav>
    </header>
  );
}
