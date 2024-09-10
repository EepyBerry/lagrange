import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { Rect, DataTextureWrapper, Point } from '@/core/types'
import { avg, findMinDistanceToRect, findRectOverlaps, truncateTo, mixHexColors } from '@/utils/math-utils'
import { Color, DataTexture } from 'three'
import type { ColorRampStep } from '../models/color-ramp.model'
import { clamp } from 'three/src/math/MathUtils.js'
import { Colord, colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import { numberToHex } from '@/utils/utils'

extend([mixPlugin]);

export function createRampTexture(w: number, steps: ColorRampStep[]): DataTextureWrapper {
  const data = new Uint8Array(w * 4)
  if (steps.length > 0) {
    fillRamp(data, w, steps)
  }
  const dt = new DataTexture(data, w, 1)
  dt.needsUpdate = true
  return { texture: dt, data }
}

export function recalculateRampTexture(data: Uint8Array, w: number, steps: ColorRampStep[]): void {
  if (steps.length === 0) {
    return
  }
  data.fill(0)
  fillRamp(data, w, steps)
}

function fillRamp(data: Uint8Array, w: number, steps: ColorRampStep[]) {
  let stride = 0
  let currentStep, nextStep
  for (let i = 0; i < steps.length-1; i++) {
    currentStep = steps[i].clone()
    nextStep = steps[i+1].clone()

    const currentStepX = truncateTo(currentStep.factor * w, 1e4)
    const nextStepX = truncateTo(nextStep.factor * w, 1e4)
    const totalPixels = Math.ceil(nextStepX - currentStepX)

    const lerpColor = new Color(0x0)
    for (let px = 0; px < totalPixels; px++) {
      lerpColor.lerpColors(currentStep.color, nextStep.color, truncateTo(px/totalPixels, 1e4))
      data[stride] = Math.floor(lerpColor.r * 255.0)
      data[stride + 1] = Math.floor(lerpColor.g * 255.0)
      data[stride + 2] = Math.floor(lerpColor.b * 255.0)
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
    const biomeAvgSmoothness = avg(...[biomeRect.w * biome.smoothness, biomeRect.h * biome.smoothness])
    const biomeOverlaps = findRectOverlaps(w, w, biomeRect)

    // Adjust strides depending on starting temp & humi
    cellStride = biomeRect.x * 4
    lineStride = biomeRect.y * w * 4

    // Calculate color
    const r = Math.floor(biome.color.r * 255.0)
    const g = Math.floor(biome.color.g * 255.0)
    const b = Math.floor(biome.color.b * 255.0)
    let a = 1.0

    // Iterate through every single pixel inside the biome rect
    const pixelCoords: Point = { x: biomeRect.x, y: biomeRect.y }
    const biomeColor: Colord = colord({ r, g, b, a })
    const pixelColor: Colord = colord('#000000')

    // let mixedColor: RawRGBA = { r: 0, g: 0, b: 0, a: 0 }
    let rectDistance: number, dataIdx: number, mixedColorHex: number // , totalAlpha: number
    for (let biomePx = 0; biomePx < totalPixels; biomePx++) {     
      dataIdx = lineStride + cellStride
      pixelColor.rgba.r = data[dataIdx]
      pixelColor.rgba.g = data[dataIdx + 1]
      pixelColor.rgba.b = data[dataIdx + 2]
      pixelColor.rgba.a = data[dataIdx + 3]

      rectDistance = findMinDistanceToRect(biomeRect, pixelCoords.x, pixelCoords.y, biomeOverlaps)
      a = truncateTo(clamp(rectDistance/biomeAvgSmoothness, 0, 1), 1e4)
      // totalAlpha = clamp(pixelRGBA.a + a, 0, 1)

      /* if(totalAlpha === 1) {
        data[dataIdx] = lerp(pixelRGBA.r, r, Math.max(pixelRGBA.a, a))
        data[dataIdx + 1] = lerp(pixelRGBA.g, g, Math.max(pixelRGBA.a, a))
        data[dataIdx + 2] = lerp(pixelRGBA.b, b, Math.max(pixelRGBA.a, a))
        data[dataIdx + 3] = 255
      }
      else  */
      if (data[dataIdx + 3] > 0) {
        /* mixedColorHex = mixHexColors(Number(pixelColor.toHex().slice(1)), Number(biomeColor.toHex().slice(1)))
        console.log(numberToHex(mixedColorHex))
        data[dataIdx + 3] = clamp(data[dataIdx + 3]+(a*255.0), 0, 255) */
      } else {
        data[dataIdx] = r
        data[dataIdx + 1] = g
        data[dataIdx + 2] = b
        data[dataIdx + 3] = a * 255.0
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