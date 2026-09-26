import EscHome from "@/components/EscHome";
import Foot from "@/components/Foot";
import Nav from "@/components/Nav";
import { latestRelease } from "@/lib/releases";

// A page that does not exist is a destination that does not exist, and
// the answer is the same one every surface in Lodestar gives: esc.
export default async function NotFound() {
  const { tag } = await latestRelease();
  return (
    <>
      <Nav tag={tag} />
      <EscHome />
      <main id="main" className="mx-auto flex min-h-[70svh] max-w-[720px] flex-col justify-center px-4 md:px-7">
        <p className="text-accent text-[12px] font-semibold tracking-[0.16em] uppercase">
          404 · No such destination
        </p>
        <h1 className="over-sky mt-3 text-[clamp(38px,5vw,60px)] leading-[1] font-semibold tracking-[-0.04em]">
          Nothing is named that
        </h1>
        <p className="text-dim mt-5 max-w-[46ch] text-[17px] leading-[1.55]">
          Every surface in Lodestar answers the same key when a place does not
          exist. The page does too.
        </p>
        <a href="/" className="text-dim hover:text-ink mt-8 inline-flex items-center gap-2 text-[15px]">
          <kbd className="key lit">esc</kbd> goes home
        </a>
      </main>
      <Foot className="mx-auto max-w-[720px] px-4 pb-8 md:px-7" />
    </>
  );
}
