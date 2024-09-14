import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { Rect, DataTextureWrapper, Coordinates2D, RawRGBA } from '@/core/types'
import { alphaBlendColors, avg, findMinDistanceToRect, findRectOverlaps, truncateTo } from '@/utils/math-utils'
import { Color, DataTexture } from 'three'
import type { ColorRampStep } from '../models/color-ramp.model'
import { clamp } from 'three/src/math/MathUtils.js'
import { INT8_TO_UNIT_MUL } from '../globals'

export function createRampTexture(buffer: Uint8Array, w: number, steps: ColorRampStep[]): DataTextureWrapper {
  if (steps.length > 0) {
    fillRamp(buffer, w, steps)
  }
  const dt = new DataTexture(buffer, w, 1)
  dt.needsUpdate = true
  return { texture: dt, data: buffer }
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
    for (let px = 0; px < totalPixels; px++) {
      lerpColor.lerpColors(currentStep.color, nextStep.color, truncateTo(px / totalPixels, 1e4))
      buffer[stride] = Math.floor(lerpColor.r * 255.0)
      buffer[stride + 1] = Math.floor(lerpColor.g * 255.0)
      buffer[stride + 2] = Math.floor(lerpColor.b * 255.0)
      buffer[stride + 3] = 255
      stride += 4
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function createBiomeTexture(buffer: Uint8Array, w: number, biomes: BiomeParameters[]): DataTextureWrapper {
  if (biomes.length > 0) {
    fillBiomes(buffer, w, biomes)
  }
  const dt = new DataTexture(buffer, w, w)
  dt.needsUpdate = true
  return { texture: dt, data: buffer }
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
    const biomeRect: Rect = {
      x: Math.floor(biome.humiMin * w),
      y: Math.floor(biome.tempMin * w),
      w: Math.ceil((biome.humiMax - biome.humiMin) * w),
      h: Math.ceil((biome.tempMax - biome.tempMin) * w),
    }
    const totalPixels = biomeRect.w * biomeRect.h
    const maxBiomeX = (biomeRect.x + biomeRect.w) * 4

    // Pre-calculate smoothing data
    const biomeAvgSmoothness = avg(...[biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness])
    const biomeOverlaps = findRectOverlaps(w, w, biomeRect)

    // Adjust strides depending on starting temp & humi
    cellStride = biomeRect.x * 4
    lineStride = biomeRect.y * w * 4

    // Prepare coords and pixel/biome colors
    const pixelCoords: Coordinates2D = { x: biomeRect.x, y: biomeRect.y }
    const pixelRGBA = { r: 0, g: 0, b: 0, a: 0 }
    const biomeRGBA = { r: biome.color.r, g: biome.color.g, b: biome.color.b, a: 1 }

    // Iterate through every single pixel inside the biome rect
    let rectDistance: number, bufferIdx: number, blendedColor: RawRGBA
    for (let biomePx = 0; biomePx < totalPixels; biomePx++) {
      bufferIdx = lineStride + cellStride
      pixelRGBA.r = buffer[bufferIdx] * INT8_TO_UNIT_MUL
      pixelRGBA.g = buffer[bufferIdx + 1] * INT8_TO_UNIT_MUL
      pixelRGBA.b = buffer[bufferIdx + 2] * INT8_TO_UNIT_MUL
      pixelRGBA.a = buffer[bufferIdx + 3] * INT8_TO_UNIT_MUL

      rectDistance = findMinDistanceToRect(biomeRect, pixelCoords.x, pixelCoords.y, biomeOverlaps)
      biomeRGBA.a = truncateTo(clamp(rectDistance / biomeAvgSmoothness, 0, 1), 1e4)

      if (pixelRGBA.a > 0) {
        blendedColor = alphaBlendColors(pixelRGBA, biomeRGBA)
        buffer[bufferIdx] = blendedColor.r * 255.0
        buffer[bufferIdx + 1] = blendedColor.g * 255.0
        buffer[bufferIdx + 2] = blendedColor.b * 255.0
        buffer[bufferIdx + 3] = blendedColor.a * 255.0
      } else {
        buffer[bufferIdx] = biomeRGBA.r * 255.0
        buffer[bufferIdx + 1] = biomeRGBA.g * 255.0
        buffer[bufferIdx + 2] = biomeRGBA.b * 255.0
        buffer[bufferIdx + 3] = biomeRGBA.a * 255.0
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
