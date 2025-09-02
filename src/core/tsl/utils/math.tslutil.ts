import { Fn, mat4, float, type ShaderNodeObject, int } from 'three/tsl'
import type { Matrix3, Node, VaryingNode } from 'three/webgpu'
import type { UniformNumberNode } from '../types'

export const inverseMat4 = /*@__PURE__*/ Fn(([i_matrix]: [ShaderNodeObject<Node>]) => {
  const m = mat4(i_matrix).toVar('m')
  const a00 = float(getMatrixElement(m,0,0)).toVar('a00')
  const a01 = float(getMatrixElement(m,0,1)).toVar('a01')
  const a02 = float(getMatrixElement(m,0,2)).toVar('a02')
  const a03 = float(getMatrixElement(m,0,3)).toVar('a03')
  const a10 = float(getMatrixElement(m,1,0)).toVar('a10')
  const a11 = float(getMatrixElement(m,1,1)).toVar('a11')
  const a12 = float(getMatrixElement(m,1,2)).toVar('a12')
  const a13 = float(getMatrixElement(m,1,3)).toVar('a13')
  const a20 = float(getMatrixElement(m,2,0)).toVar('a20')
  const a21 = float(getMatrixElement(m,2,1)).toVar('a21')
  const a22 = float(getMatrixElement(m,2,2)).toVar('a22')
  const a23 = float(getMatrixElement(m,2,3)).toVar('a23')
  const a30 = float(getMatrixElement(m,3,0)).toVar('a30')
  const a31 = float(getMatrixElement(m,3,1)).toVar('a31')
  const a32 = float(getMatrixElement(m,3,2)).toVar('a32')
  const a33 = float(getMatrixElement(m,3,3)).toVar('a33')

  const b00 = float(a00.mul(a11).sub(a01.mul(a10))).toVar('b00')
  const b01 = float(a00.mul(a12).sub(a02.mul(a10))).toVar('b01')
  const b02 = float(a00.mul(a13).sub(a03.mul(a10))).toVar('b02')
  const b03 = float(a01.mul(a12).sub(a02.mul(a11))).toVar('b03')
  const b04 = float(a01.mul(a13).sub(a03.mul(a11))).toVar('b04')
  const b05 = float(a02.mul(a13).sub(a03.mul(a12))).toVar('b05')
  const b06 = float(a20.mul(a31).sub(a21.mul(a30))).toVar('b06')
  const b07 = float(a20.mul(a32).sub(a22.mul(a30))).toVar('b07')
  const b08 = float(a20.mul(a33).sub(a23.mul(a30))).toVar('b08')
  const b09 = float(a21.mul(a32).sub(a22.mul(a31))).toVar('b09')
  const b10 = float(a21.mul(a33).sub(a23.mul(a31))).toVar('b10')
  const b11 = float(a22.mul(a33).sub(a23.mul(a32))).toVar('b11')
  const det = float(
    b00
      .mul(b11)
      .sub(b01.mul(b10))
      .add(b02.mul(b09))
      .add(b03.mul(b08).sub(b04.mul(b07)))
      .add(b05.mul(b06)),
  ).toVar('det')

  return mat4(
    // @ts-expect-error: Invalid type definitions for mat4(...) using nodes
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
}).setLayout({
  name: 'LG_MATH_inverseMat4',
  inputs: [{ name: 'i_matrix', type: 'mat4' }],
  type: 'mat4',
})

export const clampToRange = /*@__PURE__*/ Fn(
  ([i_v, i_min, i_max]: [ShaderNodeObject<VaryingNode>, UniformNumberNode, UniformNumberNode]) => {
    return i_v.sub(i_min).div(i_max.sub(i_min))
  },
).setLayout({
  name: 'LG_MATH_clampToRange',
  type: 'float',
  inputs: [
    { name: 'v', type: 'float' },
    { name: 'min', type: 'float' },
    { name: 'max', type: 'float' },
  ],
})

// --------------------------- TypeScript functions ---------------------------

export function getMatrixElement(matrix: ShaderNodeObject<Node>, x: number, y: number): ShaderNodeObject<Node> {
  return matrix.element(int(x)).element(int(y))
}