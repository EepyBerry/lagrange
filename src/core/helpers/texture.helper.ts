import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { Rect, DataTextureWrapper } from '@/core/types'
import { findRectOverlaps, isWithinRect } from '@/utils/math-utils'
import { Color, DataTexture } from 'three'
import type { ColorRampStep } from '../models/color-ramp.model'
import { saveAs } from 'file-saver'

export function createRampTexture(w: number, steps: ColorRampStep[]) {
  const data = new Uint8Array(w * 4)
  if (steps.length > 0) {
    fillRamp(data, w, steps)
  }
}

function fillRamp(data: Uint8Array, w: number, steps: ColorRampStep[]) {
  let stride = 0
  for (let i = 0; i < steps.length-1; i++) {
    const step = steps[i]
    const nextStep = steps[i+1]

    const stepX = parseFloat((step.factor * w).toFixed(4))
    const nextStepX = parseFloat((nextStep.factor * w).toFixed(4))
    const totalPixels = (nextStepX-stepX) * 4

    let currentColor: Color = step.color
    const nextColor: Color = nextStep.color
    for (let px = 0; px < totalPixels; px++) {
      currentColor = currentColor.lerp(nextColor, 1.0)
      data[stride] = currentColor.r * 255
      data[stride + 1] = currentColor.g * 255
      data[stride + 2] = currentColor.b * 255
      data[stride + 3] = 255
      stride += 4
    }
  }
}

// ------------------------------------------------------------------------------------------------

export function createBiomeTexture(w: number, biomes: BiomeParameters[]): DataTextureWrapper {
  const data = new Uint8Array(w * w * 4)
  if (biomes.length > 0) {
    fillBiomes(data, w, biomes)
  }
  const dt = new DataTexture(data, w, w)
  dt.needsUpdate = true
  return { texture: dt, data }
}

export function recalculateBiomeTexture(data: Uint8Array, w: number, biomes: BiomeParameters[]): void {
  if (biomes.length === 0) {
    return
  }
  data.fill(0)
  fillBiomes(data, w, biomes)
}

function fillBiomes(data: Uint8Array, w: number, biomes: BiomeParameters[]) {
  let lineStride = 0
  let cellStride = (Math.ceil(biomes[0].humiMin * w) + (biomes[0].tempMin * w)) * 4
  for (let i = 0; i < biomes.length; i++) {
    const biome = biomes[i]
    const biomeRect: Rect = {
      x: Math.floor(biome.humiMin * w),
      y: Math.floor(biome.tempMin * w),
      w: Math.ceil((biome.humiMax - biome.humiMin) * w),
      h: Math.ceil((biome.tempMax - biome.tempMin) * w)
    }
    const totalPixels = biomeRect.w * biomeRect.h
    const maxBiomeX = (biomeRect.x + biomeRect.w) * 4

    // Pre-calculate smoothing data
    const biomeSmoothing = [biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness]
    const biomeOverlaps = findRectOverlaps(w, w, biomeRect)
    const biomeOpaqueZone: Rect = {
      x: biomeRect.x + biomeSmoothing[0] * (1 - biomeOverlaps[3]),
      y: biomeRect.y + biomeSmoothing[1] * (1 - biomeOverlaps[0]),
      w: biomeRect.w - biomeSmoothing[0] * (2 - biomeOverlaps[3]) * (1 - biomeOverlaps[1]),
      h: biomeRect.h - biomeSmoothing[1] * (2 - biomeOverlaps[0]) * (1 - biomeOverlaps[2]),
    }

    // Adjust strides depending on starting temp & humi
    cellStride = biomeRect.x * 4
    lineStride = biomeRect.y * w * 4

    // Calculate color
    const r = Math.floor(biome.color.r * 255.0)
    const g = Math.floor(biome.color.g * 255.0)
    const b = Math.floor(biome.color.b * 255.0)

    const pixelCoords = [biomeRect.x, biomeRect.y]
    for (let biomePx = 0; biomePx < totalPixels; biomePx++) {
      if (isWithinRect(biomeOpaqueZone, pixelCoords[0], pixelCoords[1])) {
        data[lineStride + cellStride] = r
        data[lineStride + cellStride + 1] = g
        data[lineStride + cellStride + 2] = b
        data[lineStride + cellStride + 3] = 255
      } else {
        data[lineStride + cellStride] = r
        data[lineStride + cellStride + 1] = g
        data[lineStride + cellStride + 2] = b
        data[lineStride + cellStride + 3] = 127
      }
      cellStride += 4
      pixelCoords[0]++

      if (cellStride >= maxBiomeX) {
        lineStride += w * 4
        cellStride = biomeRect.x * 4
        pixelCoords[0] = biomeRect.x
        pixelCoords[1]++
      }
    }
  }
}