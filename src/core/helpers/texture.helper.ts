import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { Rect, DataTextureWrapper, Coordinates2D, RawRGBA } from '@/core/types'
import { alphaBlendColors, avg, findMinDistanceToRect, findRectOverlaps, truncateTo } from '@/utils/math-utils'
import { Color, DataTexture, FramebufferTexture, LinearDisplayP3ColorSpace, LinearSRGBColorSpace, Mesh, RGBAFormat, Scene, SRGBColorSpace, Texture, WebGLRenderer, WebGLRenderTarget } from 'three'
import type { ColorRampStep } from '../models/color-ramp.model'
import { clamp, lerp } from 'three/src/math/MathUtils.js'
import { INT8_TO_UNIT_MUL } from '../globals'
import { toRawRGBA } from '@/utils/utils'
import { getTextureAsDataUrl, ShaderBaker, type BakeOptions } from 'three-shader-baker'
import type { SceneElements } from '../models/scene-elements.model'
import { render } from 'vue'

const SHADER_BAKER = new ShaderBaker()

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
    let lerpAlpha = currentStep.alpha
    for (let px = 0; px < totalPixels; px++) {
      lerpColor.lerpColors(currentStep.color, nextStep.color, truncateTo(px / totalPixels, 1e4))
      lerpAlpha = lerp(currentStep.alpha, nextStep.alpha, truncateTo(px / totalPixels, 1e4))
      _writeToBuffer(buffer, stride, toRawRGBA(lerpColor, lerpAlpha), 255.0)
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
      _writeToRawRGBA(pixelRGBA, buffer, bufferIdx, INT8_TO_UNIT_MUL)

      rectDistance = findMinDistanceToRect(biomeRect, pixelCoords.x, pixelCoords.y, biomeOverlaps)
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

// ------------------------------------------------------------------------------------------------

/**
 * bakes a model's ShaderMaterial into a texture, using a framebuffer & target
 * texture to properly detach it from the initial WebGLRenderTarget
 * @param framebufferTexture framebuffer, will be overwritten
 * @param targetTexture target texture, will be overwritten
 * @param renderer renderer
 * @param mesh mesh
 * @param parameters baking parameters
 * @returns 
 */
export function bakeTexture(
  renderer: WebGLRenderer,
  mesh: Mesh,
  buffer: Uint8Array,
  size: number
): DataTexture {
  buffer.fill(0)
  const bakedRenderTarget = SHADER_BAKER.bake(renderer, mesh, { size });
  renderer.outputColorSpace = LinearSRGBColorSpace
  renderer.readRenderTargetPixels(bakedRenderTarget, 0, 0, size, size, buffer)
  const tex = new DataTexture(buffer, size, size, RGBAFormat)
  tex.colorSpace = LinearDisplayP3ColorSpace
  return tex
}
