// The line every page ends on.
export default function Foot({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`text-faint flex justify-between gap-4 text-[12.5px] ${className}`.trim()}
    >
      <span>No account</span>
      <span>A passion project by Vaccone</span>
    </footer>
  );
}
