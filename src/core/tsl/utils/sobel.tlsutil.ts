import { Fn, float, mat3, mul, normalize, vec3 } from 'three/tsl'
import type { UniformMatrix3Node, UniformNumberNode } from '../types'
import { getMatrixElement } from './math.tslutil'

export const sobel = Fn(([i_heights, i_strength]: [UniformMatrix3Node, UniformNumberNode]) => {
  const scale = float(128).mul(i_strength).toVar('scale')
  const heights = mat3(i_heights).toVar('heights')
  const sobelX = float(
    scale.add(
        getMatrixElement(heights,0,0)
        .sub(getMatrixElement(heights,0,2))
        .add(mul(2.0, getMatrixElement(heights,1,0)).sub(mul(2.0, getMatrixElement(heights,2,2))))
        .add(getMatrixElement(heights,2,0)).sub(getMatrixElement(heights,2,2)),
    ),
  ).toVar('sobelX')
  const sobelY = float(
    scale.sub(
        getMatrixElement(heights,0,0)
        .add(mul(2.0, getMatrixElement(heights,0,1)))
        .add(
            getMatrixElement(heights,0,2)
            .sub(getMatrixElement(heights,2,0))
            .sub(mul(2.0, getMatrixElement(heights,2,1)))
            .sub(getMatrixElement(heights,2,2)),
        ),
    ),
  ).toVar('sobelY')
  return vec3(
    normalize(vec3(sobelX, sobelY, 1.0))
      .mul(0.5)
      .add(0.5),
  )
})
