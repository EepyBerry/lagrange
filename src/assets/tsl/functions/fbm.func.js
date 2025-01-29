import { float, floor, Fn, int, Loop, vec3 } from "three/tsl"

const fmod289 = /*@__PURE__*/ Fn(([x]) => {
  return x.addAssign(- floor(x.mul(float(1.0).mul(1.0/289.0)).mul(289.0)))
})

const noise3 = /*@__PURE__*/ Fn(([pos]) => {
  return pos
})

export const fbm3 = /*@__PURE__*/ Fn(([i_pos, i_freq, i_amp, i_lac, i_octaves]) => {
  const pos = vec3(i_pos).toVar()
  const freq = float(i_freq).toVar()
  const amp = float(i_amp).toVar()
  const lac = float(i_lac).toVar()
  const octaves = int(i_octaves).toVar()

  const val = float(0.0)
  Loop({ start: int(0), end: octaves, condition: '' }, () => {
    val.addAssign(amp.mul(1.0))
    freq.mulAssign(lac)
    amp.mulAssign(0.5)
  })
  return val
})