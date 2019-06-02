/* Main entry point for the program. */

import { draw } from './draw';
import { View, reset, split, zoom } from './view';

const ZOOM_FACTOR = 2;
const NUM_WORKERS = 9;
const SQRT_NUM_WORKERS = Math.sqrt(NUM_WORKERS);
const MAX_ITERATIONS = 1000;
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
  let views = new Array<View>(NUM_WORKERS);
  const workers = new Array<Worker>();
  for (let i = 0; i < NUM_WORKERS; i++) {
    // Create a new 'Mandelbrot worker'.
    const worker = new Worker('mandelbrot.ts');
    worker.onmessage = (e: MessageEvent) => {
      const times = e.data as Uint32Array;
      draw(ctx, views[i], times, MAX_ITERATIONS);
    };
    workers.push(worker);
  }

  // Function to dispatch work to each worker.
  const dispatch = (v: View) => {
    views = split(v, NUM_WORKERS);
    for (let i = 0; i < NUM_WORKERS; i++) {
      workers[i].postMessage(views[i]);
    }
  };

  // Initial
  let view = reset(canvas.width, canvas.height, MAX_ITERATIONS);
  dispatch(view);
  const undoStack = new Array<View>();

  // Key 'r' to reset.
  window.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'r') {
      // Reset
      view = reset(canvas.width, canvas.height, MAX_ITERATIONS);
      while (undoStack.length) {
        undoStack.pop();
      }
      dispatch(view);
    } else if (e.key === 'b') {
      // Undo
      if (undoStack.length) {
        view = undoStack.pop() as View;
        dispatch(view);
      }
    }
  });

  // Left click to zoom in.
  canvas.addEventListener('click', e => {
    undoStack.push(Object.assign({}, view));
    view = zoom(e, view, ZOOM_FACTOR);
    dispatch(view);
  });

  // Right click to zoom out.
  canvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    undoStack.push(Object.assign({}, view));
    view = zoom(e, view, 1 / ZOOM_FACTOR);
    dispatch(view);
  });
}

main();
