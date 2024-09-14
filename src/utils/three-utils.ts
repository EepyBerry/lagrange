import { type ShaderMaterial } from 'three'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'

export function setShaderMaterialUniform(mat: CustomShaderMaterial | ShaderMaterial, uname: string, uvalue: any): void {
  mat.uniforms[uname] = { value: uvalue }
}

export function setShaderMaterialUniforms(mat: CustomShaderMaterial, unames: string[], uvalues: any[]): void {
  for (let i = 0; i < unames.length; i++) {
    mat.uniforms[unames[i]] = { value: uvalues[i] }
  }
}