// The compass star, drawn from the same geometry as the app icon and the
// menu bar mark: sixteen vertices, long cardinals, mid diagonals, a tight
// waist, inside a hairline graticule ring with cardinal ticks.
function starPoints(cx: number, cy: number, cardinal: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const radius =
      i % 2 === 1
        ? cardinal * (2.3 / 8.2)
        : i % 4 === 0
          ? cardinal
          : cardinal * (4.4 / 8.2);
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

export default function Mark({ size = 96 }: { size?: number }) {
  const c = 60;
  const ring = 44;
  const ticks = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const cardinal = i % 4 === 0;
    const inner = ring - (cardinal ? 5 : 2.5);
    const outer = ring + (cardinal ? 5 : 2.5);
    ticks.push(
      <line
        key={i}
        x1={c + Math.cos(angle) * inner}
        y1={c + Math.sin(angle) * inner}
        x2={c + Math.cos(angle) * outer}
        y2={c + Math.sin(angle) * outer}
        stroke="rgba(242,243,245,0.28)"
        strokeWidth="1"
      />,
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="Lodestar">
      <circle
        cx={c}
        cy={c}
        r={ring}
        fill="none"
        stroke="rgba(242,243,245,0.16)"
        strokeWidth="1"
      />
      {ticks}
      <polygon points={starPoints(c, c, 34)} fill="#f2f3f5" />
    </svg>
  );
}
