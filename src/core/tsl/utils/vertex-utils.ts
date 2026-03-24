import { vec4 } from 'three/tsl';
import type { Node } from 'three/webgpu';

export function flattenUV(uv: Node<'vec2'>) {
  return vec4(uv.mul(2.0).sub(1.0), 0.0, 1.0);
}
