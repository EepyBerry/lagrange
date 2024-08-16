import type {  ColorRampStep } from '@/core/models/color-ramp.model'
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

export function create1DColorTexture(w: number, steps: ColorRampStep[]): DataTexture {
  const data = new Uint8Array(4 * w);

  let stride = 0;
  for (let s = 0; s < steps.length-1; s++) {
    const step = steps[s]
    const nextStep = steps[s+1]
    const stepIterations = Math.ceil((nextStep.factor*w) - (step.factor*w))

    for (let i = 0.0; i < stepIterations; i++) {
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
  const dt = new DataTexture(data, w, 1)
  dt.needsUpdate = true
  return dt
}