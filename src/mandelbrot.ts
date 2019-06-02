/* Functions for computing the Mandelbrot set. */

import { reset, View } from './view';

export function mandelbrot(view: View, escapeModulusSquared = 4): Uint32Array {
  /* Naive escape time algorithm.*/

  // Get image bounds in the coordinate system.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;

  const escapeTimes = new Uint32Array(view.width * view.height);

  // Compute escape time for each pixel.
  for (let i = 0; i < view.width; i++) {
    for (let j = 0; j < view.height; j++) {
      let escapeTime = 0;
      // Transform from pixels -> coordinate system.
      const a = xMin + (view.xRange * i) / view.width;
      const b = yMin + (view.yRange * j) / view.height;
      let x = 0;
      let y = 0;
      for (let iter = 0; iter < view.maxIterations; iter++) {
        /* z <- z^2 + c
             = (x + yi)^2 + (a + bi)
             = x^2 -y^2 + 2xyi + a + bi
             = (x^2 -y^2 + a) + (2xy + b)i
        */
        const xSquared = x ** 2;
        const ySquared = y ** 2;
        const xTemp = xSquared - ySquared + a;
        y = 2 * x * y + b;
        x = xTemp;
        if (xSquared + ySquared > escapeModulusSquared) {
          break;
        }
        escapeTime++;
      }

      if (escapeTime < view.maxIterations) {
        const nu = Math.log2(Math.log2(x ** 2 + y ** 2));
        // escapeTime += nu - 4.0;
      }

      escapeTimes[i + view.width * j] = escapeTime;
    }
  }

  return escapeTimes;
}

export function benchmark(
  width: number,
  height: number,
  maxIterations: number
) {
  const view = reset(width, height, maxIterations);
  const start = Date.now();
  mandelbrot(view);
  const duration = (Date.now() - start) / 1000; /// In seconds.
  console.log(
    `Ran ${maxIterations} iterations at ${width}x${height} in ${duration} sec.`
  );
}

// Worker function.
onmessage = (e: MessageEvent) => {
  const view = e.data as View;
  const times = mandelbrot(view);
  postMessage(times);
};
