// The line every page ends on, and the door for researchers, who arrive by
// a link someone sent them rather than from the bar.
export default function Foot({ className = "" }: { className?: string }) {
  return (
    <footer className={`text-dim flex justify-start gap-4 text-[13px] ${className}`.trim()}>
      <span>No account · A passion project by Vaccone</span>
      <a href="/research" className="hover:text-ink transition-colors">
        Research
      </a>
    </footer>
  );
}
