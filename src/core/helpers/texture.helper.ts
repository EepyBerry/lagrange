import type { BiomeParameters } from "@core/models/biome-parameters.model";
import { avg, truncateTo } from "@core/utils/math-utils";
import { Color, CubeTextureLoader, DataTexture, NearestFilter, Scene, type MinificationTextureFilter } from "three";
import type { ColorRampStep } from "../models/color-ramp.model";
import { clamp, lerp } from "three/src/math/MathUtils.js";
import Rect from "../utils/math/rect";

const CUBE_TEXTURE_LOADER = new CubeTextureLoader();

export function loadCubeTextureSkybox(scene: Scene, path: string, filter?: MinificationTextureFilter) {
  const cubemap = CUBE_TEXTURE_LOADER.setPath(path).load([
    "right.png",
    "left.png",
    "top.png",
    "bottom.png",
    "front.png",
    "back.png",
  ]);
  cubemap.minFilter = filter ?? NearestFilter;
  scene.background = cubemap;
}

// ------------------------------------------------------------------------------------------------

export function createRampTexture(buffer: Uint8Array, w: number, steps: ColorRampStep[]): DataTexture {
  if (steps.length > 0) {
    fillRamp(buffer, w, steps);
  }

  const dt = new DataTexture(buffer, w, 1);
  dt.needsUpdate = true;
  return dt;
}

export function recalculateRampTexture(buffer: Uint8Array, w: number, steps: ColorRampStep[]): void {
  if (steps.length === 0) {
    return;
  }
  buffer.fill(0);
  fillRamp(buffer, w, steps);
}

function fillRamp(buffer: Uint8Array, w: number, steps: ColorRampStep[]) {
  let stride = 0;
  let currentStep, nextStep;
  for (let i = 0; i < steps.length - 1; i++) {
    currentStep = steps[i].clone();
    nextStep = steps[i + 1].clone();

    const currentStepX = truncateTo(currentStep.factor * w, 1e4);
    const nextStepX = truncateTo(nextStep.factor * w, 1e4);
    const totalPixels = Math.ceil(nextStepX - currentStepX);

    const lerpColor = new Color(0x0);
    let lerpAlpha = currentStep.alpha;
    for (let px = 0; px < totalPixels; px++) {
      lerpColor.lerpColors(currentStep.color, nextStep.color, truncateTo(px / totalPixels, 1e4));
      lerpAlpha = lerp(currentStep.alpha, nextStep.alpha, truncateTo(px / totalPixels, 1e4));
      buffer[stride] = clamp(lerpColor.r * 255, 0, 255);
      buffer[stride + 1] = clamp(lerpColor.g * 255, 0, 255);
      buffer[stride + 2] = clamp(lerpColor.b * 255, 0, 255);
      buffer[stride + 3] = clamp(lerpAlpha * 255, 0, 255);
      stride += 4;
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function fillBiomeLayer(biome: BiomeParameters, canvas: OffscreenCanvas): void {
  if (!biome || !canvas) return;
  const texSize = canvas.width;
  const biomeRect: Rect = new Rect(
    Math.floor(biome.humiMin * texSize),
    Math.floor(biome.tempMin * texSize),
    Math.ceil((biome.humiMax - biome.humiMin) * texSize),
    Math.ceil((biome.tempMax - biome.tempMin) * texSize),
  );
  // Early return if smoothness is zero
  if (biome.smoothness <= Number.EPSILON) {
    fillRect(canvas, biomeRect, biome.color);
    return;
  }
  // Calculate smoothing distance and fill
  const rectAvgSmoothingDistance = Math.floor(avg(biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness));
  shrinkFillRect(canvas, biomeRect, biome.color, rectAvgSmoothingDistance);
}

export function fillBiomeEmissivityLayer(biome: BiomeParameters, canvas: OffscreenCanvas): void {
  if (!biome || !canvas) return;
  const texSize = canvas.width;
  const biomeRect: Rect = new Rect(
    Math.floor(biome.humiMin * texSize),
    Math.floor(biome.tempMin * texSize),
    Math.ceil((biome.humiMax - biome.humiMin) * texSize),
    Math.ceil((biome.tempMax - biome.tempMin) * texSize),
  );
  // Modulate emissivity value by biome intensity (10 = max value)
  // Note: only using green channel, which the human eye is more sensitive to
  const texColor = new Color("#000000");
  texColor.g = (biome.emissiveOverride ? biome.emissiveIntensity : biome.parentEmissiveIntensity) / 10;
  // Early return if smoothness is zero
  if (biome.smoothness <= 1e-4) {
    fillRect(canvas, biomeRect, biome.color);
    return;
  }
  // Calculate smoothing distance and fill
  const rectAvgSmoothingDistance = Math.floor(avg(biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness));
  shrinkFillRect(canvas, biomeRect, texColor, rectAvgSmoothingDistance);
}

// ------------------------------------------------------------------------------------------------

/**
 * Fills a section of an OffscreenCanvas with the given color
 * @param canvas the OffscreenCanvas to draw on
 * @param startRect the Rect to start drwaing at
 * @param color base color to draw with
 */
function fillRect(canvas: OffscreenCanvas, startRect: Rect, color: Color) {
  startRect.adjustToHTMLCanvas();
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.fillRect(startRect.x, startRect.y, startRect.w, startRect.h);
}

/**
 * Fills a section of an OffscreenCanvas by progressively shrinking the drawing rect according to the given smoothing distance
 * @param canvas the OffscreenCanvas to draw on
 * @param startRect the Rect to start drwaing at
 * @param baseColor base color to draw with
 * @param smoothingDistance orthogonal distance between the edge of the section and the first rect where pixels have an alpha of 1
 */
function shrinkFillRect(canvas: OffscreenCanvas, startRect: Rect, baseColor: Color, smoothingDistance: number): void {
  // ---- Precalculation phase ----
  // Fetch canvas texture width (in all cases, w = h as all textures generated using this function are sent to the GPU)
  // Then, get overlaps with the global texture borders; overlaps define sections where smoothness should NOT be applied
  const texSize = canvas.width;
  const startRectOverlaps = startRect.findOverlaps(texSize, texSize);

  // ---- Canvas preparation phase ----
  // Configure the target canvas and adapt the drawing rect to account for smoothing.
  // The latter must be adjusted to get crisp, exact-size rects (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, texSize, texSize);
  const drawingRect = startRect.clone().adjustToHTMLCanvas();

  // ---- Canvas filling phase ----
  // Loop n-1 times, where n is defined as the number of pixel values between the lighest alpha value and an alpha of 1 (exclusive)
  //   ---> in this context, n = smoothingDistance
  // At each iteration, "shrink" the drawing zone by 1px while taking into account border overlaps, then draw a stroked rect
  // The last step before exiting is to fill the remaining space with the base color unaltered
  let pixelShift = 0;
  while (pixelShift < smoothingDistance && drawingRect.isValid()) {
    // Adjust drawing rect position; early return if next rect would redraw on itself
    if (drawingRect.w === 1 || drawingRect.h === 1) return;
    drawingRect.shrink(startRectOverlaps);
    pixelShift++;

    // draw stroked rect
    ctx.strokeStyle = `rgba(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255}, ${clamp(
      truncateTo(pixelShift / smoothingDistance, 1e4),
      0,
      0.99,
    )})`;
    ctx.clearRect(drawingRect.x - 0.5, drawingRect.y - 0.5, drawingRect.w + 1, drawingRect.h + 1);
    ctx.strokeRect(drawingRect.x, drawingRect.y, drawingRect.w, drawingRect.h);
  }
  // fill remaining rect
  ctx.fillStyle = `rgba(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255}, 1)`;
  ctx.fillRect(drawingRect.x++, drawingRect.y++, drawingRect.w--, drawingRect.h--);
}
