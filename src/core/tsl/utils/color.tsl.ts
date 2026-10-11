import type { Node } from 'three/webgpu';
import { float, vec4, sub, mat4, Fn, vec3, sin, cos, mat3, dot } from 'three/tsl';

export const tintToMatrix = /*@__PURE__*/ Fn(([i_tint]: [Node<'vec4'>]) => {
  return mat4(vec4(i_tint.x, 0, 0, 0), vec4(0, i_tint.y, 0, 0), vec4(0, 0, i_tint.z, 0), vec4(0, 0, 0, i_tint.w));
}).setLayout({
  name: 'tintToMatrix',
  type: 'mat4',
  inputs: [{ name: 'i_tint', type: 'vec4' }],
});

export const greyscale = /*@__PURE__*/ Fn(([i_color]: [Node<'vec4'>]) => {
  return i_color.mul(
    mat4(
      vec4(0.2126, 0.7152, 0.0722, 0),
      vec4(0.2126, 0.7152, 0.0722, 0),
      vec4(0.2126, 0.7152, 0.0722, 0),
      vec4(0, 0, 0, 1),
    ),
  );
}).setLayout({
  name: 'greyscale',
  type: 'vec4',
  inputs: [{ name: 'i_color', type: 'vec4' }],
});

export const whitescale = /*@__PURE__*/ Fn(([i_color]: [Node<'vec4'>]) => {
  return greyscale(i_color).mul(2);
}).setLayout({
  name: 'whitescale',
  type: 'vec4',
  inputs: [{ name: 'i_color', type: 'vec4' }],
});

export const shiftHue = /*@__PURE__*/ Fn(([i_color, i_hue]: [Node<'vec3'>, Node<'float'>]) => {
  const s = float(sin(i_hue)).toVar('s');
  const c = float(cos(i_hue)).toVar('c');
  return i_color
    .mul(c)
    .add(
      i_color
        .mul(s)
        .mul(
          mat3(
            vec3(0.167444, 0.329213, float(-0.496657)),
            vec3(float(-0.327948), 0.035669, 0.292279),
            vec3(1.250268, float(-1.047561), float(-0.202707)),
          ),
        ),
    )
    .add(dot(vec3(0.299, 0.587, 0.114), i_color).mul(sub(1, c)));
}).setLayout({
  name: 'shiftHue',
  type: 'vec3',
  inputs: [
    { name: 'i_color', type: 'vec3' },
    { name: 'i_hue', type: 'float' },
  ],
});
