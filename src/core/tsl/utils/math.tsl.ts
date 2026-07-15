import type { Node } from 'three/webgpu';
import { floor, Fn, int } from 'three/tsl';

export function getMatrixElement(matrix: Node<'mat2' | 'mat3' | 'mat4'>, x: number, y: number): Node<'float'> {
  // @ts-expect-error borked types
  return matrix.element(int(x)).element(int(y)) as Node<'float'>;
}

export function clampToRange(v: Node<'float'>, min: Node<'float'>, max: Node<'float'>): Node<'float'> {
  return v.sub(min).div(max.sub(min));
}

// X mod 289 operation, vec4 style
export const mod289v4 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec4'>]) => {
  return i_vec.sub(floor(i_vec.mul(1 / 289)).mul(289));
}).setLayout({
  name: 'LG_NOISE_mod289v4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});

// Permutation function, vec4 style
export const perm4 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec4'>]) => {
  return mod289v4(i_vec.mul(34).add(1).mul(i_vec));
}).setLayout({
  name: 'LG_NOISE_perm4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});
