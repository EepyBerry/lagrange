import type { Node } from 'three/webgpu';
import { vec4 } from 'three/tsl';

export function flattenUV(uv: Node<'vec2'>) {
  return vec4(uv.mul(2).sub(1), 0, 1);
}
