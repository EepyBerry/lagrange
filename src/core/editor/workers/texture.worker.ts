import type {
  SerializedBiomeParameters,
  SerializedColor,
  SerializedColorRampStep,
} from '@core/editor/workers/worker-serializer.types.ts';
import { avg } from '@core/utils/math-utils.ts';
import Rect from '@core/utils/math/rect.ts';
import { Color } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';

export type TextureWorkerOperation = 'raw' | 'color-ramp' | 'biomes' | 'biomes-emissive';
export type TextureWorkerInput<OperationData> = {
  type: 'texture-update';
  id: string;
  width: number;
  height: number;
  operation: TextureWorkerOperation;
  data: OperationData;
};
export type TextureWorkerOutput = {
  id: string;
  type: 'done';
  data: Uint8ClampedArray;
};

const canvas: OffscreenCanvas = new OffscreenCanvas(1, 1);
const layerCanvas: OffscreenCanvas = new OffscreenCanvas(1, 1);

const ctx: OffscreenCanvasRenderingContext2D = canvas.getContext('2d', { willReadFrequently: true })!;
ctx.imageSmoothingEnabled = false;

const layerCtx: OffscreenCanvasRenderingContext2D = layerCanvas.getContext('2d', { willReadFrequently: true })!;
layerCtx.imageSmoothingEnabled = false;

self.onmessage = (msg: MessageEvent<TextureWorkerInput<unknown>>) => {
  if (msg.data && msg.data.type === 'texture-update') {
    execTextureUpdate(msg.data);
  }
};
function execTextureUpdate(data: TextureWorkerInput<unknown>): void {
  if (!data.width || !data.height || data.width <= 0 || data.height <= 0) {
    // TODO use a dedicated export dialog
    console.error(`Invalid texture resolution: ${data.width} / ${data.height}`);
    return;
  }

  canvas.width = data.width;
  canvas.height = data.height;
  layerCanvas.width = data.width;
  layerCanvas.height = data.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  switch (data.operation) {
    case 'raw':
      ctx.globalCompositeOperation = 'source-over';
      drawImageData(<ImageData>data.data);
      break;
    case 'color-ramp':
      ctx.resetTransform();
      ctx.globalCompositeOperation = 'copy';
      drawColorRamp(<SerializedColorRampStep[]>data.data);
      break;
    case 'biomes':
      ctx.globalCompositeOperation = 'source-over';
      (<SerializedBiomeParameters[]>data.data).toReversed().forEach((biome) => drawBiomeLayer(biome));
      break;
    case 'biomes-emissive':
      ctx.globalCompositeOperation = 'source-over';
      (<SerializedBiomeParameters[]>data.data).toReversed().forEach((biome) => drawBiomeEmissivityLayer(biome));
      break;
  }
  const imageData = ctx.getImageData(0, 0, data.width, data.height);
  self.postMessage({ id: data.id, type: 'done', data: imageData.data });
}

// ------------------------------------------------------------------------------------------------

function drawImageData(imageData: ImageData): void {
  ctx.putImageData(imageData, 0, 0);
}

// ------------------------------------------------------------------------------------------------

function drawColorRamp(steps: SerializedColorRampStep[]): void {
  if (!steps || steps.length === 0) {
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  steps.forEach((step) => gradient.addColorStop(step.factor, threeColorToCssStyle(step.color, step.alpha)));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ------------------------------------------------------------------------------------------------

function drawBiomeLayer(biome: SerializedBiomeParameters): void {
  if (!biome) return;
  const texSize = canvas.width;
  const biomeRect: Rect = new Rect(
    Math.floor(biome.humiMin * texSize),
    Math.floor(biome.tempMin * texSize),
    Math.ceil((biome.humiMax - biome.humiMin) * texSize),
    Math.ceil((biome.tempMax - biome.tempMin) * texSize),
  );
  // Early return if smoothness is zero
  if (biome.smoothness <= 1e-4) {
    ctx.fillStyle = `#${new Color(biome.color.r, biome.color.g, biome.color.b).getHexString()}`;
    ctx.fillRect(biomeRect.x, biomeRect.y, biomeRect.w, biomeRect.h);
    return;
  }
  // Calculate smoothing distance and fill
  const rectAvgSmoothingDistance = Math.floor(avg(biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness));
  shrinkFillRect(biomeRect, biome.color, rectAvgSmoothingDistance);
  ctx.drawImage(
    layerCanvas,
    biomeRect.x,
    biomeRect.y,
    biomeRect.w,
    biomeRect.h,
    biomeRect.x,
    biomeRect.y,
    biomeRect.w,
    biomeRect.h,
  );
}

function drawBiomeEmissivityLayer(biome: SerializedBiomeParameters): void {
  if (!biome) return;
  const texSize = canvas.width;
  const biomeRect: Rect = new Rect(
    Math.floor(biome.humiMin * texSize),
    Math.floor(biome.tempMin * texSize),
    Math.ceil((biome.humiMax - biome.humiMin) * texSize),
    Math.ceil((biome.tempMax - biome.tempMin) * texSize),
  );
  // Modulate emissivity value by biome intensity (10 = max value)
  // Note: only using green channel, which the human eye is more sensitive to
  const texColor = new Color('#000000');
  texColor.g = biome.emissiveIntensity / 10;
  // Early return if smoothness is zero
  if (biome.smoothness <= 1e-4) {
    ctx.fillStyle = `#${texColor.getHexString()}`;
    ctx.fillRect(biomeRect.x, biomeRect.y, biomeRect.w, biomeRect.h);
    return;
  }
  // Calculate smoothing distance and fill
  const rectAvgSmoothingDistance = Math.floor(avg(biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness));
  shrinkFillRect(biomeRect, texColor, rectAvgSmoothingDistance);
  ctx.drawImage(
    layerCanvas,
    biomeRect.x,
    biomeRect.y,
    biomeRect.w,
    biomeRect.h,
    biomeRect.x,
    biomeRect.y,
    biomeRect.w,
    biomeRect.h,
  );
}

/**
 * Draws a rectangular gradient rect on raw pixel data, while accounting for border overlaps
 * @param startRect the Rect to start drawing at
 * @param baseColor base color to draw with
 * @param smoothingDistance orthogonal distance between the edge of the section and the first rect where pixels have an alpha of 1
 */
function shrinkFillRect(startRect: Rect, baseColor: SerializedColor, smoothingDistance: number): void {
  // Early return if width or height is invalid
  if (startRect.w <= 0 || startRect.h <= 0) return;

  // ---- Precalculation phase ----
  // Fetch canvas border overlaps and prepare raw drawing data (ImageData, RGB components)
  const overlaps = startRect.findCanvasBorderOverlaps(canvas.width, canvas.width);
  const imageData = new ImageData(startRect.w, startRect.h);
  const r = Math.round(baseColor.r * 255);
  const g = Math.round(baseColor.g * 255);
  const b = Math.round(baseColor.b * 255);

  // ---- Drawing phase ----
  // For each pixel, calculate its minimum X/Y distance to the rect bounds.
  // If a side overlaps with the canvas border, set the distance to Infinity so it's never smoothed.
  const iterPixelData = { minDistX: Infinity, minDistY: Infinity, minDist: Infinity, alpha: 255 };
  let rowOffset = 0;
  let dataIndex = 0;
  let alpha = 255;
  for (let y = 0; y < startRect.h; y++) {
    iterPixelData.minDistY = Math.min(overlaps[0] ? Infinity : y, overlaps[2] ? Infinity : startRect.h - 1 - y);
    rowOffset = y * startRect.w * 4;

    for (let x = 0; x < startRect.w; x++) {
      iterPixelData.minDistX = Math.min(overlaps[3] ? Infinity : x, overlaps[1] ? Infinity : startRect.w - 1 - x);
      iterPixelData.minDist = Math.min(iterPixelData.minDistX, iterPixelData.minDistY);
      // set alpha value according to the min distance to a rect border
      if (iterPixelData.minDist >= smoothingDistance) alpha = 255;
      else alpha = Math.round(clamp(iterPixelData.minDist / smoothingDistance, 0, 1) * 255);
      // write data
      dataIndex = rowOffset + x * 4;
      imageData.data[dataIndex] = r;
      imageData.data[dataIndex + 1] = g;
      imageData.data[dataIndex + 2] = b;
      imageData.data[dataIndex + 3] = alpha;
    }
  }

  layerCtx.putImageData(imageData, startRect.x, startRect.y);
}

// ------------------------------------------------------------------------------------------------

function threeColorToCssStyle(color: SerializedColor, a: number): string {
  return `rgba(${clamp(color.r * 255.0, 0, 255)}, ${clamp(color.g * 255.0, 0, 255)}, ${clamp(color.b * 255.0, 0, 255)}, ${a})`;
}
