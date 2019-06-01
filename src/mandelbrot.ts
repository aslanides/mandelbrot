export interface View {
  xCenter: number;
  yCenter: number;
  xRange: number;
  yRange: number;
  width: number;
  height: number;
}

export function mandelbrot(
  view: View,
  maxIterations = 1000,
  escapeModulusSquared = 256
): Float32Array {
  /* Naive escape time algorithm.*/

  // Get image bounds in the coordinate system.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;
  console.log(
    `Computing Mandelbrot, centered on ${view.xCenter} + ${view.yCenter}i.`
  );

  const escapeTimes = new Float32Array(view.width * view.height);

  // Color each pixel by escape time.
  for (let i = 0; i < view.width; i++) {
    for (let j = 0; j < view.height; j++) {
      let escapeTime = 0;
      // Transform from pixels -> coordinate system.
      const a = xMin + (view.xRange * i) / view.width;
      const b = yMin + (view.yRange * j) / view.height;
      let x = 0;
      let y = 0;
      for (let iter = 0; iter < maxIterations; iter++) {
        /* z <- z^2 + c
             = (x + yi)^2 + (a + bi)
             = x^2 -y^2 + 2xyi + a + bi
             = (x^2 -y^2 + a) + (2xy + b)i
        */
        const xTemp = x ** 2 - y ** 2 + a;
        y = 2 * x * y + b;
        x = xTemp;
        if (x ** 2 + y ** 2 > escapeModulusSquared) {
          break;
        }
        escapeTime++;
      }

      escapeTimes[i + view.width * j] = escapeTime;
    }
  }

  return escapeTimes;
}

onmessage = (e: MessageEvent) => {
  const view = e.data as View;
  const times = mandelbrot(view);
  postMessage(times);
};
