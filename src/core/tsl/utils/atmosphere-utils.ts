import type { ShaderNodeObject } from 'three/src/nodes/TSL.js';
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
  sub,
  length,
  exp,
  Loop,
  int,
  vec4,
  negate,
  mat4,
  normalize,
} from 'three/tsl';
import type { UniformNumberNode, UniformVector2Node, UniformVector3Node, UniformVector4Node } from '../tsl-types';
import type { Node } from 'three/webgpu';

/*
 * DISCLAIMER:
 * The functions in this class were extracted and manually transpiled & adapted from two distinct sources:
 * - "Atmospheric Scattering Sample" by gltracy, 2014: https://www.shadertoy.com/view/lslXDr
 * - "gl_tests" by TJGreen0211, 2018: https://github.com/TJGreen0211/gl_tests/blob/master/atmosphere/shaders/atmosphere.frag
 *
 * Of note, the original proposal behind this code is titled "Display of The Earth Taking into Account Atmospheric Scattering",
 * published by Nishita et al. in 1993, and presented at SIGGRAPH '93.
 * The paper is available here for reading: https://dl.acm.org/doi/10.1145/166117.166140
 */

const MAX = 10000;
const NUM_OUT_SCATTER = 2;
const NUM_IN_SCATTER = 10;

/**
 * Camera-to-atmosphere ray direction calculation
 */
export const rayDirection = /*@__PURE__*/ Fn(
  ([i_modelWorldMatrix, i_position, i_camPosition]: ShaderNodeObject<Node>[]) => {
    const m = mat4(i_modelWorldMatrix).toVar('m');
    const pos = vec3(i_position).toVar('pos');
    const ray = m.mul(pos).sub(vec4(i_camPosition, 1.0));
    return normalize(ray.toVec3());
  },
).setLayout({
  name: 'LG_ATMOS_rayDirection',
  type: 'vec3',
  inputs: [
    { name: 'i_modelWorldMatrix', type: 'mat4' },
    { name: 'i_position', type: 'vec3' },
    { name: 'i_camPosition', type: 'vec3' },
  ],
});

/**
 * Ray & sphere intersection function
 */
// e = -b +/- sqrt( b^2 - c )
export const rayVsSphere = /*@__PURE__*/ Fn(([i_position, i_direction, i_r]: ShaderNodeObject<Node>[]) => {
  const b = float(dot(i_position, i_direction)).toVar('b');
  const c = float(dot(i_position, i_position).sub(i_r.mul(i_r))).toVar('c');
  const d = float(b.mul(b).sub(c)).toVar('d');
  If(d.lessThan(0.0), () => vec2(MAX, float(MAX).negate()));

  d.assign(sqrt(d));
  return vec2(negate(b).sub(d), negate(b).add(d));
}).setLayout({
  name: 'LG_ATMOS_rayVsSphere',
  type: 'vec2',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_direction', type: 'vec3' },
    { name: 'i_r', type: 'float' },
  ],
});

/**
 * Mie scattering function
 */
// g : ( -0.75, -0.999 )
//      3 * ( 1 - g^2 )               1 + c^2
// F = ----------------- * -------------------------------
//  (8 * PI/3) * (2 + g^2)   (1 + g^2 - 2 * g * c)^(3/2)
export const computeMie = /*@__PURE__*/ Fn(([i_g, i_c, i_cc]: ShaderNodeObject<Node>[]) => {
  const gg = float(i_g.mul(i_g)).toVar('gg');
  const a = float(sub(1.0, gg).mul(add(1.0, i_cc))).toVar('a');
  const b = float(add(1.0, gg.sub(mul(2.0, i_g).mul(i_c)))).toVar('b');
  b.mulAssign(sqrt(b));
  b.mulAssign(add(2.0, gg));

  return float((8 * Math.PI) / 3.0)
    .mul(a)
    .div(b);
}).setLayout({
  name: 'LG_ATMOS_computeMie',
  type: 'float',
  inputs: [
    { name: 'i_g', type: 'float' },
    { name: 'i_c', type: 'float' },
    { name: 'i_cc', type: 'float' },
  ],
});

/**
 * Rayleigh function
 */
// g : 0
// F = 3/4 * ( 1 + c^2 )
export const computeRayleigh = /*@__PURE__*/ Fn(([i_cc]: ShaderNodeObject<Node>[]) => {
  return float(0.75).mul(add(1.0, i_cc));
}).setLayout({
  name: 'LG_ATMOS_computeRayleigh',
  type: 'float',
  inputs: [{ name: 'i_cc', type: 'float' }],
});

export const computeDensity = /*@__PURE__*/ Fn(
  ([i_p, i_ph, i_radius, i_surfaceRadius, i_density]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformNumberNode,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const rho = float(i_density).toVar('rho');
    const scalingFactor = float(1.0).div(i_radius.sub(i_surfaceRadius)).toVar('scalingFactor');
    return exp(negate(length(i_p).sub(i_surfaceRadius)).mul(scalingFactor))
      .mul(rho)
      .mul(i_ph);
  },
).setLayout({
  name: 'LG_ATMOS_computeDensity',
  type: 'float',
  inputs: [
    { name: 'i_p', type: 'vec3' },
    { name: 'i_ph', type: 'float' },
    { name: 'i_radius', type: 'float' },
    { name: 'i_surfaceRadius', type: 'float' },
    { name: 'i_density', type: 'float' },
  ],
});

export const optic = /*@__PURE__*/ Fn(
  ([i_p, i_q, i_ph, i_radius, i_surfaceRadius, i_density]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformNumberNode,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const stepValue = vec3(div(i_q.sub(i_p), float(NUM_OUT_SCATTER))).toVar('stepValue');
    const v = vec3(i_p.add(stepValue.mul(0.5))).toVar('v');

    const sum = float(0.0).toVar('sum');
    Loop({ start: int(0), end: NUM_OUT_SCATTER, condition: '<' }, () => {
      sum.addAssign(computeDensity(v, i_ph, i_radius, i_surfaceRadius, i_density));
      v.addAssign(stepValue);
    });
    return sum.mul(length(stepValue));
  },
).setLayout({
  name: 'LG_ATMOS_optic',
  type: 'float',
  inputs: [
    { name: 'i_p', type: 'vec3' },
    { name: 'i_q', type: 'vec3' },
    { name: 'i_ph', type: 'float' },
    { name: 'i_radius', type: 'float' },
    { name: 'i_surfaceRadius', type: 'float' },
    { name: 'i_density', type: 'float' },
  ],
});

export const applyInScatter = /*@__PURE__*/ Fn(
  ([i_o, i_dir, i_e, i_light, i_atmos, i_constants]: [
    ShaderNodeObject<Node>,
    ShaderNodeObject<Node>,
    UniformVector2Node,
    UniformVector4Node, // XYZ = direction, W = intensity
    UniformVector3Node, // radius, surface radius, density (passed to rayVsSphere & computeDensity)
    UniformVector4Node, // mie scattering, rayleigh density ratio (phRay), mie density ratio (phMie), optical density ratio (phOptical)
  ]) => {
    // density ratios
    const mieScatteringConstant = float(i_constants.x).toVar('mieScatteringConstant');
    const phRay = float(i_constants.y).toVar('phRay');
    const phMie = float(i_constants.z).toVar('phMie');
    const phOptical = float(i_constants.w).toVar('phOptical');

    const k_ray = vec3(3.8, 13.5, 33.1);
    const k_mie = vec3(21.0);
    const k_alpha = float(2.0);

    const len = float(i_e.y.sub(i_e.x).div(float(NUM_IN_SCATTER))).toVar('len');
    const stepValue = vec3(i_dir.mul(len)).toVar('stepValue');
    const v = vec3(i_o.add(i_dir.mul(i_e.x.add(len.mul(0.5))))).toVar('v');

    const n_ray0 = float(0.0).toVar('n_ray0');
    const n_mie0 = float(0.0).toVar('n_mie0');
    const sum_ray = vec3(0.0).toVar('sum_ray');
    const sum_mie = vec3(0.0).toVar('sum_mie');
    const sum_alpha = float(0.0).toVar('sum_alpha');
    Loop({ start: int(0), end: NUM_IN_SCATTER, condition: '<' }, () => {
      const f = vec2(rayVsSphere(v, i_light.xyz, i_atmos.x)).toVar('f');
      const u = vec3(v.add(i_light.xyz.mul(f.y))).toVar('u');

      const d_ray = float(computeDensity(v, phRay, i_atmos.x, i_atmos.y, i_atmos.z).mul(len)).toVar('d_ray');
      const d_mie = float(computeDensity(v, phMie, i_atmos.x, i_atmos.y, i_atmos.z).mul(len)).toVar('d_mie');
      const d_alpha = float(computeDensity(v, phOptical, i_atmos.x, i_atmos.y, i_atmos.z).mul(len)).toVar('d_alpha');

      n_ray0.addAssign(d_ray);
      n_mie0.addAssign(d_mie);

      const n_ray1 = float(optic(v, u, phRay, i_atmos.x, i_atmos.y, i_atmos.z)).toVar('n_ray1');
      const n_mie1 = float(optic(v, u, phMie, i_atmos.x, i_atmos.y, i_atmos.z)).toVar('n_mie1');

      const att = vec3(exp(n_ray0.add(n_ray1).negate().mul(k_ray).sub(n_mie0.add(n_mie1).mul(k_mie)))).toVar('att');

      sum_ray.addAssign(d_ray.mul(att));
      sum_mie.addAssign(d_mie.mul(att));

      // The optical density is only a factor of the density of the traveled media
      sum_alpha.addAssign(d_alpha);
      v.addAssign(stepValue);
    });

    const c = float(dot(i_dir, negate(i_light.xyz))).toVar('c');
    const cc = float(c.mul(c)).toVar('cc');
    const scatter = vec3(
      sum_ray
        .mul(k_ray)
        .mul(computeRayleigh(cc))
        .add(sum_mie.mul(k_mie).mul(computeMie(float(mieScatteringConstant), c, cc))),
    ).toVar('scatter');

    const alpha = float(sum_alpha.mul(k_alpha)).toVar('alpha');
    return vec4(scatter.mul(i_light.w), alpha);
  },
).setLayout({
  name: 'LG_ATMOS_applyInScatter',
  type: 'vec4',
  inputs: [
    { name: 'i_o', type: 'vec3' },
    { name: 'i_dir', type: 'vec3' },
    { name: 'i_e', type: 'vec2' },
    { name: 'i_light', type: 'vec4' },
    { name: 'i_atmos', type: 'vec3' },
    { name: 'i_constants', type: 'vec4' },
  ],
});
