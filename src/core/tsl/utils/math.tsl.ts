import type { Node } from 'three/webgpu';
import { div, exp, float, floor, Fn, int, negate, pow } from 'three/tsl';

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
  name: 'LG_MATH_mod289v4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});

// Permutation function, vec4 style
export const perm4 = /*@__PURE__*/ Fn(([i_vec]: [Node<'vec4'>]) => {
  return mod289v4(i_vec.mul(34).add(1).mul(i_vec));
}).setLayout({
  name: 'LG_MATH_perm4',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
});

// Weibull stretched exponential function
export const stretchedExp = /*@__PURE__*/ Fn(([i_x, i_a, i_b]: Node<'float'>[]) => {
  const exponent = negate(pow(div(i_x, i_a), i_b));
  return float(1).sub(exp(exponent));
}).setLayout({
  name: 'LG_MATH_sigmoid',
  type: 'float',
  inputs: [
    { name: 'i_x', type: 'float' },
    { name: 'i_a', type: 'float' },
    { name: 'i_b', type: 'float' },
  ],
});
