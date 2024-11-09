import type { LensFlareEffect } from '@/core/three/lens-flare.effect'
import { Mesh, type ShaderMaterial } from 'three'
import type CustomShaderMaterial from 'three-custom-shader-material/vanilla'

type MeshOrLensFlare = Mesh | LensFlareEffect
type MeshMaterial = CustomShaderMaterial | ShaderMaterial

// ------------------------------------------------------------------------------------------------

export function getMeshShaderMaterial(mesh: MeshOrLensFlare) {
  return mesh.material as ShaderMaterial
}

export function getMeshUniform(mesh: MeshOrLensFlare, uname: string) {
  return (mesh.material as MeshMaterial).uniforms[uname].value
}

export function patchMeshUniform(mesh: MeshOrLensFlare, uname: string, uvalue: object): void {
  const mat = mesh.material as MeshMaterial
  mat.uniforms[uname] = { value: { ...getMeshUniform(mesh, uname), ...uvalue } }
  mat.needsUpdate = true
}

export function setMeshUniform(mesh: MeshOrLensFlare, uname: string, uvalue: any): void {
  const mat = mesh.material as MeshMaterial
  mat.uniforms[uname] = { value: uvalue }
  mat.needsUpdate = true
}

export function setMeshUniforms(mesh: MeshOrLensFlare, unames: string[], uvalues: any[]): void {
  const mat = mesh.material as MeshMaterial
  for (let i = 0; i < unames.length; i++) {
    mat.uniforms[unames[i]] = { value: uvalues[i] }
  }
  mat.needsUpdate = true
}
