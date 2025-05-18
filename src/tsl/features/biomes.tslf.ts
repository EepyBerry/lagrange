import { fbm3 } from '../noise/fbm3.func'
import { float, step, abs, mix, smoothstep, Fn, vec3, vec2, vec4 } from 'three/tsl'
import type { TextureNode, UniformArrayNode } from 'three/webgpu'
import type { UniformNumberNode, UniformVector3Node } from '../types'

export const computeTemperature = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [UniformVector3Node, UniformArrayNode, UniformNumberNode]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar()
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar()

    const ty = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar()
    const adjustedTy = float(smoothstep(1.0, FLAG_POLAR.negate(), ty)).toVar()
    const tHeight = float(mix(adjustedTy, 1.0, FLAG_NOISE)).toVar()
    return tHeight.mul(fbm3(i_position, i_noiseparams))
  },
)

export const computeHumidity = /*@__PURE__*/ Fn(
  ([i_position, i_noiseparams, i_mode]: [UniformVector3Node, UniformArrayNode, UniformNumberNode]) => {
    const FLAG_POLAR = float(step(0.5, i_mode)).toVar()
    const FLAG_NOISE = float(step(1.5, i_mode)).toVar()

    const hy = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar()
    const adjustedHy = float(smoothstep(FLAG_POLAR.negate(), 1.0, hy)).toVar()
    const hHeight = float(mix(adjustedHy, 1.0, FLAG_NOISE)).toVar()
    return hHeight.mul(fbm3(i_position, i_noiseparams))
  },
)

export const sampleBiomeTexture = /*#__PURE__*/ Fn(([i_tex, i_temperature, i_humidity, i_color]: [TextureNode, UniformNumberNode, UniformNumberNode, UniformVector3Node]) => {
  const t = float(i_temperature).toVar()
  const h = float(i_humidity).toVar()
  const color = vec3(i_color).toVar()
  const texCoord = vec2(h, t).toVar()
  const texel = vec4(i_tex.sample(texCoord)).toVar()
  return mix(color, texel.xyz, texel.w)
})
