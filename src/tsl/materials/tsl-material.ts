import type { NodeMaterial } from "three/webgpu"

export interface TSLMaterial<MatType extends NodeMaterial, DataType extends object, UniformType extends object> {
  uniforms: UniformType
  buildMaterial(): MatType
}