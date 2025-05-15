import { fbm3 } from '../noise/fbm3.func'
import { float, step, abs, mix, smoothstep, Fn } from 'three/tsl'
import type { UniformArrayNode, Vector3 } from 'three/webgpu';

export const computeTemperature = /*@__PURE__*/ Fn(([i_position, i_noiseparams]: [Vector3, UniformArrayNode]) => {
  const FLAG_POLAR = float(step(0.5, float(i_noiseparams.element(0)))).toVar()
  const FLAG_NOISE = float(step(1.5, float(i_noiseparams.element(0)))).toVar()

  const ty = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar()
  const adjustedTy = float(smoothstep(1.0, FLAG_POLAR.negate(), ty)).toVar()
  const tHeight = float(mix(adjustedTy, 1.0, FLAG_NOISE)).toVar()
  return tHeight.mul(fbm3(i_position, i_noiseparams))
})

export const computeHumidity = /*@__PURE__*/ Fn(([i_position, i_noiseparams]: [Vector3, UniformArrayNode]) => {
  const FLAG_POLAR = float(step(0.5, float(i_noiseparams.element(0)))).toVar()
  const FLAG_NOISE = float(step(1.5, float(i_noiseparams.element(0)))).toVar()

  const hy = float(mix(abs(i_position.y), i_position.y, FLAG_POLAR)).toVar()
  const adjustedHy = float(smoothstep(FLAG_POLAR.negate(), 1.0, hy)).toVar()
  const hHeight = float(mix(adjustedHy, 1.0, FLAG_NOISE)).toVar()
  return hHeight.mul(fbm3(i_position, i_noiseparams))
})
