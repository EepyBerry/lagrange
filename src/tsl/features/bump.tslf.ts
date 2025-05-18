import { float, vec3, cross, normalize, mix, Fn, mul, mat3, normalView } from 'three/tsl'
import type { UniformMatrix3Node, UniformNumberNode, UniformVector3Node } from '../types'

// Transpiled (GLSL) from Daniel Greenheck:
// https://github.com/dgreenheck/threejs-procedural-planets
// ---
// MIT License

// Copyright (c) 2023 Daniel Greenheck

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
export const applyBump = /*@__PURE__*/ Fn(
  ([i_position, i_dx, i_dy, i_height, i_dxHeight, i_dyHeight, i_radius, i_strength]: [
    UniformVector3Node,
    UniformVector3Node,
    UniformVector3Node,
    UniformNumberNode,
    UniformVector3Node,
    UniformVector3Node,
    UniformNumberNode,
    UniformNumberNode,
  ]) => {
    const hPos = vec3(i_position.mul(i_radius.add(i_height))).toVar()
    const dxPos = vec3(i_position.add(i_dx)).mul(i_radius.add(i_dxHeight)).toVar()
    const dyPos = vec3(i_position.add(i_dy)).mul(i_radius.add(i_dyHeight)).toVar()
    const bumpN = vec3(normalize(cross(dyPos.sub(hPos), dxPos.sub(hPos)))).toVar()
    return normalize(mix(normalView, bumpN, i_strength))
  },
)

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
