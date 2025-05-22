import { Fn, float, mat3, mul, normalize, vec3 } from 'three/tsl'
import type { UniformMatrix3Node, UniformNumberNode } from '../types'

export const applyNormalBump = Fn(([i_heights, i_strength]: [UniformMatrix3Node, UniformNumberNode]) => {
  const scale = float(128).mul(i_strength).toVar()
  const heights = mat3(i_heights).toVar()
  const sobelX = float(
    scale.add(
      heights
        .element(0)
        .sub(heights.element(2))
        .add(mul(2.0, heights.element(3)).sub(mul(2.0, heights.element(5))))
        .add(heights.element(6).sub(heights.element(8))),
    ),
  ).toVar()
  const sobelY = float(
    scale.sub(
      heights
        .element(0)
        .add(mul(2.0, heights.element(1)))
        .add(
          heights
            .element(2)
            .sub(heights.element(6))
            .sub(mul(2.0, heights.element(7)))
            .sub(heights.element(8)),
        ),
    ),
  ).toVar()
  return vec3(
    normalize(vec3(sobelX, sobelY, 1.0))
      .mul(0.5)
      .add(0.5),
  )
})
