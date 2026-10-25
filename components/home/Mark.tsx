"use client";

import { useRef } from "react";
import { faces, paint, parseHex, project } from "@/lib/mark";
import { useFrames, useReducedMotion } from "@/components/home/hooks";

/** The mark turns once in thirty seconds. */
const turn = (Math.PI * 2) / 30;
const orange = parseHex("#fa5617");

/** The app's twelve-point star, drawn live on a canvas, every face in the
    one orange and shaded only by how it faces the light from above. */
export default function Mark({ size, className }: { size: number; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const drawn = useRef(false);

  useFrames(
    (seconds) => {
      const element = canvas.current;
      const context = element?.getContext("2d");
      if (!element || !context) return;
      if (reduced && drawn.current) return;
      drawn.current = true;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const side = Math.round(size * dpr);
      if (element.width !== side) element.width = element.height = side;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size, size);
      for (const face of faces(0.6 + (reduced ? 0 : seconds * turn), [0, 0])) {
        const fill = paint(face, orange);
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
    },
    !reduced || !drawn.current,
  );

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
