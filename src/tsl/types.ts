import type { NodeMaterial } from "three/webgpu"

export type UniformNodeMaterial<M extends NodeMaterial, U> = {
  material: M
  uniforms: U
}