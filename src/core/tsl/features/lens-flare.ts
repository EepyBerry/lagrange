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
import type { VaryingNode } from 'three/webgpu'

export const rand = /*@__PURE__*/ Fn(([i_n]: [UniformNumberNode]) => {
  return fract(sin(i_n).mul(43758.5453123))
}).setLayout({
  name: 'LF_rand',
  type: 'float',
  inputs: [{ name: 'n', type: 'float' }],
})

export const noise = /*@__PURE__*/ Fn(([i_p]: [UniformNumberNode]) => {
  const fl = float(floor(i_p)).toVar('fl')
  const fc = float(fract(i_p)).toVar('fc')
  return mix(rand(fl), rand(fl.add(1.0)), fc)
}).setLayout({
  name: 'LF_noise',
  type: 'float',
  inputs: [{ name: 'p', type: 'float' }],
})

export const hsv2rgb = /*@__PURE__*/ Fn(([i_c]: [UniformVector3Node]) => {
  const k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0).toVar('k')
  const p = vec3(abs(fract(i_c.xxx.add(k.xyz)).mul(6.0).sub(k.www))).toVar('p')
  return i_c.z.mul(mix(k.xxx, clamp(p.sub(k.xxx), 0.0, 1.0), i_c.y))
}).setLayout({
  name: 'LF_hsv2rgb',
  type: 'vec3',
  inputs: [{ name: 'c', type: 'vec3' }],
})

export const saturate2 = /*@__PURE__*/ Fn(([i_x]: [UniformNumberNode]) => {
  return clamp(i_x, 0, 1)
}).setLayout({
  name: 'LF_saturate2',
  type: 'float',
  inputs: [{ name: 'x', type: 'float' }],
})

export const rotateUV = /*@__PURE__*/ Fn(([i_origUv, i_rotation]: [UniformVector2Node, UniformVector3Node]) => {
  return vec2(
    cos(i_rotation).mul(i_origUv.x).add(sin(i_rotation).mul(i_origUv.y)),
    cos(i_rotation).mul(i_origUv.y).sub(sin(i_rotation).mul(i_origUv.x)),
  )
}).setLayout({
  name: 'LF_rotateUV',
  type: 'vec2',
  inputs: [
    { name: 'origUv', type: 'vec2' },
    { name: 'rotation', type: 'float' },
  ],
})

export const drawflare = /*@__PURE__*/ Fn(
  ([i_p, i_rand, i_flareShape, i_flareSize, i_starPoints]: [
    UniformVector3Node,
    UniformNumberNode,
    UniformNumberNode,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const lingrad = float(distance(vec2(0), i_p)).toVar('lingrad')
    const expgrad = float(div(1, exp(lingrad.mul(fract(i_rand).mul(0.66).add(0.33))))).toVar('expgrad')
    const blades = float(length(i_p.mul(i_flareShape).mul(sin(i_starPoints.mul(atan(i_p.x, i_p.y)))))).toVar('blades')
    const comp = float(pow(sub(1, saturate2(blades)), 24)).toVar('comp')
    comp.addAssign(saturate2(expgrad.sub(0.9)).mul(3))
    comp.assign(pow(comp.mul(expgrad), add(8, sub(1, i_flareSize).mul(5))))
    return vec3(comp).mul(i_flareSize).mul(15)
  },
).setLayout({
  name: 'drawflare',
  type: 'vec3',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'rand', type: 'float' },
    { name: 'flareShape', type: 'float' },
    { name: 'flareSize', type: 'float' },
    { name: 'starPoints', type: 'float' },
  ],
})

export const dist = /*@__PURE__*/ Fn(([i_a, i_b]: UniformVector3Node[]) => {
  return abs(i_a.x.sub(i_b.x))
    .add(abs(i_a.y.sub(i_b.y)))
    .add(abs(i_a.z.sub(i_b.z)))
}).setLayout({
  name: 'LF_dist',
  type: 'float',
  inputs: [
    { name: 'a', type: 'vec3' },
    { name: 'b', type: 'vec3' },
  ],
})

export const glare = /*@__PURE__*/ Fn(
  ([i_origUv, i_mouse, i_size, i_starPoints]: [
    UniformVector2Node,
    UniformVector2Node,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const main = vec2(i_origUv.sub(i_mouse)).toVar('main')
    const ang = float(atan(main.y, main.x).mul(i_starPoints)).toVar('ang')
    const dist = float(length(main)).toVar('dist')
    dist.assign(pow(dist, 0.9))
    const f0 = float(
      div(
        1.0,
        length(i_origUv.sub(i_mouse))
          .mul(div(1.0, i_size.mul(16.0)))
          .add(0.2),
      ),
    ).toVar('f0')

    return f0.add(f0.mul(sin(ang).mul(0.2).add(0.3)))
  },
).setLayout({
  name: 'LF_glare',
  type: 'float',
  inputs: [
    { name: 'origUv', type: 'vec2' },
    { name: 'mouse', type: 'vec2' },
    { name: 'size', type: 'float' },
    { name: 'starPoints', type: 'float' },
  ],
})

export const lensFlare = /*@__PURE__*/ Fn(
  ([i_origUv, i_pos, i_flareParams, i_glareParams, i_starPoints]: [
    UniformVector2Node,
    VaryingNode,
    UniformVector2Node,
    UniformVector2Node,
    UniformVector2Node,
  ]) => {
    const main = vec2(i_origUv.sub(i_pos)).toVar('main')
    const uvd = vec2(i_origUv.mul(length(i_origUv))).toVar('uvd')
    const ang = float(atan(main.x, main.y)).toVar('angle')

    const f0 = float(div(0.3, length(i_origUv.sub(i_pos)).mul(16.0).add(1.0))).toVar('f0')
    f0.assign(f0.mul(sin(noise(sin(ang.mul(3.9).mul(0.3)).mul(i_starPoints.x))).mul(0.2)))

    const f1 = float(max(sub(0.01, pow(length(i_origUv.add(mul(1.2, i_pos))), 1.9)), 0.0).mul(7.0)).toVar('f1')
    const f2 = float(
      max(div(0.9, add(10.0, mul(32.0, pow(length(uvd.add(mul(0.99, i_pos))), 2.0)))), 0.0).mul(0.35),
    ).toVar('f2')
    const f22 = float(
      max(div(0.9, add(11.0, mul(32.0, pow(length(uvd.add(mul(0.85, i_pos))), 2.0)))), 0.0).mul(0.23),
    ).toVar('f22')
    const f23 = float(
      max(div(0.9, add(12.0, mul(32.0, pow(length(uvd.add(mul(0.95, i_pos))), 2.0)))), 0.0).mul(0.6),
    ).toVar('f23')

    const uvx = vec2(mix(i_origUv, uvd, 0.1)).toVar('uvx')

    const f4 = float(max(sub(0.01, pow(length(uvx.add(mul(0.4, i_pos))), 2.9)), 0.0).mul(4.02)).toVar('f4')
    const f42 = float(max(sub(0.0, pow(length(uvx.add(mul(0.45, i_pos))), 2.9)), 0.0).mul(4.1)).toVar('f42')
    const f43 = float(max(sub(0.01, pow(length(uvx.add(mul(0.5, i_pos))), 2.9)), 0.0).mul(4.6)).toVar('f43')
    uvx.assign(mix(i_origUv, uvd, float(-0.4)))

    const f5 = float(max(sub(0.01, pow(length(uvx.add(mul(0.1, i_pos))), 5.5)), 0.0).mul(2.0)).toVar('f5')
    const f52 = float(max(sub(0.01, pow(length(uvx.add(mul(0.2, i_pos))), 5.5)), 0.0).mul(2.0)).toVar('f52')
    const f53 = float(max(sub(0.01, pow(length(uvx.add(mul(0.1, i_pos))), 5.5)), 0.0).mul(2.0)).toVar('f53')
    uvx.assign(mix(i_origUv, uvd, 2.1))

    const f6 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.3, i_pos))), 1.61)), 0.0).mul(3.159)).toVar('f6')
    const f62 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.325, i_pos))), 1.614)), 0.0).mul(3.14)).toVar('f62')
    const f63 = float(max(sub(0.01, pow(length(uvx.sub(mul(0.389, i_pos))), 1.623)), 0.0).mul(3.12)).toVar('f63')
    const c = vec3(glare(i_origUv, i_pos, i_glareParams.x, i_starPoints.x)).toVar('c')

    const prot = vec2(i_origUv.sub(i_pos)).toVar('prot')
    c.addAssign(drawflare(prot, 0.1, i_flareParams.x, i_flareParams.y, i_starPoints.x))
    c.r.addAssign(f1.add(f2).add(f4).add(f5).add(f6).mul(i_glareParams.y))
    c.g.addAssign(f1.add(f22).add(f42).add(f52).add(f62).mul(i_glareParams.y))
    c.b.addAssign(f1.add(f23).add(f43).add(f53).add(f63).mul(i_glareParams.y))
    c.assign(c.mul(1.3).mul(vec3(length(uvd).add(0.09))))
    c.addAssign(vec3(f0.mul(i_starPoints.y).div(4.0)))
    return c
  },
).setLayout({
  name: 'LF_lensFlare',
  type: 'vec3',
  inputs: [
    { name: 'origUv', type: 'vec2' },
    { name: 'mouse', type: 'vec2' },
    { name: 'flareParams', type: 'vec2' }, // shape, size
    { name: 'glareParams', type: 'vec2' }, // size, intensity
    { name: 'starPoints', type: 'vec2' }, // number, intensity
  ],
})

export const rndf = /*@__PURE__*/ Fn(([i_w]: [UniformNumberNode]) => {
  return float(fract(sin(i_w).mul(1000)))
}).setLayout({
  name: 'rndf',
  type: 'float',
  inputs: [{ name: 'w', type: 'float' }],
})

export const regShape = /*@__PURE__*/ Fn(
  ([i_p, i_N, i_streakScale]: [UniformVector2Node, UniformNumberNode, UniformNumberNode]) => {
    const n = int(i_N).toVar('n')
    const a = float(atan(i_p.x, i_p.y).add(0.2)).toVar('a')
    const b = float(div(6.28319, n.toFloat())).toVar('b')
    return smoothstep(
      0.5,
      0.51,
      cos(
        floor(add(0.5, a.div(b)))
          .mul(b)
          .sub(a),
      )
        .mul(length(i_p.xy))
        .mul(2.0)
        .sub(i_streakScale),
    )
  },
).setLayout({
  name: 'LF_regShape',
  type: 'float',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'N', type: 'int' },
    { name: 'ghostScale', type: 'float' },
  ],
})

export const circle = /*@__PURE__*/ Fn(
  ([i_p, i_size, i_decay, i_color, i_dist, i_pos, i_streakScale, i_colorGain]: [
    UniformVector2Node,
    UniformNumberNode,
    UniformNumberNode,
    UniformVector3Node,
    UniformNumberNode,
    UniformVector2Node,
    UniformNumberNode,
    UniformVector3Node,
  ]) => {
    const vColor = vec3(i_color).toVar('vColor')

    const l = float(length(i_p.add(i_pos.mul(i_dist.mul(2)))).add(i_size.div(2))).toVar('l')
    const c = float(
      max(sub(0.04, pow(length(i_p.add(i_pos.mul(i_dist))), i_size.mul(i_streakScale))), 0.0).mul(10),
    ).toVar('c')
    const c1 = float(max(sub(0.001, pow(l.sub(0.3), 1 / 40)).add(sin(l.mul(20))), 0.0).mul(3)).toVar('c1')
    const c2 = float(
      max(div(0.09, pow(length(i_p.sub(i_pos.mul(i_dist).div(0.5))).mul(1), 0.95)), 0.0).div(20),
    ).toVar('c2')
    const s = float(
      max(
        sub(0.02, pow(regShape(i_p.mul(5).add(i_pos.mul(i_dist).mul(5)).add(i_decay), int(6), i_streakScale), 1)),
        0.0,
      ).mul(1.5),
    ).toVar('s')

    vColor.assign(cos(i_colorGain).mul(0.5).add(0.5))
    const f = vec3(c.mul(vColor)).toVar('f')
    f.addAssign(c1.mul(vColor))
    f.addAssign(c2.mul(vColor))
    f.addAssign(s.mul(vColor))
    return f
  },
).setLayout({
  name: 'LF_circle',
  type: 'vec3',
  inputs: [
    { name: 'p', type: 'vec2' },
    { name: 'size', type: 'float' },
    { name: 'decay', type: 'float' },
    { name: 'color', type: 'vec3' },
    { name: 'dist', type: 'float' },
    { name: 'pos', type: 'vec2' },
    { name: 'streakScale', type: 'float' },
    { name: 'colorGain', type: 'vec3' },
  ],
})
