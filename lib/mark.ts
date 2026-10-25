// The mark's geometry, built as Mark.swift builds it: a dodecahedron with a
// five-sided spike raised on every face, twelve points in all. Each face
// takes its value only from how it faces the light, so the one colour is
// International Orange and nothing is painted. Pure maths, safe anywhere;
// the canvas drawing is components/home/Mark.tsx.

export type Rgb = readonly [number, number, number];

export function parseHex(hex: string): Rgb {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return [r, g, b];
}

export function toHex(color: Rgb): string {
  return (
    "#" +
    color
      .map((v) =>
        Math.round(Math.max(0, Math.min(255, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export type Vec = readonly [number, number, number];
export type Triangle = readonly [Vec, Vec, Vec];

/** One face of the mark as the viewer sees it. */
export type Face = {
  points: Triangle;
  normal: Vec;
  /** Nearer the viewer is larger; faces are painted smallest first. */
  depth: number;
  /** Clockwise from the top, in 0..2π, for lighting the faces in order. */
  angle: number;
};

/** How far the mark leans toward a door, as a rotation about x and y. */
export type Lean = readonly [number, number];

const phi = (1 + Math.sqrt(5)) / 2;
const spike = 3.05;
const tau = Math.PI * 2;

const dot = (p: Vec, q: Vec): number => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (p: Vec, q: Vec): Vec => [
  p[1] * q[2] - p[2] * q[1],
  p[2] * q[0] - p[0] * q[2],
  p[0] * q[1] - p[1] * q[0],
];
const unit = (v: Vec): Vec => {
  const length = Math.hypot(...v);
  return [v[0] / length, v[1] / length, v[2] / length];
};
const centroid = (points: readonly Vec[]): Vec => {
  const sum = points.reduce<Vec>(
    (s, v) => [s[0] + v[0], s[1] + v[1], s[2] + v[2]],
    [0, 0, 0],
  );
  return [
    sum[0] / points.length,
    sum[1] / points.length,
    sum[2] / points.length,
  ];
};

/** The twenty corners of the dodecahedron and the twelve face directions. */
function solid(): { corners: Vec[]; directions: Vec[] } {
  const corners: Vec[] = [];
  const directions: Vec[] = [];
  const ip = 1 / phi;
  for (const x of [-1, 1])
    for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push([x, y, z]);
  for (const a of [-1, 1])
    for (const b of [-1, 1]) {
      corners.push(
        [0, a * ip, b * phi],
        [a * ip, b * phi, 0],
        [a * phi, 0, b * ip],
      );
      directions.push([0, a, b * phi], [a, b * phi, 0], [a * phi, 0, b]);
    }
  return { corners, directions };
}

/** Sixty triangles, wound so each faces outward. */
function build(): Triangle[] {
  const { corners, directions } = solid();
  const triangles: Triangle[] = [];
  for (const direction of directions) {
    const n = unit(direction);
    const face = corners
      .slice()
      .sort((p, q) => dot(q, n) - dot(p, n))
      .slice(0, 5);
    const c = centroid(face);
    const u = unit(sub(face[0], c));
    const w = cross(n, u);
    const around = (p: Vec) => Math.atan2(dot(sub(p, c), w), dot(sub(p, c), u));
    face.sort((p, q) => around(p) - around(q));
    const apex: Vec = [n[0] * spike, n[1] * spike, n[2] * spike];
    for (let i = 0; i < 5; i++) {
      const t: Triangle = [face[i], face[(i + 1) % 5], apex];
      const outward = dot(
        cross(sub(t[1], t[0]), sub(t[2], t[0])),
        sub(centroid(t), c),
      );
      triangles.push(outward < 0 ? [t[0], t[2], t[1]] : t);
    }
  }
  return triangles;
}

const triangles = build();

const rad = (degrees: number) => (degrees * Math.PI) / 180;
const rotX = (v: Vec, a: number): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};
const rotY = (v: Vec, a: number): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};
const rotZ = (v: Vec, a: number): Vec => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
};

/** Where a corner stands: the mark's resting pose, then its turn about the
    vertical, then its tilt toward the viewer, each with the lean added. */
function place(v: Vec, spin: number, lean: Lean): Vec {
  const resting = rotX(rotY(rotZ(v, rad(8)), rad(-18)), rad(24));
  return rotX(rotY(resting, spin + lean[1]), rad(14) + lean[0]);
}

/** The faces turned toward the viewer, back to front. */
export function faces(spin: number, lean: Lean): Face[] {
  const seen: Face[] = [];
  for (const triangle of triangles) {
    const [a, b, c] = triangle.map((v) => place(v, spin, lean));
    const normal = unit(cross(sub(b, a), sub(c, a)));
    if (normal[2] <= 0) continue;
    const middle = centroid([a, b, c]);
    seen.push({
      points: [a, b, c],
      normal,
      depth: middle[2],
      angle: (Math.atan2(middle[0], middle[1]) + tau) % tau,
    });
  }
  return seen.sort((p, q) => p.depth - q.depth);
}

/** Where the light comes from: above, to the left, toward the viewer. */
const light = unit([-0.55, 0.7, 0.9]);

/** The face's colour from the colour it stands in: lifted toward white where
    it faces the light, dropped toward black where it turns away. */
export function paint(face: Face, base: Rgb): string {
  const tone = Math.max(-1, Math.min(1, dot(face.normal, light) * 1.25 - 0.15));
  return toHex(
    tone >= 0
      ? mix(base, [255, 255, 255], tone * 0.4)
      : mix(base, [0, 0, 0], -tone * 0.44),
  );
}

/** A corner's place on a square canvas of the given side. */
export function project(v: Vec, side: number): [number, number] {
  const k = side / 6.9;
  return [side / 2 + v[0] * k, side / 2 - v[1] * k];
}
