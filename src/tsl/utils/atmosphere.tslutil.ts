import type { ShaderNodeObject } from 'three/src/nodes/TSL.js'
import {
  Fn,
  float,
  vec3,
  dot,
  If,
  vec2,
  sqrt,
  add,
  div,
  mul,
  PI,
  sub,
  length,
  exp,
  max,
  Loop,
  int,
  vec4,
} from 'three/tsl'
import type { UniformNumberNode, UniformVector3Node } from '../types'
import type { Node } from 'three/webgpu'

const MAX = 10000
const NUM_OUT_SCATTER = 2
const NUM_IN_SCATTER = 10

/**
 * Ray & sphere intersection function
 */
// e = -b +/- sqrt( b^2 - c )
export const rayVsSphere = /*@__PURE__*/ Fn(([i_position, i_direction, i_r]: ShaderNodeObject<Node>[]) => {
  const r = float(i_r).toVar('r')

  const b = float(dot(i_position, i_direction)).toVar('b')
  const c = float(dot(i_position, i_position).sub(r.mul(r))).toVar('c')
  let d = float(b.mul(b).sub(c))

  If(d.lessThan(0.0), () => vec2(MAX, float(MAX).negate()))
  
  d = sqrt(d)
  return vec2(b.negate().sub(d), b.negate().add(d))
}).setLayout({
  name: 'rayVsSphere',
  type: 'vec2',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_direction', type: 'vec3' },
    { name: 'i_r', type: 'float' }
  ]
})

/**
 * Mie scattering function
 */
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//      8pi * ( 2 + g^2 )     ( 1 + g^2 - 2 * g * c )^(3/2)
export const computeMie = /*@__PURE__*/ Fn(([i_g, i_c, i_cc]: ShaderNodeObject<Node>[]) => {
  const g = float(i_g).toVar('g')
  const c = float(i_c).toVar('c')
  const cc = float(i_cc).toVar('cc')

  const gg = float(g.mul(g)).toVar('gg')
  const a = float(sub(1.0, gg).mul(add(1.0, cc))).toVar('a')
  const b = float(add(1.0, gg.sub(mul(2.0, g).mul(c)))).toVar('b')
  b.mulAssign(sqrt(b))
  b.mulAssign(add(2.0, gg))

  return div(3.0 / 8.0, PI)
    .mul(a)
    .div(b)
}).setLayout({
  name: 'computeMie',
  type: 'float',
  inputs: [
    { name: 'i_g', type: 'float' },
    { name: 'i_c', type: 'float' },
    { name: 'i_cc', type: 'float' }
  ]
})

/**
 * Rayleigh function
 */
// g : 0
// F = 3/16PI * ( 1 + c^2 )
export const computeRayleigh = /*@__PURE__*/ Fn(([i_cc]: ShaderNodeObject<Node>[]) => {
  return div(3.0 / 16.0, PI).mul(add(1.0, i_cc))
}).setLayout({
  name: 'computeRayleigh',
  type: 'float',
  inputs: [
    { name: 'i_cc', type: 'float' }
  ]
})

export const computeDensity = /*@__PURE__*/ Fn(
  ([i_p, i_ph, i_surfaceRadius, i_density]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const p = vec3(i_p).toVar('p')
    const ph = float(i_ph).toVar('ph')
    const actualScaleHeight = float(8500.0).toVar('actualScaleHeight') // The scale height on Earth in meters
    const scale = float(i_density.div(actualScaleHeight)).toVar('scale') // Scaling factor based on the gap
    const altitude = float(length(p).sub(i_surfaceRadius)).toVar('altitude')

    // Initial density at the surface (sea level). Set this to your desired value.
    // Earth's air density at sea level is approximately 1.225 kg/m^3
    const rho_0 = float(20.0).toVar('rho_0')

    //TBD, why does it looks better with these tunings?
    rho_0.mulAssign(0.08125)

    // Use exponential decay formula to calculate density
    const rho = float(rho_0.mul(exp(max(altitude, 0.0).negate().div(actualScaleHeight.mul(scale))))).toVar('rho')
    return rho.mul(ph)
  },
).setLayout({
  name: 'computeDensity',
  type: 'float',
  inputs: [
    { name: 'i_p', type: 'vec3' },
    { name: 'i_ph', type: 'float' },
    { name: 'i_surfaceRadius', type: 'float' },
    { name: 'i_density', type: 'float' }
  ]
})

export const optic = /*@__PURE__*/ Fn(
  ([i_p, i_q, i_ph, i_surfaceRadius, i_density]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const p = vec3(i_p).toVar('p')
    const q = vec3(i_q).toVar('q')
    const ph = float(i_ph).toVar('ph')
    const s = vec3(q.sub(p).div(float(NUM_OUT_SCATTER))).toVar('s')
    const v = vec3(p.add(s.mul(0.5))).toVar('v')
    const sum = float(0.0).toVar('sum')

    Loop({ start: int(0), end: NUM_OUT_SCATTER, condition: '<' }, ({ i }) => {
      sum.addAssign(computeDensity(v, ph, i_surfaceRadius, i_density))
      v.addAssign(s)
    })

    sum.mulAssign(length(s))
    return sum
  },
).setLayout({
  name: 'optic',
  type: 'float',
  inputs: [
    { name: 'i_p', type: 'vec3' },
    { name: 'i_q', type: 'vec3' },
    { name: 'i_ph', type: 'float' },
    { name: 'i_surfaceRadius', type: 'float' },
    { name: 'i_density', type: 'float' }
  ]
})

export const applyInScatter = /*@__PURE__*/ Fn(
  ([i_o, i_dir, i_e, i_lightDir, i_lightIntensity, i_uniforms]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformNumberNode, // light intensity
    UniformVector3Node, // radius, surface radius, density (passed to rayVsSphere & computeDensity)
  ]) => {
    const ph_ray = float(0.15)
    const ph_mie = float(0.05)
    const ph_alpha = float(0.25)

    const k_ray = vec3(3.8, 13.5, 33.1)
    const k_mie = vec3(21.0)
    const k_mie_ex = float(1.1)
    const k_alpha = float(2.0)

    const sum_ray = vec3(0.0).toVar('sum_ray')
    const sum_mie = vec3(0.0).toVar('sum_mie')
    const sum_alpha = float(0.0).toVar('sum_alpha')

    const n_ray0 = float(0.0).toVar()
    const n_mie0 = float(0.0).toVar()

    const len = float(i_e.y.sub(i_e.x).div(float(NUM_IN_SCATTER))).toVar('len')
    const s = vec3(i_dir.mul(len)).toVar()
    const v = vec3(i_o.add(i_dir.mul(i_e.x.add(len.mul(0.5))))).toVar('v')

    Loop({ start: int(0), end: NUM_IN_SCATTER, condition: '<' }, () => {
      const d_ray = float(computeDensity(v, ph_ray, i_uniforms.y, i_uniforms.z).mul(len)).toVar('d_ray')
      const d_mie = float(computeDensity(v, ph_mie, i_uniforms.y, i_uniforms.z).mul(len)).toVar('d_mie')
      const d_alpha = float(computeDensity(v, ph_alpha, i_uniforms.y, i_uniforms.z).mul(len)).toVar('d_alpha')

      n_ray0.addAssign(d_ray)
      n_mie0.addAssign(d_mie)

      const f = vec2(rayVsSphere(v, i_lightDir, i_uniforms.x)).toVar('f')
      const u = vec3(v.add(i_lightDir.mul(f.y))).toVar('u')

      const n_ray1 = float(optic(v, u, ph_ray, i_uniforms.y, i_uniforms.z)).toVar('n_ray1')
      const n_mie1 = float(optic(v, u, ph_mie, i_uniforms.y, i_uniforms.z)).toVar('n_mie1')

      const att = vec3(
        exp(n_ray0.add(n_ray1).negate().mul(k_ray).sub(n_mie0.add(n_mie1).mul(k_mie).mul(k_mie_ex))),
      ).toVar('att')

      sum_ray.addAssign(d_ray.mul(att))
      sum_mie.addAssign(d_mie.mul(att))

      // The optical density is only a factor of the density of the traveled media
      sum_alpha.addAssign(d_alpha)
      v.addAssign(s)
    })

    const c = float(dot(i_dir, i_lightDir.negate())).toVar('c')
    const cc = float(c.mul(c)).toVar('cc')
    const scatter = vec3(
      sum_ray
        .mul(k_ray)
        .mul(computeRayleigh(cc))
        .add(sum_mie.mul(k_mie).mul(computeMie(float(-0.78), c, cc))),
    ).toVar('scatter')

    const alpha = float(sum_alpha.mul(k_alpha)).toVar('alpha')
    return vec4(scatter.mul(i_lightIntensity), alpha)
  },
).setLayout({
  name: 'applyInScatter',
  type: 'vec4',
  inputs: [
    { name: 'i_o', type: 'vec3' },
    { name: 'i_dir', type: 'vec3' },
    { name: 'i_e', type: 'vec2' },
    { name: 'i_lightDir', type: 'vec3' },
    { name: 'i_lightIntensity', type: 'float' },
    { name: 'i_uniforms', type: 'vec3' }
  ]
})
