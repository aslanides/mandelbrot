/* Main entry point for the program. */

import * as draw from './draw';
import * as view from './view';

export const MAX_ITERATIONS = 1000;
const NUM_WORKERS = 9;
const SQRT_NUM_WORKERS = Math.sqrt(NUM_WORKERS);
console.assert(SQRT_NUM_WORKERS === Math.floor(SQRT_NUM_WORKERS));

function main() {
  /* Runs the Mandelbrot visualization. */

  // Get the canvas.
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Ensure that the canvas dimensions are divisible by sqrt(numWorkers).
  canvas.width -= canvas.width % SQRT_NUM_WORKERS;
  canvas.height -= canvas.height % SQRT_NUM_WORKERS;

  // Get the rendering context and set fill to black.
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#000000';

  // Create workers for rendering subviews.
  let v = view.reset(ctx);
  let views = new Array<view.View>(NUM_WORKERS);
  const workers = new Array<Worker>(NUM_WORKERS);
  for (let i = 0; i < NUM_WORKERS; i++) {
    // Create a new 'Mandelbrot worker'.
    const worker = new Worker('mandelbrot.ts');
    worker.onmessage = (e: MessageEvent) => {
      const times = e.data as Uint32Array;
      draw.draw(ctx, views[i], times, MAX_ITERATIONS);
    };
    workers[i] = worker;
  }

  // Reset handler.
  const resetButton = document.getElementById('reset') as HTMLButtonElement;
  resetButton.addEventListener('click', _ => {
    v = view.reset(ctx);
    views = view.split(v, NUM_WORKERS);
    console.log(views);
    for (let i = 0; i < NUM_WORKERS; i++) {
      workers[i].postMessage(views[i]);
    }
  });

  // Zoom handler.
  canvas.addEventListener('click', e => {
    v = view.zoom(e, v);
    views = view.split(v, NUM_WORKERS);
    for (let i = 0; i < NUM_WORKERS; i++) {
      workers[i].postMessage(views[i]);
    }
  });
}

main();
