interface View {
  xCenter: number;
  yCenter: number;
  xRange: number;
  yRange: number;
  width: number;
  height: number;
}

function mandelbrot(
  view: View,
  maxIterations = 1000,
  escapeModulusSquared = 256
): Float32Array {
  /* Naive escape time algorithm.*/

  // Get image bounds in the coordinate system.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;
  console.log(`Centered on ${view.xCenter} + ${view.yCenter}i.`);

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

  // Make initial 'view'.
  let view: View;
  let times: Float32Array;

  // Get the canvas.
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Get the rendering context and set fill to black.
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = '#000000';

  // Get a reset button.
  const resetButton = document.getElementById('reset') as HTMLButtonElement;

  // Add event listeners for reset and zoom.
  resetButton.addEventListener('click', _ => {
    view = reset(ctx);
    times = mandelbrot(view);
    draw(ctx, times);
  });
  canvas.addEventListener('click', e => {
    view = zoom(e, view);
    times = mandelbrot(view);
    draw(ctx, times);
  });

  //
}

main();
