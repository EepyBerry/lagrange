import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { BiomeRect, DataTextureWrapper } from '@/core/types'
import { DataTexture, type ShaderMaterial } from 'three'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'

export function setShaderMaterialUniform(mat: CustomShaderMaterial | ShaderMaterial, uname: string, uvalue: any): void {
  mat.uniforms[uname] = { value: uvalue }
}

export function setShaderMaterialUniforms(mat: CustomShaderMaterial, unames: string[], uvalues: any[]): void {
  for (let i = 0; i < unames.length; i++) {
    mat.uniforms[unames[i]] = { value: uvalues[i] }
  }
}

export function createBiomeTexture(w: number, biomes: BiomeParameters[]): DataTextureWrapper {
  const data = calculateBiomeTexture(w, biomes)
  const dt = new DataTexture(data, w, w)
  dt.needsUpdate = true
  return { texture: dt, data }
}

export function calculateBiomeTexture(w: number, biomes: BiomeParameters[]): Uint8Array {
  const data = new Uint8Array(w * w * 4)
  if (biomes.length === 0) {
    return data
  }

  fillBiomes(data, w, biomes)
  return data
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
    const biomeRect: BiomeRect = {
      x: Math.ceil(biome.humiMin * w),
      y: Math.ceil(biome.tempMin * w),
      w: Math.ceil((biome.humiMax - biome.humiMin) * w),
      h: Math.ceil((biome.tempMax - biome.tempMin) * w)
    }
    const totalPixels = biomeRect.w * biomeRect.h
    const maxBiomeX = (biomeRect.x + biomeRect.w) * 4

    // Adjust strides depending on starting temp & humi
    cellStride = biomeRect.x * 4
    lineStride = biomeRect.y * w * 4

    // Calculate color
    const r = Math.floor(biome.color.r * 255.0)
    const g = Math.floor(biome.color.g * 255.0)
    const b = Math.floor(biome.color.b * 255.0)

    for (let biomePx = 0; biomePx < totalPixels; biomePx++) {
      data[lineStride + cellStride] = r
      data[lineStride + cellStride + 1] = g
      data[lineStride + cellStride + 2] = b
      data[lineStride + cellStride + 3] = 255
      cellStride += 4

      if (cellStride >= maxBiomeX) {
        lineStride += w * 4
        cellStride = biomeRect.x * 4
      }
    }
  }
}

function overwriteBiome(data: Uint8Array, w: number, oldValues: BiomeParameters, newValues: BiomeParameters) {

}