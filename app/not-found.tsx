import Header from "@/components/Header";
import { Keyboard } from "@/components/Scenes";

// A page that does not exist is a destination that does not exist, and
// the answer is the same one every surface in Lodestar gives: esc.
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-col px-[5vw] pt-28 pb-16 lg:px-8">
      <Header />
      <div className="mx-auto w-full max-w-[720px] flex-1">
        <p className="text-faint font-mono text-[11px] tracking-[0.2em] uppercase">
          <span className="glint">404</span>
          <span className="mx-2">·</span>
          No such destination
        </p>
        <h1 className="font-display text-ink mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-normal tracking-[-0.02em]">
          Nothing is named that
        </h1>
        <p className="text-dim mt-6 max-w-[48ch] text-[17px] leading-[1.6]">
          Every surface in Lodestar answers the same key when a place does
          not exist. The page does too.
        </p>
        <div className="mt-10">
          <Keyboard lit={["esc"]} />
        </div>
        <a
          href="/"
          className="text-dim hover:text-ink mt-4 inline-block font-mono text-[12.5px] transition-colors"
        >
          <span className="key lit mr-2">esc</span> goes home
        </a>
      </div>
    </main>
  );
}
