import { mandelbrot, View } from './mandelbrot';

function zoom(event: MouseEvent, view: View, zoomFactor = 2): View {
  /* Zooms the view given a user click. */

  // Get the top left corner of the current view.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;

  // Get the new view center.
  view.xCenter = xMin + (view.xRange * event.layerX) / view.width;
  view.yCenter = yMin + (view.yRange * event.layerY) / view.height;

  // Zoom.
  view.xRange /= zoomFactor;
  view.yRange /= zoomFactor;

  return view;
}

function draw(
  ctx: CanvasRenderingContext2D,
  escapeTimes: Float32Array,
  maxIterations = 1000
) {
  // Reset canvas.
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.fillRect(0, 0, width, height);
  // Get image data.
  const numColors = 255 ** 3;
  const imageData = ctx.getImageData(0, 0, width, height);
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

  ctx.putImageData(imageData, 0, 0);
}

function reset(ctx: CanvasRenderingContext2D): View {
  /* Resets to the 'default' view of the Mandelbrot set. */

  return {
    xCenter: -0.75,
    yCenter: 0,
    xRange: 3.5,
    yRange: 2,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
  };
}

function main() {
  /* Runs the Mandelbrot visualization.*/

  // Get the canvas.
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get the rendering context and set fill to black.
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#000000';

  // Get a reset button.
  const resetButton = document.getElementById('reset') as HTMLButtonElement;
  const worker = new Worker('mandelbrot.ts');

  let view: View;
  worker.onmessage = (e: MessageEvent) => {
    const times = e.data as Float32Array;
    draw(ctx, times);
  };

  // Add event listeners for reset and zoom.
  resetButton.addEventListener('click', _ => {
    view = reset(ctx);
    worker.postMessage(view);
  });
  canvas.addEventListener('click', e => {
    view = zoom(e, view);
    worker.postMessage(view);
  });

  //
}

main();
