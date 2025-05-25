import { Fn, mat4, float, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export const inverseMat4 = /*@__PURE__*/ Fn(([i_matrix]: [ShaderNodeObject<Node>]) => {
  const m = mat4(i_matrix).toVar()
  const a00 = float(m.element(0).element(0)).toVar()
  const a01 = float(m.element(0).element(1)).toVar()
  const a02 = float(m.element(0).element(2)).toVar()
  const a03 = float(m.element(0).element(3)).toVar()
  const a10 = float(m.element(1).element(0)).toVar()
  const a11 = float(m.element(1).element(1)).toVar()
  const a12 = float(m.element(1).element(2)).toVar()
  const a13 = float(m.element(1).element(3)).toVar()
  const a20 = float(m.element(2).element(0)).toVar()
  const a21 = float(m.element(2).element(1)).toVar()
  const a22 = float(m.element(2).element(2)).toVar()
  const a23 = float(m.element(2).element(3)).toVar()
  const a30 = float(m.element(3).element(0)).toVar()
  const a31 = float(m.element(3).element(1)).toVar()
  const a32 = float(m.element(3).element(2)).toVar()
  const a33 = float(m.element(3).element(3)).toVar()

  const b00 = float(a00.mul(a11).sub(a01.mul(a10))).toVar()
  const b01 = float(a00.mul(a12).sub(a02.mul(a10))).toVar()
  const b02 = float(a00.mul(a13).sub(a03.mul(a10))).toVar()
  const b03 = float(a01.mul(a12).sub(a02.mul(a11))).toVar()
  const b04 = float(a01.mul(a13).sub(a03.mul(a11))).toVar()
  const b05 = float(a02.mul(a13).sub(a03.mul(a12))).toVar()
  const b06 = float(a20.mul(a31).sub(a21.mul(a30))).toVar()
  const b07 = float(a20.mul(a32).sub(a22.mul(a30))).toVar()
  const b08 = float(a20.mul(a33).sub(a23.mul(a30))).toVar()
  const b09 = float(a21.mul(a32).sub(a22.mul(a31))).toVar()
  const b10 = float(a21.mul(a33).sub(a23.mul(a31))).toVar()
  const b11 = float(a22.mul(a33).sub(a23.mul(a32))).toVar()
  const det = float(
    b00
      .mul(b11)
      .sub(b01.mul(b10))
      .add(b02.mul(b09))
      .add(b03.mul(b08).sub(b04.mul(b07)))
      .add(b05.mul(b06)),
  ).toVar()

  return mat4(
    a11.mul(b11).sub(a12.mul(b10)).add(a13.mul(b09)),
    a02.mul(b10).sub(a01.mul(b11)).sub(a03.mul(b09)),
    a31.mul(b05).sub(a32.mul(b04)).add(a33.mul(b03)),
    a22.mul(b04).sub(a21.mul(b05)).sub(a23.mul(b03)),
    a12.mul(b08).sub(a10.mul(b11)).sub(a13.mul(b07)),
    a00.mul(b11).sub(a02.mul(b08)).add(a03.mul(b07)),
    a32.mul(b02).sub(a30.mul(b05)).sub(a33.mul(b01)),
    a20.mul(b05).sub(a22.mul(b02)).add(a23.mul(b01)),
    a10.mul(b10).sub(a11.mul(b08)).add(a13.mul(b06)),
    a01.mul(b08).sub(a00.mul(b10)).sub(a03.mul(b06)),
    a30.mul(b04).sub(a31.mul(b02)).add(a33.mul(b00)),
    a21.mul(b02).sub(a20.mul(b04)).sub(a23.mul(b00)),
    a11.mul(b07).sub(a10.mul(b09)).sub(a12.mul(b06)),
    a00.mul(b09).sub(a01.mul(b07)).add(a02.mul(b06)),
    a31.mul(b01).sub(a30.mul(b03)).sub(a32.mul(b00)),
    a20.mul(b03).sub(a21.mul(b01)).add(a22.mul(b00)),
  ).mul(float(1).div(det))
})
