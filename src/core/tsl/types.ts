import type { ShaderNodeObject } from 'three/tsl'
import type { Color, Matrix3, NodeMaterial, UniformNode, Vector2, Vector3, Vector4 } from 'three/webgpu'

export type UniformNodeMaterial<M extends NodeMaterial, U> = {
  material: M
  uniforms: U
}

// Convenience type declarations, to avoid repeating stuff
export type UniformBooleanNode = ShaderNodeObject<UniformNode<boolean>>
export type UniformNumberNode = ShaderNodeObject<UniformNode<number>>
export type UniformVector2Node = ShaderNodeObject<UniformNode<Vector2>>
export type UniformVector3Node = ShaderNodeObject<UniformNode<Vector3>>
export type UniformVector4Node = ShaderNodeObject<UniformNode<Vector4>>
export type UniformMatrix3Node = ShaderNodeObject<UniformNode<Matrix3>>
export type UniformColorNode = ShaderNodeObject<UniformNode<Color>>

// Ditto, for DataType declarations
export type WarpingData = {
  layers: number
  warpFactor: Vector3
}
export type DisplacementData = {
  factor: number
  epsilon: number
  multiplier: number
}
export type NoiseData = {
  frequency: number
  amplitude: number
  lacunarity: number
  octaves: number
}