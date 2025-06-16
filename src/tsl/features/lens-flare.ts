import {
  float,
  sin,
  fract,
  Fn,
  floor,
  mix,
  vec3,
  vec4,
  abs,
  clamp,
  vec2,
  cos,
  int,
  mul,
  distance,
  exp,
  div,
  sub,
  pow,
  atan,
  length,
  add,
  max,
  smoothstep,
} from 'three/tsl'
import type { UniformNumberNode, UniformVector2Node, UniformVector3Node } from '../types'

export const rand = /*@__PURE__*/ Fn(([i_n]: [UniformNumberNode]) => {
  return fract(sin(i_n).mul(43758.5453123))
}).setLayout({
  name: 'rand',
  type: 'float',
  inputs: [{ name: 'n', type: 'float' }],
})

export const noise = /*@__PURE__*/ Fn(([i_p]: [UniformNumberNode]) => {
  const fl = float(floor(i_p)).toVar()
  const fc = float(fract(i_p)).toVar()
  return mix(rand(fl), rand(fl.add(1.0)), fc)
}).setLayout({
  name: 'noise',
  type: 'float',
  inputs: [{ name: 'p', type: 'float' }],
})

export const hsv2rgb = /*@__PURE__*/ Fn(([i_c]: [UniformVector3Node]) => {
  const k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0).toVar()
  const p = vec3(abs(fract(i_c.xxx.add(k.xyz)).mul(6.0).sub(k.www))).toVar()
  return i_c.z.mul(mix(k.xxx, clamp(p.sub(k.xxx), 0.0, 1.0), i_c.y))
}).setLayout({
  name: 'hsv2rgb',
  type: 'vec3',
  inputs: [{ name: 'c', type: 'vec3' }],
})

export const saturate2 = /*@__PURE__*/ Fn(([i_x]: [UniformNumberNode]) => {
  return clamp(i_x, 0, 1)
}).setLayout({
  name: 'saturate2',
  type: 'float',
  inputs: [{ name: 'x', type: 'float' }],
})

export const rotateUV = /*@__PURE__*/ Fn(([i_uv, i_rotation]: [UniformVector2Node, UniformVector3Node]) => {
  return vec2(
    cos(i_rotation).mul(i_uv.x).add(sin(i_rotation).mul(i_uv.y)),
    cos(i_rotation).mul(i_uv.y).sub(sin(i_rotation).mul(i_uv.x)),
  )
}).setLayout({
  name: 'rotateUV',
  type: 'vec2',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'rotation', type: 'float' },
  ],
})

export const drawflare = /*@__PURE__*/ Fn(
  ([i_p, i_intensity, i_rand]: [UniformVector3Node, UniformNumberNode, UniformNumberNode]) => {
    const lingrad = float(distance(vec2(0), i_p)).toVar()
    const expgrad = float(div(1, exp(lingrad.mul(fract(i_rand).mul(0.66).add(0.33))))).toVar()
    const blades = float(length(i_p.mul(flareShape).mul(sin(starPoints.mul(atan(i_p.x, i_p.y)))))).toVar()
    const comp = float(pow(sub(1, saturate2(blades)), 24)).toVar()
    comp.addAssign(saturate2(expgrad.sub(0.9)).mul(3))
    comp.assign(pow(comp.mul(expgrad), add(8, sub(1, i_intensity).mul(5))))
    return vec3(comp).mul(flareSize).mul(15)
  },
).setLayout({
  name: 'drawflare',
  type: 'vec3',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'intensity', type: 'float' },
    { name: 'rand', type: 'float' },
  ],
})

export const dist = /*@__PURE__*/ Fn(([i_a, i_b]: UniformVector3Node[]) => {
  return abs(i_a.x.sub(i_b.x))
    .add(abs(i_a.y.sub(i_b.y)))
    .add(abs(i_a.z.sub(i_b.z)))
}).setLayout({
  name: 'dist',
  type: 'float',
  inputs: [
    { name: 'a', type: 'vec3' },
    { name: 'b', type: 'vec3' },
  ],
})

export const glare = /*@__PURE__*/ Fn(
  ([i_uv, i_pos, i_size]: [UniformVector2Node, UniformVector2Node, UniformNumberNode]) => {
    const main = vec2(i_uv.sub(i_pos)).toVar()
    const ang = float(atan(main.y, main.x).mul(starPoints)).toVar()
    const dist = float(length(main)).toVar()
    dist.assign(pow(dist, 0.9))
    const f0 = float(
      div(
        1.0,
        length(i_uv.sub(i_pos))
          .mul(div(1.0, i_size.mul(16.0)))
          .add(0.2),
      ),
    ).toVar()

    return f0.add(f0.mul(sin(ang).mul(0.2).add(0.3)))
  },
).setLayout({
  name: 'glare',
  type: 'float',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'pos', type: 'vec2' },
    { name: 'size', type: 'float' },
  ],
})

export const lensFlare = /*@__PURE__*/ Fn(([uv_immutable, pos_immutable]) => {
  const pos = vec2(pos_immutable).toVar()
  const uv = vec2(uv_immutable).toVar()
  const main = vec2(uv.sub(pos)).toVar()
  const uvd = vec2(uv.mul(length(uv))).toVar()
  const ang = float(atan(main.x, main.y)).toVar()
  const f0 = float(div(0.3, length(uv.sub(pos)).mul(16.0).add(1.0))).toVar()
  f0.assign(f0.mul(sin(noise(sin(ang.mul(3.9).mul(0.3)).mul(starPoints))).mul(0.2)))
  const f1 = float(max(sub(0.01, pow(length(uv.add(mul(1.2, pos))), 1.9)), 0.0).mul(7.0)).toVar()
  const f2 = float(
    max(div(0.9, add(10.0, mul(32.0, pow(length(uvd.add(mul(0.99, pos))), 2.0)))), 0.0).mul(0.35),
  ).toVar()
  const f22 = float(
    max(div(0.9, add(11.0, mul(32.0, pow(length(uvd.add(mul(0.85, pos))), 2.0)))), 0.0).mul(0.23),
  ).toVar()
  const f23 = float(
    max(div(0.9, add(12.0, mul(32.0, pow(length(uvd.add(mul(0.95, pos))), 2.0)))), 0.0).mul(0.6),
  ).toVar()
  const uvx = vec2(mix(uv, uvd, 0.1)).toVar()
  const f4 = float(max(sub(0.01, pow(length(uvx.add(mul(0.4, pos))), 2.9)), 0.0).mul(4.02)).toVar()
  const f42 = float(max(sub(0.0, pow(length(uvx.add(mul(0.45, pos))), 2.9)), 0.0).mul(4.1)).toVar()
  const f43 = float(max(sub(0.01, pow(length(uvx.add(mul(0.5, pos))), 2.9)), 0.0).mul(4.6)).toVar()
  uvx.assign(mix(uv, uvd, float(-0.4)))
  const f5 = float(max(sub(0.01, pow(length(uvx.add(mul(0.1, pos))), 5.5)), 0.0).mul(2.0)).toVar()
  const f52 = float(max(sub(0.01, pow(length(uvx.add(mul(0.2, pos))), 5.5)), 0.0).mul(2.0)).toVar()
  const f53 = float(max(sub(0.01, pow(length(uvx.add(mul(0.1, pos))), 5.5)), 0.0).mul(2.0)).toVar()
  uvx.assign(mix(uv, uvd, 2.1))
  const f6 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.3, pos))), 1.61)), 0.0).mul(3.159)).toVar()
  const f62 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.325, pos))), 1.614)), 0.0).mul(3.14)).toVar()
  const f63 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.389, pos))), 1.623)), 0.0).mul(3.12)).toVar()
  const c = vec3(glare(uv, pos, glareSize)).toVar()
  const prot = vec2(uv.sub(pos)).toVar()
  c.addAssign(drawflare(prot, flareSize, 0.1, int(1)))
  c.r.addAssign(f1.add(f2).add(f4).add(f5).add(f6).mul(glareIntensity))
  c.g.addAssign(f1.add(f22).add(f42).add(f52).add(f62).mul(glareIntensity))
  c.b.addAssign(f1.add(f23).add(f43).add(f53).add(f63).mul(glareIntensity))
  c.assign(c.mul(1.3).mul(vec3(length(uvd).add(0.09))))
  c.addAssign(vec3(f0.mul(starPointsIntensity).div(4.0)))

  return c
}).setLayout({
  name: 'LensFlare',
  type: 'vec3',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'pos', type: 'vec2' },
  ],
})

export const rndf = /*@__PURE__*/ Fn(([i_w]: [UniformNumberNode]) => {
  return float(fract(sin(i_w).mul(1000)))
}).setLayout({
  name: 'rndf',
  type: 'float',
  inputs: [{ name: 'w', type: 'float' }],
})

export const regShape = /*#__PURE__*/ Fn(([p_immutable, N_immutable]) => {
  const N = int(N_immutable).toVar()
  const p = vec2(p_immutable).toVar()
  const f = float().toVar()
  const a = float(atan(p.x, p.y).add(0.2)).toVar()
  const b = float(div(6.28319, float(N))).toVar()
  f.assign(
    smoothstep(
      0.5,
      0.51,
      cos(
        floor(add(0.5, a.div(b)))
          .mul(b)
          .sub(a),
      )
        .mul(length(p.xy))
        .mul(2.0)
        .sub(ghostScale),
    ),
  )

  return f
}).setLayout({
  name: 'regShape',
  type: 'float',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'N', type: 'int' },
  ],
})

export const circle = /*#__PURE__*/ Fn(
  ([p_immutable, size_immutable, decay_immutable, color_immutable, dist_immutable, mouse_immutable]) => {
    const mouse = vec2(mouse_immutable).toVar()
    const dist = float(dist_immutable).toVar()
    const color = vec3(color_immutable).toVar()
    const decay = float(decay_immutable).toVar()
    const size = float(size_immutable).toVar()
    const p = vec2(p_immutable).toVar()
    const l = float(length(p.add(mouse.mul(dist.mul(2)))).add(size.div(2))).toVar()
    const c = float(max(sub(0.04, pow(length(p.add(mouse.mul(dist))), size.mul(ghostScale))), 0.0).mul(10)).toVar()
    const c1 = float(max(sub(0.001, pow(l.sub(0.3), 1 / 40)).add(sin(l.mul(20))), 0.0).mul(3)).toVar()
    const c2 = float(max(div(0.09, pow(length(p.sub(mouse.mul(dist).div(0.5))).mul(1), 0.95)), 0.0).div(20)).toVar()
    const s = float(
      max(sub(0.02, pow(regShape(p.mul(5).add(mouse.mul(dist).mul(5)).add(decay), int(6)), 1)), 0.0).mul(1.5),
    ).toVar()
    color.assign(cos(vec3(colorGain)).mul(0.5).add(0.5))
    const f = vec3(c.mul(color)).toVar('f')
    f.addAssign(c1.mul(color))
    f.addAssign(c2.mul(color))
    f.addAssign(s.mul(color))

    return f
  },
).setLayout({
  name: 'circle',
  type: 'vec3',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'size', type: 'float' },
    { name: 'decay', type: 'float' },
    { name: 'color', type: 'vec3' },
    { name: 'color2', type: 'vec3' },
    { name: 'dist', type: 'float' },
    { name: 'mouse', type: 'vec2' },
  ],
})
