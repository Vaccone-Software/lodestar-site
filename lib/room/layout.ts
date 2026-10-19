// Where everything in the room stands: the Settings overview made a room.
// Four doors on a hairline ring round the mark, clockwise from the top
// left; on a phone, in reading order with no ring. Pure arithmetic over the
// space the headline and the download leave, so the room fits any window
// without scrolling.

import type { Door } from "@/data/doors";

export type Slug = Door["slug"];

export type Point = { x: number; y: number };

export type Placement = {
  /** The door's picture is centred on x, with its top at y. */
  x: number;
  y: number;
  /** From the mark toward the door, which the mark leans along and the
      picture's shadow falls away along. */
  away: Point;
};

export type Layout = {
  phone: boolean;
  /** The ring's centre, and the space between the doors' centres. */
  cx: number;
  cy: number;
  dx: number;
  dy: number;
  /** A picture's width; its height is three quarters of it. */
  picture: number;
  mark: { x: number; y: number; size: number };
  /** The hairline ellipse through every door; none on a phone. */
  ring: { rx: number; ry: number } | null;
  doors: Record<Slug, Placement>;
};

/** A picture is four units wide to three high. */
export const aspect = 0.75;

type Slot = readonly [number, number];

const ringSlots: Record<Slug, Slot> = {
  write: [-1, -1],
  switch: [1, -1],
  keep: [1, 1],
  speak: [-1, 1],
};

const phoneSlots: Record<Slug, Slot> = {
  write: [-1, -1],
  switch: [1, -1],
  keep: [-1, 1],
  speak: [1, 1],
};

const slugs = Object.keys(ringSlots) as Slug[];

/** The ring's side of the panel that opens: opposite the door, so the door
    stays in view. */
export function opensOnLeft(slug: Slug): boolean {
  return ringSlots[slug][0] > 0;
}

/** `top` and `bottom` bound the space between the headline and the download,
    in the stage's own coordinates. */
export function arrange(width: number, top: number, bottom: number): Layout {
  const phone = width < 760;
  // The name and the line under a picture.
  const label = phone ? 74 : 52;
  const cx = width / 2;
  let picture: number;
  let cy: number;
  let dx: number;
  let dy: number;
  let size: number;
  let markY: number;
  if (phone) {
    size = Math.min(width * 0.36, (bottom - top) * 0.22);
    const rows = top + size + 4;
    picture = Math.min(width * 0.44, ((bottom - rows) / 2 - label) / aspect);
    const height = picture * aspect;
    dx = width * 0.25;
    const first = rows + height / 2;
    const last = bottom - label - height / 2;
    cy = (first + last) / 2;
    dy = (last - first) / 2;
    markY = top + size / 2;
  } else {
    picture = Math.min(
      width * 0.18,
      270,
      ((bottom - top - 30) / 2 - label) / aspect,
    );
    const height = picture * aspect;
    const first = top + height / 2;
    const last = bottom - label - height / 2;
    cy = (first + last) / 2;
    dy = (last - first) / 2;
    dx = Math.min(width * 0.3, 470);
    size = Math.min(dy * 2 + height * 0.6, dx * 1.05, 420);
    markY = cy;
  }

  // The ellipse goes through every door, and stays below the headline.
  const reach = Math.min(
    dy / Math.sin(Math.atan2(dy, dx * 0.62)),
    cy - top + 4,
  );
  const theta = Math.asin(Math.min(0.97, dy / reach));

  const slots = phone ? phoneSlots : ringSlots;
  const doors = {} as Record<Slug, Placement>;
  for (const slug of slugs) {
    const [sx, sy] = slots[slug];
    const x = cx + sx * dx;
    const y = cy + sy * dy;
    doors[slug] = {
      x,
      y: y - (picture * aspect) / 2,
      away: { x: x - cx, y: y - markY },
    };
  }
  return {
    phone,
    cx,
    cy,
    dx,
    dy,
    picture,
    mark: { x: cx, y: markY, size },
    ring: phone ? null : { rx: dx / Math.cos(theta), ry: dy / Math.sin(theta) },
    doors,
  };
}
