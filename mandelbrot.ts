interface Window {
  xCenter: number,
  yCenter: number,
  xRange: number,
  yRange: number,
}

const DEFAULTS = {
  xCenter: -0.75,
  yCenter: 0,
  xRange: 3.5,
  yRange: 2,
}

function zoom(event: MouseEvent, 
              ctx: CanvasRenderingContext2D,
              window: Window) {
  // TODO
  let xMin = window.xCenter - window.xRange/2
  let yMin = window.yCenter - window.yRange/2
  
  window.xCenter = xMin + window.xRange * event.layerX / ctx.canvas.width
  window.yCenter = yMin + window.yRange * event.layerY / ctx.canvas.height

  window.xRange /= 2
  window.yRange /= 2
}

function reset(ctx: CanvasRenderingContext2D): Window {
  return <Window> (<any> Object).assign({}, DEFAULTS)
}

function mandelbrot(
  ctx: CanvasRenderingContext2D,
  window: Window,
  maxIterations: number = 765, // 255 x 3, i.e. for R, G, B.
  escapeModulusSquared: number = 4, // 'Standard'.
  ): void {
  /* Naive escape time algorithm.*/

  // Get image bounds in the coordinate system.
  let xMin = window.xCenter - window.xRange/2
  let xMax = window.xCenter + window.xRange/2
  let yMin = window.yCenter - window.yRange/2
  let yMax = window.yCenter + window.yRange/2
  console.log(`Centered on ${window.xCenter} + ${window.yCenter}i.`)
  
  // Reset canvas.
  let width = ctx.canvas.width
  let height = ctx.canvas.height
  ctx.fillRect(0, 0, width, height);

  // Get image data.
  let imageData = ctx.getImageData(0, 0, width, height);
  
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let escapeTime = 0;
      let a = xMin + (window.xRange) * x/width
      let b = yMin + (window.yRange) * y/height
      let currentX = 0;
      let currentY = 0;
      for (let i = 0; i < maxIterations; i++) {
        let x_temp = currentX**2 - currentY**2 + a;
        currentY = 2 * currentX * currentY + b;
        currentX = x_temp
        if (currentX**2 + currentY**2 > escapeModulusSquared) {
          break
        }
        escapeTime++;
      }
      
      let idx = 4 * (x + width * y)
      let channel = Math.floor(escapeTime / 255);
      let color = escapeTime % 255;
      imageData.data[idx + channel] = color
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function main() {
  // Create the canvas.
  const canvas = <HTMLCanvasElement> document.getElementById("myCanvas");
  canvas.width = 840
  canvas.height = 480
  
  // Get the rendering context and set fill to black.
  let ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  
  // Create a reset button.
  let resetButton = <HTMLButtonElement> document.getElementById('resetButton')
  
  // Make initial window.
  let window = reset(ctx)

  // Add event listeners for reset and zoom.
  resetButton.addEventListener(
    'click', _ => {window = reset(ctx); mandelbrot(ctx, window)})
  canvas.addEventListener(
    'click', e => {zoom(e, ctx, window); mandelbrot(ctx, window)})
  
  //
}

main()
