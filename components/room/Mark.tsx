"use client";

import { useRef } from "react";
import { parseHex } from "@/lib/room/accent";
import {
  faces,
  lit,
  paint,
  project,
  standing,
  stone,
  type Lean,
} from "@/lib/room/mark";
import { useFrames, useReducedMotion } from "@/components/room/hooks";

/** The mark turns once in thirty seconds. */
const turn = (Math.PI * 2) / 30;

/** The room's one light: the app's twelve-point star, drawn live on a 2D
    canvas with flat faces in the accent. It leans toward the door you come
    to, and while a download runs it lights face by face, clockwise from the
    top, with the unlit faces in stone. */
export default function Mark({
  size,
  accent,
  night,
  toward,
  progress,
  className,
  style,
}: {
  size: number;
  accent: string;
  night: boolean;
  /** Where the mark leans: a rotation about x and y, easing in. */
  toward: Lean;
  /** 0..1 while a download lights the mark, standing (-1) otherwise. Read
      every frame, never rendered. */
  progress: React.RefObject<number>;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const leaning = useRef<[number, number]>([0, 0]);
  const reduced = useReducedMotion();

  useFrames((seconds) => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    // Reduced motion leans at once and does not turn.
    const ease = reduced ? 1 : 0.06;
    leaning.current = [
      leaning.current[0] + (toward[0] - leaning.current[0]) * ease,
      leaning.current[1] + (toward[1] - leaning.current[1]) * ease,
    ];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const side = Math.round(size * dpr);
    if (element.width !== side) element.width = element.height = side;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size, size);

    const seen = faces(0.6 + (reduced ? 0 : seconds * turn), leaning.current);
    const lighting = progress.current !== standing;
    const on = lighting ? lit(seen, progress.current) : null;
    const colour = parseHex(accent);
    const unlit = stone(night);
    for (const face of seen) {
      const fill = paint(face, on === null || on.has(face) ? colour : unlit);
      context.fillStyle = fill;
      context.strokeStyle = fill;
      context.lineWidth = 0.7;
      context.lineJoin = "round";
      context.beginPath();
      face.points.forEach((point, i) => {
        const [x, y] = project(point, size);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.fill();
      context.stroke();
    }
  });

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={className}
      style={{ ...style, width: size, height: size }}
    />
  );
}
