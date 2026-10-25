import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import mark from "@/data/mark.json";

// The link card, drawn once for every page: the mark on Night, a title,
// and a line. What a pasted URL unfurls into, and for most people the
// first thing they see of Lodestar. Generated at build from the same
// geometry as the mark, so the card and the page never drift apart.

export const cardSize = { width: 1200, height: 630 };

export async function card({
  title,
  line,
  eyebrow,
  oneLine = false,
}: {
  title: string;
  line: string;
  eyebrow?: string;
  /** A headline that must stand on one line, set smaller to fit beside the mark. */
  oneLine?: boolean;
}) {
  const [regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/InterTight-400.ttf")),
    readFile(join(process.cwd(), "assets/fonts/InterTight-600.ttf")),
  ]);
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
        background: "#120F0C",
        padding: 84,
        position: "relative",
      }}
    >
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
      <div style={{ display: "flex", fontSize: 24, color: "#A99F92", fontFamily: "Inter", fontWeight: 600 }}>
        {eyebrow ?? "Lodestar"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
        <div
          style={{
            fontSize: oneLine ? 58 : long ? 64 : 84,
            lineHeight: 1,
            color: "#F1EBE2",
            fontFamily: "Inter",
            fontWeight: 600,
            letterSpacing: -3,
            maxWidth: oneLine ? 760 : 700,
            whiteSpace: oneLine ? "nowrap" : "normal",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#A99F92",
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
      <div style={{ display: "flex", fontSize: 20, color: "#8C8277", fontFamily: "Inter", fontWeight: 400 }}>
        Lodestar · Free · Apple silicon, macOS 27 or later
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
