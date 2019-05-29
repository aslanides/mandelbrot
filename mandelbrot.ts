// import "colormap";

interface View {
  xCenter: number;
  yCenter: number;
  xRange: number;
  yRange: number;
}

function mandelbrot(
  ctx: CanvasRenderingContext2D,
  view: View,
  maxIterations = 1000,
  escapeModulusSquared = 4
): void {
  /* Naive escape time algorithm.*/

  // Get image bounds in the coordinate system.
  const xMin = view.xCenter - view.xRange / 2;
  const xMax = view.xCenter + view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;
  const yMax = view.yCenter + view.yRange / 2;
  console.log(`Centered on ${view.xCenter} + ${view.yCenter}i.`);

  // Reset canvas.
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.fillRect(0, 0, width, height);

  // Get image data.
  const numColors = 255 ** 3;
  const imageData = ctx.getImageData(0, 0, width, height);
  const escapeTimes = new Float32Array(width * height);
  const histogram = new Float32Array(maxIterations);
  let totalIterations = 0;

  // Color each pixel by escape time.
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let escapeTime = 0;
      // Transform from pixels -> coordinate system.
      const a = xMin + (view.xRange * i) / width;
      const b = yMin + (view.yRange * j) / height;
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

      escapeTimes[i + width * j] = escapeTime;
      histogram[escapeTime]++;
      totalIterations++;
    }
  }

  for (let i =0; i < maxIterations; i++) {
    histogram[i] /= totalIterations;
  }

  for (let i = 0; i < width * height; i++) {
    let time = escapeTimes[i];
    let color = Math.floor(histogram[time] * numColors);
    for (let channel = 0; channel < 3; channel++) {
      imageData.data[4 * i + channel] = color % 255;
      color /= 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function zoom(
  event: MouseEvent,
  ctx: CanvasRenderingContext2D,
  view: View,
  zoomFactor = 2
): View {
  /* Zooms the view given a user click. */

  // Get the top left corner of the current view.
  const xMin = view.xCenter - view.xRange / 2;
  const yMin = view.yCenter - view.yRange / 2;

  // Get the new view center.
  view.xCenter = xMin + (view.xRange * event.layerX) / ctx.canvas.width;
  view.yCenter = yMin + (view.yRange * event.layerY) / ctx.canvas.height;

  // Zoom.
  view.xRange /= zoomFactor;
  view.yRange /= zoomFactor;

  return view;
}

function reset(ctx: CanvasRenderingContext2D): View {
  /* Resets to the 'default' view of the Mandelbrot set. */

  return {
    xCenter: -0.75,
    yCenter: 0,
    xRange: 3.5,
    yRange: 2,
  };
}

function main() {
  /* Runs the Mandelbrot visualization.*/

  // Make initial 'view'.
  let view: View;

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
    mandelbrot(ctx, view);
  });
  canvas.addEventListener('click', e => {
    view = zoom(e, ctx, view);
    mandelbrot(ctx, view);
  });

  //
}

main();
