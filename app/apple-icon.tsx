import { ImageResponse } from "next/og";

// The mark on the ground, for a home screen. Same geometry as the icon
// and the menu bar mark.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function starPoints(cx: number, cy: number, cardinal: number): string {
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const radius =
      i % 2 === 1 ? cardinal * (2.3 / 8.2) : i % 4 === 0 ? cardinal : cardinal * (4.4 / 8.2);
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return points.join(" ");
}

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0c" }}>
      <svg width={150} height={150} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={44} fill="none" stroke="rgba(242,243,245,0.16)" strokeWidth="1" />
        <polygon points={starPoints(60, 60, 34)} fill="#f2f3f5" />
      </svg>
    </div>,
    size,
  );
}
