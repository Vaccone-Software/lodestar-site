import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The link card: what an ad, a post, or a pasted URL unfurls into.
// Generated at build from the same geometry as the mark, so the card and
// the page never drift apart. force-static because the site exports
// statically and this image has nothing dynamic in it.
export const dynamic = "force-static";
export const alt = "Lodestar, keyboard navigation for macOS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The compass star from components/Mark.tsx, repeated here because the
// card renders through satori and cannot import a DOM component.
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

export default async function Image() {
  const [medium, regular] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/MapleMono-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/MapleMono-Regular.ttf")),
  ]);
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
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0b",
        padding: 88,
      }}
    >
      <svg width={140} height={140} viewBox="0 0 120 120">
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 92,
            color: "#f2f3f5",
            fontFamily: "Maple Medium",
            letterSpacing: -3,
          }}
        >
          Lodestar
        </div>
        <div
          style={{
            fontSize: 32,
            color: "rgba(242,243,245,0.6)",
            fontFamily: "Maple",
            marginTop: 18,
            maxWidth: 900,
          }}
        >
          An opinionated way to navigate and operate your computer.
        </div>
      </div>
      <div
        style={{
          fontSize: 21,
          color: "rgba(242,243,245,0.34)",
          fontFamily: "Maple",
        }}
      >
        macOS 13 or later · notarized · Fair Source · lodestar.vaccone.software
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Maple Medium", data: medium, weight: 500 },
        { name: "Maple", data: regular, weight: 400 },
      ],
    },
  );
}
