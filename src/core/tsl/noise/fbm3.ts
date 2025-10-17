import { float, floor, Fn, fract, int, Loop, mul, sub, vec2, vec3, vec4 } from 'three/tsl'
import type { VaryingNode } from 'three/webgpu'
import type { UniformNumberNode, UniformVector3Node, UniformVector4Node } from '../tsl-types'

// X mod 289 operation, float style
export const mod289f = /*@__PURE__*/ Fn(([i_value]: [UniformNumberNode]) => {
  return i_value.sub(floor(i_value.mul(1.0 / 289.0)).mul(289.0))
}).setLayout({
  name: 'LG_NOISE_mod289f',
  type: 'float',
  inputs: [{ name: 'i_value', type: 'float' }],
})

// X mod 289 operation, vec4 style
export const mod289v = /*@__PURE__*/ Fn(([i_vec]: [UniformVector3Node]) => {
  return i_vec.sub(floor(i_vec.mul(1.0 / 289.0)).mul(289.0))
}).setLayout({
  name: 'LG_NOISE_mod289v',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
})

// Permutation function
export const perm = /*@__PURE__*/ Fn(([i_vec]: [UniformVector3Node]) => {
  return mod289v(i_vec.mul(34.0).add(1.0).mul(i_vec))
}).setLayout({
  name: 'LG_NOISE_perm',
  type: 'vec4',
  inputs: [{ name: 'i_vec', type: 'vec4' }],
})

// 3D fractal Brownian motion - noise function
export const noise3 = /*@__PURE__*/ Fn(([i_point]: [UniformVector3Node]) => {
  const p = vec3(i_point).toVar('p')
  const a = vec3(floor(p)).toVar('a')
  const d = vec3(p.sub(a)).toVar('d')
  d.assign(d.mul(d).mul(sub(3.0, mul(2.0, d))))

  const b = vec4(a.xxyy.add(vec4(0.0, 1.0, 0.0, 1.0))).toVar('b')
  const k1 = vec4(perm(b.xyxy)).toVar('k1')
  const k2 = vec4(perm(k1.xyxy.add(b.zzww))).toVar('k2')

  const c = vec4(k2.add(a.zzzz)).toVar('c')
  const k3 = vec4(perm(c)).toVar('k3')
  const k4 = vec4(perm(c.add(1.0))).toVar('k4')

  const o1 = vec4(fract(k3.mul(1.0 / 41.0))).toVar('o1')
  const o2 = vec4(fract(k4.mul(1.0 / 41.0))).toVar('o2')
  const o3 = vec4(o2.mul(d.z).add(o1.mul(sub(1.0, d.z)))).toVar('o3')
  const o4 = vec2(o3.yw.mul(d.x).add(o3.xz.mul(sub(1.0, d.x)))).toVar('o4')

  return o4.y.mul(d.y).add(o4.x.mul(sub(1.0, d.y)))
}).setLayout({
  name: 'LG_NOISE_noise3',
  type: 'float',
  inputs: [{ name: 'i_point', type: 'vec3' }],
})

export const fbm3 = /*@__PURE__*/ Fn(([i_point, i_noise]: [VaryingNode, UniformVector4Node]) => {
  const freq = float(i_noise.x).toVar('freq')
  const amp = float(i_noise.y).toVar('amp')
  const lac = float(i_noise.z).toVar('lac')
  const octaves = float(i_noise.w).toInt().toVar('octaves')
  const point = vec3(i_point).toVar('x')
  const val = float(0.0).toVar('val')
  Loop({ start: int(0), end: octaves, condition: '<' }, () => {
    val.addAssign(amp.mul(noise3(point.mul(freq))))
    freq.mulAssign(lac)
    amp.mulAssign(0.5)
  })
  return val
}).setLayout({
  name: 'LG_NOISE_fbm3',
  type: 'float',
  inputs: [
    { name: 'i_point', type: 'vec3' },
    { name: 'i_noise', type: 'vec4' },
  ],
})
