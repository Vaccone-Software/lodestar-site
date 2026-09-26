import mark from "@/data/mark.json";

// Lodestar's mark: the star with depth, drawn from data/mark.json, which
// scripts/make-icon.sh --install writes from the app's Mark.swift. The
// faces and their fills are the app icon's and the menu bar's; nothing
// about the mark is decided here.
type Face = { points: number[][]; fill: string };

export function markPolygons(center: number, radius: number) {
  return (mark.faces as Face[]).map((face, i) => (
    <polygon
      key={i}
      points={face.points.map(([x, y]) => `${(center + x * radius).toFixed(2)},${(center + y * radius).toFixed(2)}`).join(" ")}
      fill={face.fill}
      stroke={face.fill}
      strokeWidth={radius / 300}
      strokeLinejoin="round"
    />
  ));
}

export default function Mark({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-label="Lodestar">
      {markPolygons(60, 57)}
    </svg>
  );
}
