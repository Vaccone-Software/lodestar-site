import EscHome from "@/components/EscHome";
import Foot from "@/components/Foot";
import Key from "@/components/Key";
import Nav from "@/components/Nav";
import { stableRelease } from "@/lib/server/stable";

// A page that does not exist is a destination that does not exist, and
// the answer is the same one every surface in Lodestar gives: esc.
export default async function NotFound() {
  const { tag } = await stableRelease();
  return (
    <>
      <Nav tag={tag} />
      <EscHome />
      <main
        id="main"
        className="mx-auto flex min-h-[70svh] max-w-[720px] flex-col justify-center px-4 md:px-6"
      >
        <p className="text-dim text-[13px] font-semibold">
          404 · No such destination
        </p>
        <h1 className="font-display mt-3 text-[clamp(2.2rem,5vw,3.25rem)] leading-[1.04] font-bold tracking-[-0.03em]">
          Nothing is named that
        </h1>
        <p className="text-dim mt-4 max-w-[46ch] text-[18px] leading-[1.5]">
          Every surface in Lodestar answers the same key when a place does not
          exist. The page does too.
        </p>
        <a
          href="/"
          className="text-dim hover:text-ink mt-8 inline-flex items-center gap-3 text-[16px]"
        >
          <Key lit>esc</Key> goes home
        </a>
      </main>
      <Foot className="mx-auto max-w-[720px] px-4 pb-8 md:px-6" />
    </>
  );
}
