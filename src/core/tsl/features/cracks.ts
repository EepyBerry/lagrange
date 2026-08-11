import type { Node, TextureNode } from 'three/webgpu';
import { fbm3 } from '@tsl/noise/fbm3.ts';
import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { stretchedExp } from '@tsl/utils/math.tsl.ts';
import { Fn, If, mix, remapClamp, vec2, vec3 } from 'three/tsl';

export const calculateCracksExtents = /*@__PURE__*/ Fn(
  ([vPos, distanceToEdge, baseNoise, detailNoise, limiterNoise]: [
    Node<'vec3'>,
    Node<'float'>,
    Node<'vec3'>,
    Node<'vec4'>,
    Node<'vec4'>,
  ]) => {
    const detail = vPos.mul(fbm3(vPos, detailNoise)).toVar('detailPos');
    const limiter = stretchedExp(fbm3(vPos, limiterNoise), 0.5, 10).toVar('limitedPos');
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
    { name: 'baseNoise', type: 'vec3' },
    { name: 'detailNoise', type: 'vec4' },
    { name: 'limiterNoise', type: 'vec4' },
  ],
});

export const renderCracks = /*@__PURE__*/ Fn(
  ([height, cracksExtents, color, vPos, colorNoise, baseTexture, FLAG_SURFACE_TYPE]: [
    Node<'float'>,
    Node<'vec2'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec4'>,
    TextureNode,
    Node<'float'>,
  ]) => {
    // compute cracks color
    const cracksColorNoiseHeight = fbm3(vPos, colorNoise);
    const cracksColorNoiseColor = vec3(baseTexture.sample(vec2(cracksColorNoiseHeight, 0.5)).xyz);

    // if underwater, reduce the strength of the cracks' color by an arbitrary number
    // if on land, just display the cracks as-is
    const result = vec3(0).toVar('cracksResult');
    If(FLAG_SURFACE_TYPE.equal(1), () => {
      result.assign(mix(color, cracksColorNoiseColor, cracksExtents.x));
    }).Else(() => {
      result.assign(mix(color, mix(color, cracksColorNoiseColor, cracksExtents.x), 0.025));
    });

    // change base height to emulate depth, then return
    height.assign(mix(height, mix(height, 0, cracksExtents.x), cracksExtents.y));
    return mix(color, result, cracksExtents.y);
  },
); /*.setLayout({
  name: 'LG_CRACKS_computeCracks',
  type: 'vec3',
  inputs: [
    { name: 'color', type: 'vec3' },
    { name: 'vPos', type: 'vec3' },
    { name: 'baseNoise', type: 'vec3' },
    { name: 'detailNoise', type: 'vec4' },
    { name: 'colorNoise', type: 'vec4' },
    { name: 'baseTexture', type: 'texture2D' },
    { name: 'distanceToEdge', type: 'float' },
  ],
});*/
