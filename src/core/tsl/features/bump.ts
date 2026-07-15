import type { Node } from 'three/webgpu';
import { layer } from '@tsl/features/lwd.ts';
import { vec3, cross, normalize, mix, Fn, float, vec4, vec2 } from 'three/tsl';

export const applyBumpMap = Fn(
  ([i_position, i_height, i_meshRadius, i_bump, i_noise, i_warping, i_tangent, i_bitangent, i_normal]: [
    Node<'vec3'>,
    Node<'float'>,
    Node<'float'>,
    Node<'vec2'>,
    Node<'vec4'>,
    Node<'vec4'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec3'>,
  ]) => {
    const vPos = vec3(i_position).toVar('vPos');
    const height = float(i_height).toVar('height');
    const meshRadius = float(i_meshRadius).toVar('meshRadius');
    const bump = vec2(i_bump).toVar('bump');
    const noise = vec4(i_noise).toVar('noise');
    const warping = vec4(i_warping).toVar('warping');
    const tangent = vec3(i_tangent).toVar('tangent');
    const bitangent = vec3(i_bitangent).toVar('bitangent');
    const normal = vec3(i_normal).toVar('normal');

    const dx = vec3(tangent.mul(warping.yzw).mul(bump.x)).toVar('dx');
    const dy = vec3(bitangent.mul(warping.yzw).mul(bump.x)).toVar('dy');
    const dxHeight = float(layer(vPos.add(dx), noise, warping.x)).toVar('dxHeight');
    const dyHeight = float(layer(vPos.add(dy), noise, warping.x)).toVar('dyHeight');
    return vec3(doBump(normal, vPos, dx, dy, height, dxHeight, dyHeight, meshRadius, bump.y));
  },
).setLayout({
  name: 'LG_BUMP_applyBumpMap',
  type: 'vec3',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_height', type: 'float' },
    { name: 'i_meshRadius', type: 'float' },
    { name: 'i_bump', type: 'vec2' },
    { name: 'i_noise', type: 'vec4' },
    { name: 'i_warping', type: 'vec4' },
    { name: 'i_tangent', type: 'vec3' },
    { name: 'i_bitangent', type: 'vec3' },
    { name: 'i_normal', type: 'vec3' },
  ],
});

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
const doBump = /*@__PURE__*/ Fn(
  ([i_normal, i_position, i_dx, i_dy, i_height, i_dxHeight, i_dyHeight, i_radius, i_strength]: [
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'float'>,
    Node<'float'>,
    Node<'float'>,
    Node<'float'>,
    Node<'float'>,
  ]) => {
    const hPos = vec3(i_position.mul(i_radius.add(i_height))).toVar('hPos');
    const dxPos = vec3(i_position.add(i_dx)).mul(i_radius.add(i_dxHeight)).toVar('dxPos');
    const dyPos = vec3(i_position.add(i_dy)).mul(i_radius.add(i_dyHeight)).toVar('dyPos');
    const bumpN = vec3(normalize(cross(dxPos.sub(hPos), dyPos.sub(hPos)))).toVar('bumpN');
    return normalize(mix(i_normal, bumpN, i_strength));
  },
).setLayout({
  name: 'LG_BUMP_applyBump',
  type: 'vec3',
  inputs: [
    { name: 'normal', type: 'vec3' },
    { name: 'pos', type: 'vec3' },
    { name: 'dx', type: 'vec3' },
    { name: 'dy', type: 'vec3' },
    { name: 'height', type: 'float' },
    { name: 'dxHeight', type: 'float' },
    { name: 'dyHeight', type: 'float' },
    { name: 'radius', type: 'float' },
    { name: 'strength', type: 'float' },
  ],
});
