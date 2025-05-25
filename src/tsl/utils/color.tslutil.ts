// Three.js Transpiler r176

import { float, vec4, color, sub, mat4, Fn, vec3, sin, cos, mat3, dot, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export const darken = /*@__PURE__*/ Fn(([color_immutable, t_immutable]: ShaderNodeObject<Node>[]) => {
  const t = float(t_immutable).toVar()
  const color = vec4(color_immutable).toVar()
  return color.mul(
    mat4(
      vec4(sub(1.0, t), 0.0, 0.0, 0.0),
      vec4(0.0, sub(1.0, t), 0.0, 0.0),
      vec4(0.0, 0.0, sub(1.0, t), 0.0),
      vec4(0.0, 0.0, 0.0, 1.0),
    ),
  )
})

export const tintToMatrix = /*@__PURE__*/ Fn(([tint_immutable]: [ShaderNodeObject<Node>]) => {
  const tint = vec4(tint_immutable).toVar()
  return mat4(
    vec4(tint.x, 0.0, 0.0, 0.0),
    vec4(0.0, tint.y, 0.0, 0.0),
    vec4(0.0, 0.0, tint.z, 0.0),
    vec4(0.0, 0.0, 0.0, tint.w),
  )
})

export const greyscale = /*@__PURE__*/ Fn(([color_immutable]: [ShaderNodeObject<Node>]) => {
  const color = vec4(color_immutable).toVar()
  return color.mul(
    mat4(
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.2126, 0.7152, 0.0722, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0),
    ),
  )
})

export const whitescale = /*@__PURE__*/ Fn(([color_immutable]: [ShaderNodeObject<Node>]) => {
  const color = vec4(color_immutable).toVar()
  return greyscale(color).mul(2.0)
})

export const shiftHue = /*@__PURE__*/ Fn(([color_immutable, dhue_immutable]: ShaderNodeObject<Node>[]) => {
  const dhue = float(dhue_immutable).toVar()
  const color = vec3(color_immutable).toVar()
  const s = float(sin(dhue)).toVar()
  const c = float(cos(dhue)).toVar()
  return color
    .mul(c)
    .add(
      color
        .mul(s)
        .mul(
          mat3(
            vec3(0.167444, 0.329213, float(-0.496657)),
            vec3(float(-0.327948), 0.035669, 0.292279),
            vec3(1.250268, float(-1.047561), float(-0.202707)),
          ),
        ),
    )
    .add(dot(vec3(0.299, 0.587, 0.114), color).mul(sub(1.0, c)))
})
