import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The link card, drawn once for every page: the sky, the mark, a title,
// and a line. What a pasted URL unfurls into, and for most people the
// first thing they see of Lodestar. Generated at build from the same
// geometry as the mark, so the card and the page never drift apart.

export const cardSize = { width: 1200, height: 630 };

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

// A still field, seeded so the card is the same on every build.
function stars(count: number, seed0: number) {
  let seed = seed0;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: next() * 1200,
      y: next() * 630,
      r: 0.6 + next() * 1.4,
      a: 0.25 + next() * 0.6,
    });
  }
  return out;
}

export async function card({
  title,
  line,
  eyebrow,
  seed = 7,
}: {
  title: string;
  line: string;
  eyebrow?: string;
  seed?: number;
}) {
  const [serif, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Newsreader-Regular.ttf")),
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
  const field = stars(140, seed);
  const long = title.length > 26;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(180deg, #0a0a0c 0%, #050507 70%, #030305 100%)",
        padding: 88,
        position: "relative",
      }}
    >
      <svg width={1200} height={630} viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
        {field.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(242,243,245,${s.a.toFixed(2)})`} />
        ))}
        {[
          [980, 120],
          [1090, 300],
          [860, 520],
        ].map(([x, y], i) => (
          <g key={`g${i}`} stroke="rgba(242,243,245,0.5)" strokeWidth="1">
            <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
            <line x1={x} y1={y - 10} x2={x} y2={y + 10} />
            <circle cx={x} cy={y} r={2.2} fill="#f2f3f5" stroke="none" />
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={c} cy={c} r={ring} fill="none" stroke="rgba(242,243,245,0.16)" strokeWidth="1" />
          {ticks}
          <polygon points={starPoints(c, c, 34)} fill="#f2f3f5" />
        </svg>
        {eyebrow ? (
          <div style={{ fontSize: 20, color: "rgba(242,243,245,0.36)", fontFamily: "Maple", letterSpacing: 4 }}>
            {eyebrow.toUpperCase()}
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
        <div
          style={{
            fontSize: long ? 68 : 80,
            lineHeight: 1.02,
            color: "#f2f3f5",
            fontFamily: "Newsreader",
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(242,243,245,0.62)",
            fontFamily: "Newsreader",
            marginTop: 24,
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          {line}
        </div>
      </div>
      <div style={{ fontSize: 19, color: "rgba(242,243,245,0.36)", fontFamily: "Maple", letterSpacing: 1 }}>
        LODESTAR · MACOS 13 OR LATER · NOTARIZED · NOTHING LEAVES YOUR MAC
      </div>
    </div>,
    {
      ...cardSize,
      fonts: [
        { name: "Newsreader", data: serif, weight: 400, style: "normal" },
        { name: "Maple", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
