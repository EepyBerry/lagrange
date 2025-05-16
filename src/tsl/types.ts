import type { ShaderNodeObject } from 'three/tsl'
import type { NodeMaterial, UniformNode, Vector2, Vector3, Vector4 } from 'three/webgpu'

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
