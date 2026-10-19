import type { Slug } from "@/lib/room/layout";

// The pictures are the app's own Settings renders, one pair per door and per
// ground: the picture itself, and a second image holding only the parts that
// wear the accent, so the room tints that one and draws the rest as rendered.
// Pale is for the night's pictures, sand for clay's.

export type Picture = { base: HTMLImageElement; accent: HTMLImageElement };

const settled = new Map<string, Promise<Picture>>();

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** A door's picture for the ground, loaded once. */
export function pictureFor(slug: Slug, night: boolean): Promise<Picture> {
  const ground = night ? "pale" : "sand";
  const name = `${slug}-${ground}`;
  let picture = settled.get(name);
  if (!picture) {
    picture = Promise.all([
      load(`/media/room/${name}-base.webp`),
      load(`/media/room/${name}-accent.webp`),
    ])
      .then(([base, accent]) => ({ base, accent }))
      .catch((error) => {
        settled.delete(name);
        throw error;
      });
    settled.set(name, picture);
  }
  return picture;
}

let tinted: HTMLCanvasElement | null = null;

/** Draws the picture at the canvas's own size, the accent layer multiplied
    by the colour and laid over the base. */
export function compose(
  canvas: HTMLCanvasElement,
  picture: Picture,
  colour: string,
) {
  const context = canvas.getContext("2d");
  tinted ??= document.createElement("canvas");
  const layer = tinted.getContext("2d");
  if (!context || !layer) return;
  const { width, height } = canvas;
  tinted.width = width;
  tinted.height = height;
  context.clearRect(0, 0, width, height);
  context.drawImage(picture.base, 0, 0, width, height);
  layer.globalCompositeOperation = "source-over";
  layer.drawImage(picture.accent, 0, 0, width, height);
  layer.globalCompositeOperation = "multiply";
  layer.fillStyle = colour;
  layer.fillRect(0, 0, width, height);
  layer.globalCompositeOperation = "destination-in";
  layer.drawImage(picture.accent, 0, 0, width, height);
  context.drawImage(tinted, 0, 0);
}
