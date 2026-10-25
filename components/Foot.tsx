// The line every page ends on.
export default function Foot({ className = "" }: { className?: string }) {
  return (
    <footer className={`text-dim flex justify-start gap-4 text-[13px] ${className}`.trim()}>
      <span>No account · A passion project by Vaccone</span>
    </footer>
  );
}
