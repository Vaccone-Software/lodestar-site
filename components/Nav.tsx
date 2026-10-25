import DownloadPill from "@/components/DownloadPill";
import { doors } from "@/data/doors";

// One bar on every page: the name, the four doors, the guide, the changelog
// and the download. No icon beside the name; the mark lives on the
// homepage, where the launcher already lists the doors, so the bar there
// leaves them out.
export default function Nav({
  tag,
  current,
  withDoors = true,
}: {
  tag: string | null;
  current?: string;
  withDoors?: boolean;
}) {
  const link = (page: string) =>
    `transition-colors ${current === page ? "text-ink" : "text-dim hover:text-ink"}`;
  return (
    <nav
      aria-label="Lodestar"
      className="relative z-20 grid h-[52px] grid-cols-[1fr_auto] items-center px-4 text-[14px] font-medium md:grid-cols-[1fr_auto_1fr] md:px-6"
    >
      <a
        href="/"
        className="text-ink font-display justify-self-start text-[18px] font-bold tracking-[-0.012em]"
      >
        Lodestar
      </a>
      {withDoors ? (
        <div className="hidden gap-1 md:flex">
          {doors.map((door) => (
            <a
              key={door.slug}
              href={`/${door.slug}`}
              aria-current={current === door.slug ? "page" : undefined}
              className={`rounded-[var(--control)] px-3 py-[6px] transition-colors ${
                current === door.slug
                  ? "text-ink bg-raised"
                  : "text-dim hover:text-ink"
              }`}
            >
              {door.name}
            </a>
          ))}
        </div>
      ) : (
        <span className="hidden md:block" />
      )}
      <div className="flex items-center gap-6 justify-self-end">
        <a
          href="/guide"
          aria-current={current === "guide" ? "page" : undefined}
          className={`hidden sm:inline ${link("guide")}`}
        >
          Guide
        </a>
        <a
          href="/changelog"
          aria-current={current === "changelog" ? "page" : undefined}
          className={link("changelog")}
        >
          Changelog
        </a>
        <DownloadPill fallback={tag} label="Download" small />
      </div>
    </nav>
  );
}
