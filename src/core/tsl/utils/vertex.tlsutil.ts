import { vec4, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export function flattenUV(uv: ShaderNodeObject<Node>) {
  return vec4(uv.mul(2.0).sub(1.0), 0.5, 1.0)
}
