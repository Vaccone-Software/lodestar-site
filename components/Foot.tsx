// The line every page ends on.
export default function Foot({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`text-faint flex justify-start gap-4 text-[12.5px] ${className}`.trim()}
    >
      <span>Developed by Vaccone Software</span>
    </footer>
  );
}
