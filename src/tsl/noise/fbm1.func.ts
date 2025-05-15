import { float, sin, fract, Fn, floor, mix, int, Loop } from 'three/tsl'
import type { UniformNumberNode, UniformVector3Node, UniformVector4Node } from '../types'
import type { VaryingNode } from 'three/webgpu';

export const rand = /*@__PURE__*/ Fn(([n_immutable]: [UniformNumberNode]) => {
  const n = float(n_immutable).toVar()
  return fract(sin(n).mul(43758.5453123))
});

export const noise1 = /*@__PURE__*/ Fn(([p_immutable]: [UniformVector3Node]) => {
  const p = float(p_immutable).toVar()
  const fl = float(floor(p)).toVar()
  const fc = float(fract(p)).toVar()
  return mix(rand(fl), rand(fl.add(1.0)), fc)
});

export const fbm1 = /*@__PURE__*/ Fn(([i_x, i_params]: [VaryingNode, UniformVector4Node]) => {
    const freq = float(i_params.x).toVar()
    const amp = float(i_params.y).toVar()
    const lac = float(i_params.z).toVar()
    const octaves = int(i_params.w).toVar()
    const x = float(i_x).toVar()
    const val = float(0.0).toVar()

    Loop({ start: int(0), end: octaves, condition: '<' }, () => {
      val.addAssign(amp.mul(noise1(x.mul(freq))))
      freq.mulAssign(lac)
      amp.mulAssign(0.5)
    })
    return val
});
