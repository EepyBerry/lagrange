import { vec3, float, mix, Fn, clamp, bool } from 'three/tsl'
import { fbm3 } from '../noise/fbm3.func'
import type { VaryingNode } from 'three/webgpu'
import { fbm1 } from '../noise/fbm1.func'
import type { UniformBooleanNode, UniformNumberNode, UniformVector3Node, UniformVector4Node } from '../types'

export const displace = /*@__PURE__*/ Fn(([i_position, i_params, i_noise]: [VaryingNode, UniformVector3Node, UniformVector4Node]) => {
  const vPos = vec3(i_position).toVar()
  const eps = float(i_params.y).toVar()
  const mul = float(i_params.z).toVar()

  const n1 = float(fbm3(vec3(vPos.x.add(eps), vPos.y, vPos.z), i_noise)).toVar()
  const n2 = float(fbm3(vec3(vPos.x.sub(eps), vPos.y, vPos.z), i_noise)).toVar()
  const dx = float(n1.sub(n2).div(mul.mul(eps))).toVar()

  n1.assign(fbm3(vec3(vPos.x, vPos.y.add(eps), vPos.z), i_noise))
  n2.assign(fbm3(vec3(vPos.x, vPos.y.sub(eps), vPos.z), i_noise))
  const dy = float(n1.sub(n2).div(mul.mul(eps))).toVar()

  n1.assign(fbm3(vec3(vPos.x, vPos.y, vPos.z.add(eps)), i_noise))
  n2.assign(fbm3(vec3(vPos.x, vPos.y, vPos.z.sub(eps)), i_noise))
  const dz = float(n1.sub(n2).div(mul.mul(eps))).toVar()

  return mix(vPos, vec3(dx, dy, dz), i_params.x)
})

// ----------------------------------------------------------------------------

export const warpLayer = /*@__PURE__*/ Fn(([i_position, i_noise, i_layers]:  [VaryingNode, UniformVector4Node, UniformNumberNode]) => {
  const vPos = vec3(i_position).toVar()
  const height = float(fbm3(vPos, i_noise)).toVar()
  height.assign(mix(height, fbm1(height, i_noise), clamp(float(i_layers).sub(1.0), 0.0, 1.0)))
  height.assign(mix(height, fbm1(height, i_noise), clamp(float(i_layers).sub(2.0), 0.0, 1.0)))
  return height
})

export const warpXYZ = /*@__PURE__*/ Fn(([i_position, i_params, i_enable]: [VaryingNode, UniformVector4Node, UniformBooleanNode]) => {
  const vPos = vec3(i_position).toVar()
  const enable = bool(i_enable).toVar()
  vPos.x.mulAssign(mix(1.0, i_params.y, enable))
  vPos.y.mulAssign(mix(1.0, i_params.z, enable))
  vPos.z.mulAssign(mix(1.0, i_params.w, enable))
  return vPos
}).setLayout({
  name: 'warpXYZ',
  type: 'vec3',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_params', type: 'vec4' },
    { name: 'i_enable', type: 'bool' },
  ]
})

export const warpDisplace = /*@__PURE__*/ Fn(([i_position, i_params, i_noise, i_enable]: [VaryingNode, UniformVector3Node, UniformVector4Node, UniformBooleanNode]) => {
    const vPos = vec3(i_position).toVar()
    vPos.assign(mix(vPos, displace(i_position, i_params, i_noise), float(i_enable)))
    return vPos
  },
)
