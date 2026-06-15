import type { Node, TextureNode } from 'three/webgpu';
import { layer } from '@tsl/features/lwd.ts';
import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { Fn, mix, remapClamp, vec2, vec3 } from 'three/tsl';

export const computeCracks = Fn(
  ([color, vPos, baseNoise, detailNoise, _limiterNoise, colorNoise, baseTexture, distanceToEdge]: [
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec4'>,
    Node<'vec4'>,
    Node<'vec4'>,
    TextureNode,
    Node<'float'>,
  ]) => {
    const cracksDistance = voronoi3(vPos.mul(baseNoise.x), baseNoise.y).toVar('cnoise');
    const cracksDetail = layer(vPos, detailNoise, 1);
    const _cracksDistanceMix = mix(cracksDetail, cracksDistance, 0.9);
    const cracksExtent = mix(1, 0, remapClamp(cracksDistance, 0, distanceToEdge, 0, 1));

    const cracksColorNoiseHeight = layer(vPos, colorNoise, 1);
    const cracksColorNoiseColor = vec3(baseTexture.sample(vec2(cracksColorNoiseHeight, 0.5)).xyz);

    return mix(color, cracksColorNoiseColor, cracksExtent);
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
