import type { Node, StructNode, TextureNode } from 'three/webgpu';
import { fbm3 } from '@tsl/noise/fbm3.ts';
import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { stretchedExp } from '@tsl/utils/math.tsl.ts';
import { float, Fn, If, mix, remapClamp, struct, vec2, vec3, vec4 } from 'three/tsl';

export const CracksInput = struct(
  {
    distanceToEdge: 'float',
    detailNoiseStrength: 'float',
    baseNoise: 'vec2',
    detailNoise: 'vec4',
    limiterNoise: 'vec4',
  },
  'CracksInput',
);
export const CracksOutput = struct({ fragmentColor: 'vec3', textureColor: 'vec3' });

export const calculateCracksExtents = /*@__PURE__*/ Fn(
  ([vPos, cracksInput]: [Node<'vec3'>, StructNode]) => {
    const distanceToEdge = float(<Node<'float'>>cracksInput.get('distanceToEdge')).toVar('distanceToEdge');
    const detailNoiseStrength = float(<Node<'float'>>cracksInput.get('detailNoiseStrength')).toVar(
      'detailNoiseStrength',
    );
    const baseNoise = vec2(<Node<'vec2'>>cracksInput.get('baseNoise')).toVar('baseNoise');
    const detailNoise = vec4(<Node<'vec4'>>cracksInput.get('detailNoise')).toVar('detailNoise');
    const limiterNoise = vec4(<Node<'vec4'>>cracksInput.get('limiterNoise')).toVar('limiterNoise');

    const detail = mix(vPos, vPos.mul(fbm3(vPos, detailNoise)), detailNoiseStrength).toVar('detailPos');
    const limiter = stretchedExp(fbm3(vPos, limiterNoise), 0.5, 20).toVar('limitedPos');
    const cellCenterDistance = voronoi3(detail.mul(baseNoise.x), baseNoise.y, 1).toVar('cellCenterDist');

    const extent = remapClamp(cellCenterDistance, 0, distanceToEdge.mul(baseNoise.x), 1, 0).toVar('extent');
    return vec2(extent, limiter);
  },
  {
    name: 'LG_CRACKS_calculateCracksExtents',
    type: 'vec2',
    inputs: [
      { name: 'vPos', type: 'vec3' },
      { name: 'cracksInput', type: 'CracksInput' },
    ],
  },
);

export const calculateCracksHeight = /*@__PURE__*/ Fn(
  ([i_height, i_extents, i_FLAG_CRACKS_ENABLED]: [Node<'float'>, Node<'vec2'>, Node<'float'>]) => {
    const height = float(i_height).toVar('height');
    const extents = vec2(i_extents).toVar('extents');
    const FLAG_CRACKS_ENABLED = float(i_FLAG_CRACKS_ENABLED).toVar('FLAG_CRACKS_ENABLED');

    const cracksHeight = mix(height, 0, extents.x).toVar('cracksHeight');
    const limitedCracksHeight = mix(height, cracksHeight, extents.y).setName('limitedCracksHeight');
    return mix(height, limitedCracksHeight, FLAG_CRACKS_ENABLED);
  },
  {
    name: 'LG_CRACKS_calculateCracksHeight',
    type: 'float',
    inputs: [
      { name: 'i_height', type: 'float' },
      { name: 'i_extents', type: 'vec2' },
      { name: 'i_FLAG_CRACKS_ENABLED', type: 'float' },
    ],
  },
);

export const renderCracks = /*@__PURE__*/ Fn(
  ([cracksExtents, color, vPos, colorNoise, baseTexture, underwaterStrength, FLAG_SURFACE_TYPE]: [
    Node<'vec2'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec4'>,
    TextureNode,
    Node<'float'>,
    Node<'float'>,
  ]) => {
    // compute cracks color
    const cracksColorNoiseHeight = fbm3(vPos, colorNoise).toVar('cracksColorNoiseHeight');
    const cracksColorNoiseColor = vec3(baseTexture.sample(vec2(cracksColorNoiseHeight, 0.5)).xyz).toVar(
      'cracksColorNoiseColor',
    );

    // if underwater, set the strength of the cracks' color by the given value
    // if on land, just display the cracks as-is
    const cracksColor = vec3(0).toVar('cracksColor');
    If(FLAG_SURFACE_TYPE.greaterThan(0.5), () => {
      cracksColor.assign(mix(color, cracksColorNoiseColor, cracksExtents.x));
    }).Else(() => {
      cracksColor.assign(mix(color, mix(color, cracksColorNoiseColor, cracksExtents.x), underwaterStrength));
    });
    return CracksOutput(mix(color, cracksColor, cracksExtents.y), cracksColorNoiseColor);
  },
);
