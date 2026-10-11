import { dot, Fn, fract, sin, vec3 } from 'three/tsl';
import { Node } from 'three/webgpu';

export const hash3 = /*@__PURE__*/ Fn(([i_v]: [Node<'ivec3'>]) => {
  const n = vec3(sin(dot(i_v.toVec3(), vec3(127.1, 311.7, 74.7)))).toVar('n');
  return fract(vec3(269.5, 183.3, 246.1).mul(n));
}).setLayout({
  name: 'LG_HASH_hash3',
  type: 'vec3',
  inputs: [{ name: 'i_vec', type: 'ivec3' }],
});
