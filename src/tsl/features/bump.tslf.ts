import { float, vec3, cross, normalize, mix, Fn, normalLocal } from 'three/tsl'
import type { UniformNumberNode, UniformVector2Node, UniformVector3Node } from '../types'

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
  ([i_position, i_height, i_dx, i_dy, i_dxHeight, i_dyHeight, i_radius, i_strength]: [UniformVector3Node, UniformNumberNode, UniformVector3Node, UniformVector3Node, UniformVector3Node, UniformVector3Node, UniformNumberNode, UniformNumberNode]) => {
    const hPos = vec3(i_position.mul(i_radius.add(i_height))).toVar()
    const dxPos = vec3(i_position.add(i_dx).mul(i_radius.add(i_dxHeight))).toVar()
    const dyPos = vec3(i_position.add(i_dy).mul(i_radius.add(i_dyHeight))).toVar()
    const bumpN = vec3(normalize(cross(dyPos.sub(hPos), dxPos.sub(hPos)))).toVar()
    return normalize(mix(normalLocal, bumpN, i_strength))
  },
)
