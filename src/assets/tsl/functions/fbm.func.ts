import type { TSLFnParams } from "@/core/helpers/tsl.helper"
import { float, floor, Fn, fract, int, Loop, sub, vec2, vec3, vec4, mul } from "three/tsl"

// Sourced and converted from Yi-wen LIN, using code from Iñigo Quilez:
// https://github.com/yiwenl/glsl-fbm/blob/master
// https://iquilezles.org/articles/fbm/
// ------------------------------------------------------------------------------------------------

// 3D version

const _mod289 = /*@__PURE__*/ Fn<TSLFnParams>(([x]) => {
  return sub(x, floor(x.mul(float(1.0).mul(1.0/289.0)).mul(289.0)))
})
const _perm = /*@__PURE__*/  Fn<TSLFnParams>(([x]) => {
  return _mod289(x.mul(x.mul(34.0).add(1.0)))
})

const _noise3 = /*@__PURE__*/ Fn<TSLFnParams>(([i_pos]) => {
  const p = vec3( i_pos ).toVar()
	const a = vec3( floor( p ) ).toVar()
	const d = vec3( p.sub( a ) ).toVar()
	d.assign( d.mul( d ).mul( sub( 3.0, mul( 2.0, d ) ) ) )
	const b = vec4( a.xxyy.add( vec4( 0.0, 1.0, 0.0, 1.0 ) ) ).toVar()
	const k1 = vec4( _perm( b.xyxy ) ).toVar()
	const k2 = vec4( _perm( k1.xyxy.add( b.zzww ) ) ).toVar()
	const c = vec4( k2.add( a.zzzz ) ).toVar()
	const k3 = vec4( _perm( c ) ).toVar()
	const k4 = vec4( _perm( c.add( 1.0 ) ) ).toVar()
	const o1 = vec4( fract( k3.mul( 1.0 / 41.0 ) ) ).toVar()
	const o2 = vec4( fract( k4.mul( 1.0 / 41.0 ) ) ).toVar()
	const o3 = vec4( o2.mul( d.z ).add( o1.mul( sub( 1.0, d.z ) ) ) ).toVar()
	const o4 = vec2( o3.yw.mul( d.x ).add( o3.xz.mul( sub( 1.0, d.x ) ) ) ).toVar()

	return o4.y.mul( d.y ).add( o4.x.mul( sub( 1.0, d.y ) ) );
})

export const fbm3 = /*@__PURE__*/ Fn<TSLFnParams>(([i_pos, i_freq, i_amp, i_lac, i_octaves]) => {
  const pos = vec3(i_pos).toVar()
  const freq = float(i_freq).toVar()
  const amp = float(i_amp).toVar()
  const lac = float(i_lac).toVar()
  const octaves = int(i_octaves).toVar()

  const val = float(0.0)
  Loop({ start: int(0), end: octaves, condition: '' }, () => {
    val.addAssign(amp.mul(_noise3(pos.mul(freq))))
    freq.mulAssign(lac)
    amp.mulAssign(0.5)
  })
  return val
})