// The one line a subpage ends on: a way to act without going home.
export default function FootLine() {
  return (
    <p className="border-hairline text-faint mt-16 border-t pt-6 font-mono text-[11.5px] leading-relaxed">
      <a href="/#download" className="text-accent hover:text-[#ff7a3d]">
        Download Lodestar for macOS
      </a>{" "}
      · macOS 13 or later · notarized · nothing leaves your Mac
    </p>
  );
}
