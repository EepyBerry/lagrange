import { float, floor, Fn, fract, int, Loop, mul, sub, vec2, vec3, vec4 } from 'three/tsl'

// X mod 289 operation, float style
export const mod289f = /*#__PURE__*/ Fn(([i_value]: unknown[]) => {
  const x = float(i_value).toVar()
  return x.sub(floor(x.mul(1.0 / 289.0)).mul(289.0))
}).setLayout({
  name: 'mod289f',
  type: 'float',
  inputs: [{ name: 'x', type: 'float' }],
})

// X mod 289 operation, vec4 style
export const mod289v = /*#__PURE__*/ Fn(([i_vec]: unknown[]) => {
  const x = vec4(i_vec).toVar()
  return x.sub(floor(x.mul(1.0 / 289.0)).mul(289.0))
}).setLayout({
  name: 'mod289v',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }],
})

//export const mod289 = overloadingFn([mod289f, mod289v]);

// Permutation function
export const perm = /*#__PURE__*/ Fn(([i_vec]: unknown[]) => {
  const x = vec4(i_vec).toVar()
  return mod289v(x.mul(34.0).add(1.0).mul(x))
}).setLayout({
  name: 'perm',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }],
})

// 3D fractal Brownian motion - noise function
export const noise3 = /*#__PURE__*/ Fn(([i_point]: unknown[]) => {
  const p = vec3(i_point).toVar()
  const a = vec3(floor(p)).toVar()
  const d = vec3(p.sub(a)).toVar()
  d.assign(d.mul(d).mul(sub(3.0, mul(2.0, d))))

  const b = vec4(a.xxyy.add(vec4(0.0, 1.0, 0.0, 1.0))).toVar()
  const k1 = vec4(perm(b.xyxy)).toVar()
  const k2 = vec4(perm(k1.xyxy.add(b.zzww))).toVar()

  const c = vec4(k2.add(a.zzzz)).toVar()
  const k3 = vec4(perm(c)).toVar()
  const k4 = vec4(perm(c.add(1.0))).toVar()

  const o1 = vec4(fract(k3.mul(1.0 / 41.0))).toVar()
  const o2 = vec4(fract(k4.mul(1.0 / 41.0))).toVar()
  const o3 = vec4(o2.mul(d.z).add(o1.mul(sub(1.0, d.z)))).toVar()
  const o4 = vec2(o3.yw.mul(d.x).add(o3.xz.mul(sub(1.0, d.x)))).toVar()

  return o4.y.mul(d.y).add(o4.x.mul(sub(1.0, d.y)))
}).setLayout({
  name: 'noise3',
  type: 'float',
  inputs: [{ name: 'p', type: 'vec3' }],
})

export const fbm3 = /*#__PURE__*/ Fn(
  ([i_x, i_frequency, i_amplitude, i_lacunarity, i_octaves]: unknown[]) => {
    const octaves = int(i_octaves).toVar()
    const lac = float(i_lacunarity).toVar()
    const amp = float(i_amplitude).toVar()
    const freq = float(i_frequency).toVar()
    const x = vec3(i_x).toVar()
    const val = float(0.0).toVar()
    Loop({ start: int(0), end: octaves, condition: '' }, () => {
      val.addAssign(amp.mul(noise3(x.mul(freq))))
      freq.mulAssign(lac)
      amp.mulAssign(0.5)
    })
    return val
  },
).setLayout({
  name: 'fbm3',
  type: 'float',
  inputs: [
    { name: 'x', type: 'vec3' },
    { name: 'freq', type: 'float' },
    { name: 'amp', type: 'float' },
    { name: 'lac', type: 'float' },
    { name: 'octaves', type: 'int' },
  ],
})
