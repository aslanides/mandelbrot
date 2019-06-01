/* Functions for manipulating the user's view. */

export interface View {
  // Coordinate system.
  xCenter: number;
  yCenter: number;
  xRange: number;
  yRange: number;

  // Pixels.
  i: number;
  j: number;
  width: number;
  height: number;
}

export function zoom(event: MouseEvent, view: View, zoomFactor = 2): View {
  /* Zooms the view given a user click. */

  // Get the top left corner of the current view.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;

  // Get the new view center.
  view.xCenter = xMin + (view.xRange * event.layerX) / view.width;
  view.yCenter = yMin + (view.yRange * event.layerY) / view.height;
  console.log(`Centered on ${view.xCenter} + ${view.yCenter}i.`);

  // Zoom.
  view.xRange /= zoomFactor;
  view.yRange /= zoomFactor;

  return view;
}

export function reset(ctx: CanvasRenderingContext2D): View {
  /* Resets to the 'default' view of the Mandelbrot set. */

  return {
    xCenter: -0.75,
    yCenter: 0,
    xRange: 3.5,
    yRange: 2,
    i: 0,
    j: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
  };
}

export function split(view: View, numWorkers: number): View[] {
  const sqrtNumWorkers = Math.sqrt(numWorkers);
  console.assert(sqrtNumWorkers === Math.floor(sqrtNumWorkers));
  console.assert(view.i === 0);
  console.assert(view.j === 0);

  const views = new Array<View>();
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;
  for (let i = 0; i < sqrtNumWorkers; i++) {
    for (let j = 0; j < sqrtNumWorkers; j++) {
      const subView = {
        i: (i * view.width) / sqrtNumWorkers,
        j: (j * view.height) / sqrtNumWorkers,
        height: view.height / sqrtNumWorkers,
        width: view.width / sqrtNumWorkers,

        xRange: view.xRange / sqrtNumWorkers,
        yRange: view.yRange / sqrtNumWorkers,
        xCenter: xMin + ((0.5 + i) * view.xRange) / sqrtNumWorkers,
        yCenter: yMin + ((0.5 + j) * view.yRange) / sqrtNumWorkers,
      };
      views.push(subView);
    }
  }

  return views;
}
