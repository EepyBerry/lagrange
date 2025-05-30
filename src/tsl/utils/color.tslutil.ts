// Three.js Transpiler r176

import {
  float,
  vec4,
  color,
  sub,
  mat4,
  Fn,
  vec3,
  sin,
  cos,
  mat3,
  dot,
  type ShaderNodeObject,
  If,
  add,
  pow,
} from 'three/tsl'
import type { Node } from 'three/webgpu'

export const darken = /*@__PURE__*/ Fn(([i_color, i_factor]: ShaderNodeObject<Node>[]) => {
  return i_color.mul(
    mat4(
      vec4(sub(1.0, i_factor), 0.0, 0.0, 0.0),
      vec4(0.0, sub(1.0, i_factor), 0.0, 0.0),
      vec4(0.0, 0.0, sub(1.0, i_factor), 0.0),
      vec4(0.0, 0.0, 0.0, 1.0),
    ),
  )
}).setLayout({
  name: 'tintToMatrix',
  type: 'vec4',
  inputs: [
    { name: 'i_color', type: 'vec4' },
    { name: 'i_factor', type: 'float' },
  ],
})

export const tintToMatrix = /*@__PURE__*/ Fn(([i_tint]: [ShaderNodeObject<Node>]) => {
  return mat4(
    vec4(i_tint.x, 0.0, 0.0, 0.0),
    vec4(0.0, i_tint.y, 0.0, 0.0),
    vec4(0.0, 0.0, i_tint.z, 0.0),
    vec4(0.0, 0.0, 0.0, i_tint.w),
  )
}).setLayout({
  name: 'tintToMatrix',
  type: 'mat4',
  inputs: [{ name: 'i_tint', type: 'vec4' }],
})

export const greyscale = /*@__PURE__*/ Fn(([i_color]: [ShaderNodeObject<Node>]) => {
  return i_color.mul(
    mat4(
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0),
    ),
  )
}).setLayout({
  name: 'greyscale',
  type: 'vec4',
  inputs: [{ name: 'i_color', type: 'vec4' }],
})

export const whitescale = /*@__PURE__*/ Fn(([i_color]: [ShaderNodeObject<Node>]) => {
  return greyscale(i_color).mul(2.0)
}).setLayout({
  name: 'whitescale',
  type: 'vec4',
  inputs: [{ name: 'i_color', type: 'vec4' }],
})

export const shiftHue = /*@__PURE__*/ Fn(([i_color, i_hue]: ShaderNodeObject<Node>[]) => {
  const s = float(sin(i_hue)).toVar('s')
  const c = float(cos(i_hue)).toVar('c')
  return i_color
    .mul(c)
    .add(
      i_color
        .mul(s)
        .mul(
          mat3(
            vec3(0.167444, 0.329213, float(-0.496657)),
            vec3(float(-0.327948), 0.035669, 0.292279),
            vec3(1.250268, float(-1.047561), float(-0.202707)),
          ),
        ),
    )
    .add(dot(vec3(0.299, 0.587, 0.114), i_color).mul(sub(1.0, c)))
}).setLayout({
  name: 'shiftHue',
  type: 'vec3',
  inputs: [
    { name: 'i_color', type: 'vec3' },
    { name: 'i_hue', type: 'float' },
  ],
})

// ----------------------------------------------------------------------------
// COLOR SPACE CONVERSIONS
const SRGB_ALPHA = 0.055

const chLinearToSRGB = /*@__PURE__*/ Fn(([i_channel]: [ShaderNodeObject<Node>]) => {
  const result = float(i_channel).toVar('result')
  If(i_channel.lessThanEqual(0.0031308), () => {
    result.assign(float(12.92).mul(i_channel))
  }).Else(() => {
    result.assign(
      add(1.0, SRGB_ALPHA)
        .mul(pow(i_channel, 1.0 / 2.4))
        .sub(SRGB_ALPHA),
    )
  })
  return result
}).setLayout({
  name: 'LG_COLOR_chLinearToSRGB',
  type: 'float',
  inputs: [{ name: 'channel', type: 'float' }],
})
export const linearToSRGB = /*#__PURE__*/ Fn(([i_rgb]: [ShaderNodeObject<Node>]) => {
  return vec3(chLinearToSRGB(i_rgb.r), chLinearToSRGB(i_rgb.g), chLinearToSRGB(i_rgb.b))
}).setLayout({
  name: 'LG_COLOR_linearToSRGB',
  type: 'vec3',
  inputs: [{ name: 'rgb', type: 'vec3' }],
})

const chSRGBToLinear = /*#__PURE__*/ Fn(([i_channel]: [ShaderNodeObject<Node>]) => {
  const channel = float(i_channel).toVar()
  If(channel.lessThanEqual(0.04045), () => {
    channel.assign(channel.div(12.92))
  }).Else(() => {
    channel.assign(pow(channel.add(SRGB_ALPHA).div(add(1.0, SRGB_ALPHA)), 2.4))
  })
  return channel
}).setLayout({
  name: 'LG_COLOR_chSRGBToLinear',
  type: 'float',
  inputs: [{ name: 'channel', type: 'float' }],
})
export const sRGBToLinear = /*#__PURE__*/ Fn(([i_srgb]: [ShaderNodeObject<Node>]) => {
  return vec3(chSRGBToLinear(i_srgb.r), chSRGBToLinear(i_srgb.g), chSRGBToLinear(i_srgb.b))
}).setLayout({
  name: 'LG_COLOR_sRGBToLinear',
  type: 'vec3',
  inputs: [{ name: 'srgb', type: 'vec3' }],
})
