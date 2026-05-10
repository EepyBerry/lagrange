import type { Node } from 'three/webgpu';
import { floor, Fn, int } from 'three/tsl';

export function getMatrixElement(matrix: Node<'mat2' | 'mat3' | 'mat4'>, x: number, y: number): Node<'float'> {
  return matrix.element(int(x)).element(int(y)) as Node<'float'>;
}

// Modulo 7 without a division
export const mod7 = /*@__PURE__*/ Fn(
  ([i_value]: [Node<'vec3'>]) => {
    return i_value.sub(floor(i_value.mul(1 / 7)).mul(7));
  },
  { i_value: 'vec3', return: 'vec3' },
).setLayout({
  name: 'LG_NOISE_mod7',
  type: 'vec3',
  inputs: [{ name: 'i_value', type: 'vec3' }],
});

// X mod 289 operation, float style
export const mod289f = /*@__PURE__*/ Fn(([i_value]: [Node<'float'>]) => {
  return i_value.sub(floor(i_value.mul(1 / 289)).mul(289));
}).setLayout({
  name: 'LG_NOISE_mod289f',
  type: 'float',
  inputs: [{ name: 'i_value', type: 'float' }],
});

// X mod 289 operation, vec3 style
export const mod289v3 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec3'>]) => {
  return i_vec.sub(floor(i_vec.mul(1 / 289)).mul(289));
}).setLayout({
  name: 'LG_NOISE_mod289v3',
  type: 'vec3',
  inputs: [{ name: 'i_vec', type: 'vec3' }],
});

// X mod 289 operation, vec4 style
export const mod289v4 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec4'>]) => {
  return i_vec.sub(floor(i_vec.mul(1 / 289)).mul(289));
}).setLayout({
  name: 'LG_NOISE_mod289v4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});

// Permutation function, vec3 style
export const perm3 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec3'>]) => {
  return mod289v3(i_vec.mul(34).add(1).mul(i_vec));
}).setLayout({
  name: 'LG_NOISE_perm3',
  type: 'vec3',
  inputs: [{ name: 'i_vec', type: 'vec3' }],
});

// Permutation function, vec4 style
export const perm4 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec4'>]) => {
  return mod289v4(i_vec.mul(34).add(1).mul(i_vec));
}).setLayout({
  name: 'LG_NOISE_perm4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});

// Shortest distance between three vectors
export const dist = /*@__PURE__*/ Fn(
  ([x, y, z]: Node<'vec3'>[]) => {
    return x.mul(x).add(y.mul(y)).add(z.mul(z));
  },
  { x: 'vec3', y: 'vec3', z: 'vec3', return: 'vec3' },
).setLayout({
  name: 'LG_NOISE_dist',
  type: 'vec3',
  inputs: [
    { name: 'x', type: 'vec3' },
    { name: 'y', type: 'vec3' },
    { name: 'z', type: 'vec3' },
  ],
});
