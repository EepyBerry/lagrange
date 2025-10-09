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
      _writeToBuffer(buffer, stride, _toRawRGBA(lerpColor, lerpAlpha), 255.0)
      stride += 4
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function createBiomeTexture(buffer: Uint8Array, w: number, biomes: BiomeParameters[]): DataTexture {
  if (biomes.length > 0) {
    fillBiomes(buffer, w, biomes)
  }
  const dt = new DataTexture(buffer, w, w)
  // saveAs(new Blob([dt.image.data as BlobPart]), 'berria.raw')
  dt.needsUpdate = true
  return dt
}

export function recalculateBiomeTexture(buffer: Uint8Array, w: number, biomes: BiomeParameters[]): void {
  if (biomes.length === 0) {
    return
  }
  buffer.fill(0)
  fillBiomes(buffer, w, biomes)
}

function fillBiomes(buffer: Uint8Array, w: number, biomes: BiomeParameters[]) {
  let lineStride = 0
  let cellStride = (Math.ceil(biomes[0].humiMin * w) + biomes[0].tempMin * w) * 4
  for (let i = 0; i < biomes.length; i++) {
    const biome = biomes[i]
    const biomeRect: Rect = new Rect(
      Math.floor(biome.humiMin * w),
      Math.floor(biome.tempMin * w),
      Math.ceil((biome.humiMax - biome.humiMin) * w),
      Math.ceil((biome.tempMax - biome.tempMin) * w),
    )
    const totalPixels = biomeRect.w * biomeRect.h
    const maxBiomeX = (biomeRect.x + biomeRect.w) * 4

    // Pre-calculate smoothing data
    const biomeAvgSmoothness = avg(...[biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness])
    const biomeOverlaps = biomeRect.findOverlaps(w, w /* w = h */)

    // Adjust strides depending on starting temp & humi
    cellStride = biomeRect.x * 4
    lineStride = biomeRect.y * w * 4

    // Prepare coords and pixel/biome colors
    const pixelCoords: Vector2 = new Vector2(biomeRect.x, biomeRect.y)
    const pixelRGBA = { r: 0, g: 0, b: 0, a: 0 }
    const biomeRGBA = { r: biome.color.r, g: biome.color.g, b: biome.color.b, a: 1 }

    // Iterate through every single pixel inside the biome rect
    let rectDistance: number, bufferIdx: number, blendedColor: RawRGBA
    for (let biomePx = 0; biomePx < totalPixels; biomePx++) {
      bufferIdx = lineStride + cellStride
      _writeToRawRGBA(pixelRGBA, buffer, bufferIdx, MUL_INT8_TO_UNIT)

      rectDistance = biomeRect.findMinDistanceWithin(pixelCoords.x, pixelCoords.y, biomeOverlaps)
      biomeRGBA.a = truncateTo(clamp(rectDistance / biomeAvgSmoothness, 0, 1), 1e4)

      if (pixelRGBA.a > 0) {
        blendedColor = alphaBlendColors(pixelRGBA, biomeRGBA)
        _writeToBuffer(buffer, bufferIdx, blendedColor, 255.0)
      } else {
        _writeToBuffer(buffer, bufferIdx, biomeRGBA, 255.0)
      }

      cellStride += 4
      pixelCoords.x++

      if (cellStride >= maxBiomeX) {
        lineStride += w * 4
        cellStride = biomeRect.x * 4
        pixelCoords.x = biomeRect.x
        pixelCoords.y++
      }
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function fillBiomeLayer(biome: BiomeParameters, ctx: OffscreenCanvasRenderingContext2D, opts?: LayerDrawOptions) {
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
    // Adjust drawing rect position; early return if next position is invalid
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

function _writeToRawRGBA(rgba: RawRGBA, buffer: Uint8Array, index: number, multiplier: number = 1) {
  rgba.r = clamp(buffer[index] * multiplier, 0, 1)
  rgba.g = clamp(buffer[index + 1] * multiplier, 0, 1)
  rgba.b = clamp(buffer[index + 2] * multiplier, 0, 1)
  rgba.a = clamp(buffer[index + 3] * multiplier, 0, 1)
}

function _writeToBuffer(buffer: Uint8Array, index: number, rgba: RawRGBA, multiplier: number = 1) {
  buffer[index] = clamp(rgba.r * multiplier, 0, 255)
  buffer[index + 1] = clamp(rgba.g * multiplier, 0, 255)
  buffer[index + 2] = clamp(rgba.b * multiplier, 0, 255)
  buffer[index + 3] = clamp(rgba.a * multiplier, 0, 255)
}

function _toRawRGBA(color: Color, a: number): RawRGBA {
  return { r: color.r, g: color.g, b: color.b, a }
}
