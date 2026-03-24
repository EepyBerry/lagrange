import { vec3, float, mix, Fn, clamp } from 'three/tsl';
import { fbm3 } from '../noise/fbm3';
import type { Node } from 'three/webgpu';
import { fbm1 } from '../noise/fbm1';

export const doDisplace = /*@__PURE__*/ Fn(
  ([i_position, i_params, i_noise]: [Node<'vec3'>, Node<'vec3'>, Node<'vec4'>]) => {
    const vPos = vec3(i_position).toVar('vPos');
    const eps = float(i_params.y).toVar('eps');
    const mul = float(i_params.z).toVar('mul');

    const n1 = float(fbm3(vec3(vPos.x.add(eps), vPos.y, vPos.z), i_noise)).toVar('n1');
    const n2 = float(fbm3(vec3(vPos.x.sub(eps), vPos.y, vPos.z), i_noise)).toVar('n2');
    const dx = float(n1.sub(n2).div(mul.mul(eps))).toVar('dx');

    n1.assign(fbm3(vec3(vPos.x, vPos.y.add(eps), vPos.z), i_noise));
    n2.assign(fbm3(vec3(vPos.x, vPos.y.sub(eps), vPos.z), i_noise));
    const dy = float(n1.sub(n2).div(mul.mul(eps))).toVar('dy');

    n1.assign(fbm3(vec3(vPos.x, vPos.y, vPos.z.add(eps)), i_noise));
    n2.assign(fbm3(vec3(vPos.x, vPos.y, vPos.z.sub(eps)), i_noise));
    const dz = float(n1.sub(n2).div(mul.mul(eps))).toVar('dz');

    return mix(vPos, vec3(dx, dy, dz), i_params.x);
  },
).setLayout({
  name: 'LG_LWD_doDisplace',
  type: 'vec3',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_params', type: 'vec3' },
    { name: 'i_noise', type: 'vec4' },
  ],
});

// ----------------------------------------------------------------------------

export const layer = /*@__PURE__*/ Fn(
  ([i_position, i_noise, i_layers]: [Node<'vec3'>, Node<'vec4'>, Node<'float'>]) => {
    const height = float(fbm3(i_position, i_noise)).toVar('height');
    height.assign(mix(height, fbm1(height, i_noise), clamp(i_layers.sub(1.0), 0.0, 1.0)));
    height.assign(mix(height, fbm1(height, i_noise), clamp(i_layers.sub(2.0), 0.0, 1.0)));
    return height;
  },
).setLayout({
  name: 'LG_LWD_layer',
  type: 'float',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_noise', type: 'vec4' },
    { name: 'i_layers', type: 'int' },
  ],
});

export const warp = /*@__PURE__*/ Fn(
  ([i_position, i_params, i_enable]: [Node<'vec3'>, Node<'vec4'>, Node<'float'>]) => {
    const vPos = vec3(i_position).toVar('vPos');
    vPos.x.mulAssign(mix(1.0, i_params.y, i_enable));
    vPos.y.mulAssign(mix(1.0, i_params.z, i_enable));
    vPos.z.mulAssign(mix(1.0, i_params.w, i_enable));
    return vPos;
  },
).setLayout({
  name: 'LG_LWD_warp',
  type: 'vec3',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_params', type: 'vec4' },
    { name: 'i_enable', type: 'float' },
  ],
});

export const displace = /*@__PURE__*/ Fn(
  ([i_position, i_params, i_noise, i_enable]: [
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec4'>,
    Node<'float'>,
  ]) => {
    const vPos = vec3(i_position).toVar('vPos');
    const enabled = float(i_enable).toVar('enabled');
    return mix(vPos, doDisplace(i_position, i_params, i_noise), enabled);
  },
).setLayout({
  name: 'LG_LWD_displace',
  type: 'vec3',
  inputs: [
    { name: 'i_position', type: 'vec3' },
    { name: 'i_params', type: 'vec3' },
    { name: 'i_noise', type: 'vec4' },
    { name: 'i_enable', type: 'float' },
  ],
});
