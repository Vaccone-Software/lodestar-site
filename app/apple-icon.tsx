import { ImageResponse } from "next/og";
import mark from "@/data/mark.json";

// The app icon for a home screen: the star with depth on the icon's warm
// charcoal, from data/mark.json (written by scripts/make-icon.sh --install).
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

type Face = { points: number[][]; fill: string };

export default function Icon() {
  const radius = 62;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(${mark.ground.top}, ${mark.ground.bottom})` }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        {(mark.faces as Face[]).map((face, i) => (
          <polygon
            key={i}
            points={face.points.map(([x, y]) => `${(90 + x * radius).toFixed(2)},${(92 + y * radius).toFixed(2)}`).join(" ")}
            fill={face.fill}
            stroke={face.fill}
            strokeWidth="0.3"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>,
    size,
  );
}
