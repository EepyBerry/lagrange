import type { Node, TextureNode } from 'three/webgpu';
import { fbm3 } from '@tsl/noise/fbm3.ts';
import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { stretchedExp } from '@tsl/utils/math.tsl.ts';
import { Fn, If, mix, remapClamp, struct, vec2, vec3 } from 'three/tsl';

const CracksData = struct({ fragmentColor: 'vec3', textureColor: 'vec3' });

export const calculateCracksExtents = /*@__PURE__*/ Fn(
  ([vPos, distanceToEdge, detailNoiseStrength, baseNoise, detailNoise, limiterNoise]: [
    Node<'vec3'>,
    Node<'float'>,
    Node<'float'>,
    Node<'vec3'>,
    Node<'vec4'>,
    Node<'vec4'>,
  ]) => {
    const detail = mix(vPos, vPos.mul(fbm3(vPos, detailNoise)), detailNoiseStrength).toVar('detailPos');
    const limiter = stretchedExp(fbm3(vPos, limiterNoise), 0.5, 20).toVar('limitedPos');
    const cellCenterDistance = voronoi3(detail.mul(baseNoise.x), baseNoise.y).toVar('cellCenterDist');

    const extent = remapClamp(cellCenterDistance, 0, distanceToEdge.mul(baseNoise.x), 1, 0).toVar('extent');
    return vec2(extent, limiter);
  },
).setLayout({
  name: 'LG_CRACKS_calculateCracksPlacement',
  type: 'vec2',
  inputs: [
    { name: 'vPos', type: 'vec3' },
    { name: 'distanceToEdge', type: 'float' },
    { name: 'detailNoiseStrength', type: 'float' },
    { name: 'baseNoise', type: 'vec3' },
    { name: 'detailNoise', type: 'vec4' },
    { name: 'limiterNoise', type: 'vec4' },
  ],
});

export const renderCracks = /*@__PURE__*/ Fn(
  ([
    height,
    cracksExtents,
    color,
    vPos,
    colorNoise,
    baseTexture,
    underwaterStrength,
    FLAG_SURFACE_TYPE,
    FLAG_CRACKS_ENABLED,
  ]: [
    Node<'float'>,
    Node<'vec2'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec4'>,
    TextureNode,
    Node<'float'>,
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
    If(FLAG_SURFACE_TYPE.equal(1), () => {
      cracksColor.assign(mix(color, cracksColorNoiseColor, cracksExtents.x));
    }).Else(() => {
      cracksColor.assign(mix(color, mix(color, cracksColorNoiseColor, cracksExtents.x), underwaterStrength));
    });

    // change base height to emulate depth (with limiter), then return
    const cracksHeight = mix(height, 0, cracksExtents.x).toVar('cracksHeight');
    const limitedCracksHeight = mix(height, cracksHeight, cracksExtents.y).setName('limitedCracksHeight');
    height.assign(mix(height, limitedCracksHeight, FLAG_CRACKS_ENABLED));

    // return final color
    const result = mix(color, cracksColor, cracksExtents.y).toVar('cracksResult');
    return CracksData(result, cracksColorNoiseColor);
  },
);
