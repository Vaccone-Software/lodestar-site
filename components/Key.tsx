// A key on the page. Lit means held or pressed, in the accent, the way the
// app's own footer lights the key it is waiting on.
export default function Key({
  children,
  lit,
  className = "",
}: {
  children: React.ReactNode;
  lit?: boolean;
  className?: string;
}) {
  return (
    <kbd className={`key ${lit ? "lit" : ""} ${className}`.trim()}>
      {children}
    </kbd>
  );
}

export function Keys({
  keys,
  lit = [],
  className = "",
}: {
  keys: string[];
  lit?: string[];
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`.trim()}>
      {keys.map((key, i) => (
        <Key key={`${key}-${i}`} lit={lit.includes(key)}>
          {key}
        </Key>
      ))}
    </span>
  );
}
