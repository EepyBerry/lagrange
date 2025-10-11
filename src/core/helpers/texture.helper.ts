import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { RawRGBA } from '@/core/types'
import { avg, truncateTo } from '@/core/utils/math-utils'
import { Color, CubeTextureLoader, DataTexture, NearestFilter, Vector2, type MinificationTextureFilter } from 'three'
import type { ColorRampStep } from '../models/color-ramp.model'
import { clamp, lerp } from 'three/src/math/MathUtils.js'
import { MUL_INT8_TO_UNIT } from '../globals'
import { alphaBlendColors } from '@/core/utils/render-utils'
import Rect from '../utils/math/rect'
import type { LayerDrawOptions } from '../utils/texture/layered-data-texture'

const CUBE_TEXTURE_LOADER = new CubeTextureLoader()

/**
 *
 * @param path Loads a THREE.CubeTexture from the given path and faces
 * @param faces the faces of the cubemap
 */
export function loadCubeTexture(path: string, faces: string[], filter?: MinificationTextureFilter) {
  if (faces.length !== 6) {
    throw new Error('Exactly six faces are required for a CubeTexture !')
  }
  const cubemap = CUBE_TEXTURE_LOADER.setPath(path).load(faces)
  cubemap.minFilter = filter ?? NearestFilter
  return cubemap
}


// ------------------------------------------------------------------------------------------------

export function createRampTexture(buffer: Uint8Array, w: number, steps: ColorRampStep[]): DataTexture {
  if (steps.length > 0) {
    fillRamp(buffer, w, steps)
  }

  const dt = new DataTexture(buffer, w, 1)
  dt.needsUpdate = true
  return dt
}

export function recalculateRampTexture(buffer: Uint8Array, w: number, steps: ColorRampStep[]): void {
  if (steps.length === 0) {
    return
  }
  buffer.fill(0)
  fillRamp(buffer, w, steps)
}

function fillRamp(buffer: Uint8Array, w: number, steps: ColorRampStep[]) {
  let stride = 0
  let currentStep, nextStep
  for (let i = 0; i < steps.length - 1; i++) {
    currentStep = steps[i].clone()
    nextStep = steps[i + 1].clone()

    const currentStepX = truncateTo(currentStep.factor * w, 1e4)
    const nextStepX = truncateTo(nextStep.factor * w, 1e4)
    const totalPixels = Math.ceil(nextStepX - currentStepX)

    const lerpColor = new Color(0x0)
    let lerpAlpha = currentStep.alpha
    for (let px = 0; px < totalPixels; px++) {
      lerpColor.lerpColors(currentStep.color, nextStep.color, truncateTo(px / totalPixels, 1e4))
      lerpAlpha = lerp(currentStep.alpha, nextStep.alpha, truncateTo(px / totalPixels, 1e4))
      buffer[stride] = clamp(lerpColor.r * 255.0, 0, 255)
      buffer[stride + 1] = clamp(lerpColor.g * 255.0, 0, 255)
      buffer[stride + 2] = clamp(lerpColor.b * 255.0, 0, 255)
      buffer[stride + 3] = clamp(lerpAlpha * 255.0, 0, 255)
      stride += 4
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function fillBiomeLayer(biome: BiomeParameters, canvas: OffscreenCanvas, opts?: LayerDrawOptions) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const texSize = opts!.width! // width must exist
  const biomeRect: Rect = new Rect(
    Math.floor(biome.humiMin * texSize),
    Math.floor(biome.tempMin * texSize),
    Math.ceil((biome.humiMax - biome.humiMin) * texSize),
    Math.ceil((biome.tempMax - biome.tempMin) * texSize),
  )
  // early return if smoothness is zero
  if (biome.smoothness <= Number.EPSILON) {
    biomeRect.adjustToHTMLCanvas()
    ctx.fillStyle = `rgba(${biome.color.r*255}, ${biome.color.g*255}, ${biome.color.b*255}, 1)`
    ctx.fillRect(biomeRect.x, biomeRect.y, biomeRect.w, biomeRect.h)
    return 
  }

  // ---- Precalculation phase ----
  // Get average smoothness between w and h; will serve as a smoothing distance when calculating alpha values
  const rectAvgSmoothingDistance = Math.floor(avg(...[biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness]))
  // Get biome overlaps with the global texture borders; overlaps define sections where biome smoothness should NOT be applied
  const biomeTextureBorderOverlaps = biomeRect.findOverlaps(texSize, texSize)

  // ---- Canvas preparation phase ----
  // Configure the target canvas and adapt the drawing rect to account for smoothing.
  // The later must be adjusted to get crisp, exact-size rects (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0,0,texSize,texSize)
  const drawingRect = biomeRect.clone().adjustToHTMLCanvas()

  // ---- Canvas filling phase ----
  // Loop n-1 times, where n is defined as the number of pixel values between the lighest alpha value and an alpha of 1 (exclusive)
  //   ---> in this context, n = rectAvgSmoothingDistance
  // At each iteration, "shrink" the drawing zone by 1px while taking into account border overlaps, then draw a stroked rect
  // The last step before exiting is to fill the remaining space with the biome color unaltered
  let pixelShift = 0
  while (pixelShift < rectAvgSmoothingDistance && drawingRect.isValid()) {
    // Adjust drawing rect position; early return if next rect would redraw on itself
    if (drawingRect.w === 1 || drawingRect.h === 1) return
    drawingRect.shrink(biomeTextureBorderOverlaps)
    pixelShift++

    // draw stroked rect
    ctx.strokeStyle = `rgba(${biome.color.r*255}, ${biome.color.g*255}, ${biome.color.b*255}, ${
      clamp(truncateTo(pixelShift / rectAvgSmoothingDistance, 1e4), 0.0, 0.99)
    })`
    ctx.clearRect(drawingRect.x-0.5, drawingRect.y-0.5, drawingRect.w+1, drawingRect.h+1)
    ctx.strokeRect(drawingRect.x, drawingRect.y, drawingRect.w, drawingRect.h)
  }
  // fill remaining rect
  ctx.fillStyle = `rgba(${biome.color.r*255}, ${biome.color.g*255}, ${biome.color.b*255}, 1)`
  ctx.fillRect(drawingRect.x++, drawingRect.y++, drawingRect.w--, drawingRect.h--)
}

// ------------------------------------------------------------------------------------------------

function _writeToBuffer(buffer: Uint8Array, index: number, rgba: RawRGBA, multiplier: number = 1) {
  buffer[index] = clamp(rgba.r * multiplier, 0, 255)
  buffer[index + 1] = clamp(rgba.g * multiplier, 0, 255)
  buffer[index + 2] = clamp(rgba.b * multiplier, 0, 255)
  buffer[index + 3] = clamp(rgba.a * multiplier, 0, 255)
}

function _toRawRGBA(color: Color, a: number): RawRGBA {
  return { r: color.r, g: color.g, b: color.b, a }
}
