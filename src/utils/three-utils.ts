import type { BiomeParameters } from '@/core/models/biome-parameters.model'
import type { ColorRampStep } from '@/core/models/color-ramp.model'
import type { DataTextureWrapper } from '@/core/types'
import { DataTexture, type ShaderMaterial } from 'three'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { lerp } from 'three/src/math/MathUtils.js'

export function setShaderMaterialUniform(mat: CustomShaderMaterial | ShaderMaterial, uname: string, uvalue: any): void {
  mat.uniforms[uname] = { value: uvalue }
}

export function setShaderMaterialUniforms(mat: CustomShaderMaterial, unames: string[], uvalues: any[]): void {
  for (let i = 0; i < unames.length; i++) {
    mat.uniforms[unames[i]] = { value: uvalues[i] }
  }
}

export function create1DTexture(
  w: number, param: 'temp'|'humi', biomes: BiomeParameters[]
): DataTextureWrapper {
  const extractedSteps: ColorRampStep[] = extractAndSortSteps(w, param, biomes.slice(0))
  const data = calculate1DTextureData(w, extractedSteps)
  const dt = new DataTexture(data, w, 1)
  dt.needsUpdate = true
  return { texture: dt, data }
}
export function recalculate1DTexture(
  data: Uint8Array, w: number, param: 'temp'|'humi', biomes: BiomeParameters[]
): void {
  const extractedSteps: ColorRampStep[] = extractAndSortSteps(w, param, biomes.slice(0))
  recalculate1DTextureData(data, extractedSteps)
}

function extractAndSortSteps(
  w: number, param: 'temp'|'humi', biomes: BiomeParameters[]
): ColorRampStep[] {
  const biomesCopy = biomes.slice(0)
  const extractedSteps: ColorRampStep[] = []
  for (const b of biomesCopy) {
    const wMin = Math.floor((param === 'temp' ? b.tempMin: b.humiMin) * w)
    const wMax = Math.floor((param === 'temp' ? b.tempMax: b.humiMax) * w)
    for (const s of b.rgbaRamp.definedSteps) {
      const adjustedFactor = (s.factor * (wMax - wMin)) + wMin
      s.factor = Math.ceil(adjustedFactor)
      extractedSteps.push(s)
    }
  }
  extractedSteps.sort((a, b) => a.factor - b.factor)
  return extractedSteps
}

function calculate1DTextureData(w: number, steps: ColorRampStep[]): Uint8Array {
  const data = new Uint8Array(4 * w);
  let stride = 0;
  for (let s = 0; s < steps.length-1; s++) {
    const step = steps[s]
    const nextStep = steps[s+1]
    const stepIterations = Math.ceil((nextStep.factor) - (step.factor))
    for (let i = 0; i < stepIterations; i++) {
      const lerpFac = parseFloat((i/stepIterations).toFixed(4))
      const clerp = step.color.lerp(nextStep.color, lerpFac)
      const r = Math.floor(clerp.r * 255.0)
      const g = Math.floor(clerp.g * 255.0)
      const b = Math.floor(clerp.b * 255.0)
      const a = Math.floor(lerp(step.alpha, nextStep.alpha, lerpFac)* 255.0)

      data[ stride ] = r
      data[ stride + 1 ] = g
      data[ stride + 2 ] = b
      data[ stride + 3 ] = a
      stride += 4
    }
  }
  return data
}

function recalculate1DTextureData(data: Uint8Array, steps: ColorRampStep[]): Uint8Array {
  let stride = 0;
  for (let s = 0; s < steps.length-1; s++) {
    const step = steps[s]
    const nextStep = steps[s+1]
    const stepIterations = Math.ceil((nextStep.factor) - (step.factor))
    for (let i = 0; i < stepIterations; i++) {
      const lerpFac = parseFloat((i/stepIterations).toFixed(4))
      const clerp = step.color.lerp(nextStep.color, lerpFac)
      const r = Math.floor(clerp.r * 255.0)
      const g = Math.floor(clerp.g * 255.0)
      const b = Math.floor(clerp.b * 255.0)
      const a = Math.floor(lerp(step.alpha, nextStep.alpha, lerpFac)* 255.0)

      data[ stride ] = r
      data[ stride + 1 ] = g
      data[ stride + 2 ] = b
      data[ stride + 3 ] = a
      stride += 4
    }
  }
  return data
}


/* export function create2DBiomeTexture(w: number, biomes: BiomeParameters[]) {
  const data = new Uint8Array(4 * w * w)
  const biomeBounds = computeBiomeBounds(w, biomes)

  for (const brect of biomeBounds) {
    const bcolors = brect.colors.definedSteps
    for (let b = 0; b < bcolors.length-1; b++) {
      const step = bcolors[b]
      const nextStep = bcolors[b+1]
      const stepIterations = Math.ceil((nextStep.factor*w) - (step.factor*w))
  
      let stride = 0
      const cellCount = brect.w * brect.h
      for (let cell = 0; cell < cellCount; cell++) {
        const lerpFac = parseFloat((cell/cellCount).toFixed(4))
        const clerp = step.color.lerp(nextStep.color, lerpFac)
        const r = Math.floor(clerp.r * 255.0)
        const g = Math.floor(clerp.g * 255.0)
        const b = Math.floor(clerp.b * 255.0)
        const a = Math.floor(lerp(step.alpha, nextStep.alpha, lerpFac)* 255.0)
  
        data[ stride ] = r
        data[ stride + 1 ] = g
        data[ stride + 2 ] = b
        data[ stride + 3 ] = a
        stride += 4
  
        if (stride === bounds.w) {
          stride = 0
        }
      }
    }
  }
}

export function computeBiomeBounds(w: number, biomes: BiomeParameters[]): BiomeRect[] {
  const biomeBounds: BiomeRect[] = []
  for (const biome of biomes) {
    const bounds: BiomeRect = {
      colors: biome.rgbaRamp,
      x: Math.round(biome.tempMin * w),
      y: Math.round(biome.humiMin * w),
      w: Math.round((biome.tempMax * w) - (biome.tempMin * w)),
      h: Math.round((biome.humiMax * w) - (biome.humiMin * w)),
    }
    biomeBounds.push(bounds)
  }
  return biomeBounds
} */