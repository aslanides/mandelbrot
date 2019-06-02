/* Functions for drawing on the canvas. */

import { View } from './view';

export function drawHistogram(
  ctx: CanvasRenderingContext2D,
  view: View,
  escapeTimes: Uint32Array,
  maxIterations: number
) {
  // Reset canvas.
  const width = view.width;
  const height = view.height;
  const i = view.i;
  const j = view.j;

  console.assert(escapeTimes.length === width * height, 'Bad width/height.');

  ctx.fillRect(i, j, width, height);
  // Get image data.
  const numColors = 255 ** 3;
  const imageData = ctx.getImageData(i, j, width, height);
  const histogram = new Float32Array(maxIterations);

  let totalIterations = 0;
  for (let i = 0; i < width * height; i++) {
    const time = escapeTimes[i];
    histogram[time]++;
    totalIterations++;
  }

  for (let i = 0; i < width * height; i++) {
    const time = escapeTimes[i];
    let color = Math.floor((histogram[time] * numColors) / totalIterations);
    for (let channel = 0; channel < 3; channel++) {
      imageData.data[4 * i + channel] = color % 255;
      color /= 255;
    }
  }

  ctx.putImageData(imageData, i, j);
}

export function draw(
  ctx: CanvasRenderingContext2D,
  view: View,
  escapeTimes: Uint32Array,
  maxIterations: number
) {
  // Reset canvas.
  const width = view.width;
  const height = view.height;
  const i = view.i;
  const j = view.j;

  console.assert(escapeTimes.length === width * height, 'Bad width/height.');

  ctx.fillRect(i, j, width, height);
  // Get image data.
  const numColors = 255 ** 3;
  const imageData = ctx.getImageData(i, j, width, height);

  for (let i = 0; i < width * height; i++) {
    const time = escapeTimes[i];
    let color = Math.floor((time / maxIterations) * numColors);
    for (let channel = 0; channel < 3; channel++) {
      imageData.data[4 * i + channel] = color % 255;
      color /= 255;
    }
  }

  ctx.putImageData(imageData, i, j);
  ctx.fillStyle = 'white';
  ctx.fillText(
    'left click to zoom in. right click to zoom out. r to reset.',
    10,
    10
  );
}
