import type { Node } from 'three/webgpu';
import { float, sin, fract, Fn, floor, mix, int, Loop } from 'three/tsl';

export const rand = /*@__PURE__*/ Fn(([i_n]: [Node<'float'>]) => {
  return fract(sin(i_n).mul(43758.5453123));
}).setLayout({
  name: 'LG_NOISE_rand',
  type: 'float',
  inputs: [{ name: 'n', type: 'float' }],
});

export const noise1 = /*@__PURE__*/ Fn(([i_p]: [Node<'vec3'>]) => {
  const fl = float(floor(i_p)).toVar();
  const fc = float(fract(i_p)).toVar();
  return mix(rand(fl), rand(fl.add(1)), fc);
}).setLayout({
  name: 'LG_NOISE_noise1',
  type: 'float',
  inputs: [{ name: 'p', type: 'float' }],
});

export const fbm1 = /*@__PURE__*/ Fn(([i_x, i_params]: [Node<'float'>, Node<'vec4'>]) => {
  const freq = float(i_params.x).toVar();
  const amp = float(i_params.y).toVar();
  const lac = float(i_params.z).toVar();
  const octaves = int(i_params.w).toVar();
  const x = float(i_x).toVar();
  const val = float(0).toVar();

  Loop({ start: int(0), end: octaves, condition: '<' }, () => {
    val.addAssign(amp.mul(noise1(x.mul(freq))));
    freq.mulAssign(lac);
    amp.mulAssign(0.5);
  });
  return val;
}).setLayout({
  name: 'LG_NOISE_fbm1',
  type: 'float',
  inputs: [
    { name: 'i_x', type: 'float' },
    { name: 'i_noise', type: 'vec4' },
  ],
});
