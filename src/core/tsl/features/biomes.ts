import { fbm3 } from '../noise/fbm3'
import { float, step, abs, mix, smoothstep, Fn, vec2, vec4 } from 'three/tsl'
import type { TextureNode, UniformArrayNode } from 'three/webgpu'
import type { UniformNumberNode, UniformVector3Node, UniformVector4Node } from '../tsl-types'

export const computeTemperature = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [UniformVector3Node, UniformVector4Node, UniformNumberNode]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar('FLAG_POLAR')
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar('FLAG_NOISE')

    const ty = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar('ty')
    const adjustedTy = float(smoothstep(1.0, FLAG_POLAR.negate(), ty)).toVar('adjustedTy')
    const tHeight = float(mix(adjustedTy, 1.0, FLAG_NOISE)).toVar('tHeight')
    return tHeight.mul(fbm3(i_position, i_noiseparams))
  },
).setLayout({
  name: 'LG_BIOME_computeTemperature',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'noise', type: 'vec4' },
    { name: 'mode', type: 'float' },
  ],
})

export const computeHumidity = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [UniformVector3Node, UniformArrayNode, UniformNumberNode]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar('FLAG_POLAR')
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar('FLAG_NOISE')

    const hy = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar('hy')
    const adjustedHy = float(smoothstep(FLAG_POLAR.negate(), 1.0, hy)).toVar('adjustedHy')
    const hHeight = float(mix(adjustedHy, 1.0, FLAG_NOISE)).toVar('hHeight')
    return hHeight.mul(fbm3(i_position, i_noiseparams))
  },
).setLayout({
  name: 'LG_BIOME_computeHumidity',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'noise', type: 'vec4' },
    { name: 'mode', type: 'float' },
  ],
})

// TODO: add setLayout when feature is ready in TSL
export const sampleBiomeTexture = /*@__PURE__*/ Fn(
  ([i_tex, i_temperature, i_humidity, i_color]: [
    TextureNode,
    UniformNumberNode,
    UniformNumberNode,
    UniformVector3Node,
  ]) => {
    const texel = vec4(i_tex.sample(vec2(i_humidity, i_temperature))).toVar('texel')
    return mix(i_color, texel.xyz, texel.w)
  },
) /*.setLayout({
  name: 'LG_BIOME_sampleBiomeTexture',
  type: 'float',
  inputs: [
    { name: 'tex', type: 'sampler2D' },
    { name: 'temperature', type: 'float' },
    { name: 'humidity', type: 'float' },
    { name: 'color', type: 'vec3' },
  ]
})*/
