import { Fn, float, int, mat3, mul, normalize, vec3 } from 'three/tsl'
import type { UniformMatrix3Node, UniformNumberNode } from '../types'

export const sobel = Fn(([i_heights, i_strength]: [UniformMatrix3Node, UniformNumberNode]) => {
  const scale = float(128).mul(i_strength).toVar()
  const heights = mat3(i_heights).toVar()
  const sobelX = float(
    scale.add(
      heights
        .element(int(0))
        .sub(heights.element(int(2)))
        .add(mul(2.0, heights.element(int(3))).sub(mul(2.0, heights.element(int(5)))))
        .add(heights.element(int(6)).sub(heights.element(int(8)))),
    ),
  ).toVar()
  const sobelY = float(
    scale.sub(
      heights
        .element(int(0))
        .add(mul(2.0, heights.element(int(1))))
        .add(
          heights
            .element(int(2))
            .sub(heights.element(int(6)))
            .sub(mul(2.0, heights.element(int(7))))
            .sub(heights.element(int(8))),
        ),
    ),
  ).toVar()
  return vec3(
    normalize(vec3(sobelX, sobelY, 1.0))
      .mul(0.5)
      .add(0.5),
  )
})
