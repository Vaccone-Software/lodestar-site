import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import mark from "@/data/mark.json";

// The link card, drawn once for every page: the sky, the mark, a title,
// and a line. What a pasted URL unfurls into, and for most people the
// first thing they see of Lodestar. Generated at build from the same
// geometry as the mark, so the card and the page never drift apart.

export const cardSize = { width: 1200, height: 630 };

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
      r: 0.5 + next() * 1.3,
      a: 0.2 + next() * 0.55,
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
  const [regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/InterTight-400.ttf")),
    readFile(join(process.cwd(), "assets/fonts/InterTight-600.ttf")),
  ]);
  const field = stars(120, seed);
  const long = title.length > 26;
  // The mark, from the same faces the app icon is drawn with.
  const size = 280;
  const c = size / 2;
  const r = size * 0.48;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#040406",
        padding: 84,
        position: "relative",
      }}
    >
      <svg width={1200} height={630} viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
        {field.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(242,242,244,${s.a.toFixed(2)})`} />
        ))}
      </svg>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: "absolute", right: 64, top: 96 }}
      >
        {mark.faces.map((face, i) => (
          <polygon
            key={i}
            points={face.points.map(([x, y]) => `${(c + x * r).toFixed(1)},${(c + y * r).toFixed(1)}`).join(" ")}
            fill={face.fill}
            stroke={face.fill}
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div style={{ display: "flex", fontSize: 22, color: "#ff4f00", fontFamily: "Inter", fontWeight: 600, letterSpacing: 3 }}>
        {(eyebrow ?? "Lodestar").toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
        <div
          style={{
            fontSize: long ? 64 : 84,
            lineHeight: 1,
            color: "#f1ede8",
            fontFamily: "Inter",
            fontWeight: 600,
            letterSpacing: -3,
            maxWidth: 700,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a39d96",
            fontFamily: "Inter",
            fontWeight: 400,
            marginTop: 22,
            maxWidth: 760,
            lineHeight: 1.35,
          }}
        >
          {line}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 20, color: "#7d7771", fontFamily: "Inter", fontWeight: 400 }}>
        Lodestar · Free · Apple silicon, macOS 14 or later
      </div>
    </div>,
    {
      ...cardSize,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
