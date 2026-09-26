import DownloadPill from "@/components/DownloadPill";
import { doors } from "@/data/doors";

// One bar on every page: the name, the four doors, the guide, and the
// download. No icon beside the name; the mark lives on the homepage.
export default function Nav({
  tag,
  current,
  over = false,
}: {
  tag: string;
  current?: string;
  /** Laid over the homepage's scene rather than above a page. */
  over?: boolean;
}) {
  return (
    <nav
      aria-label="Lodestar"
      className={`${over ? "absolute inset-x-0 top-0" : "relative"} z-20 grid grid-cols-[1fr_auto] items-center px-4 py-4 text-[14px] font-medium md:grid-cols-[1fr_auto_1fr] md:px-7 md:py-5`}
    >
      <a href="/" className="text-ink justify-self-start">
        Lodestar
      </a>
      <div className="hidden gap-1.5 md:flex">
        {doors.map((door) => (
          <a
            key={door.slug}
            href={`/${door.slug}`}
            aria-current={current === door.slug ? "page" : undefined}
            className={`rounded-full px-3 py-[7px] transition-colors ${
              current === door.slug
                ? "text-ink bg-white/[0.07]"
                : "text-dim hover:text-ink"
            }`}
          >
            {door.name}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-[18px] justify-self-end">
        <a
          href="/guide"
          aria-current={current === "guide" ? "page" : undefined}
          className={`hidden transition-colors md:inline ${current === "guide" ? "text-ink" : "text-dim hover:text-ink"}`}
        >
          Guide
        </a>
        <DownloadPill fallback={tag} label="Download" small />
      </div>
    </nav>
  );
}
