import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { Fn, float, vec2, mix } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';
import { fbm3 } from '../noise/fbm3';

export const renderCraters = /*@__PURE__*/ Fn(
  ([i_vPos, i_height, i_tex, i_baseNoise, i_detailNoise]: [
    Node<'vec3'>,
    Node<'float'>,
    TextureNode,
    Node<'vec2'>,
    Node<'vec4'>,
  ]) => {
    const zeroCraterHeight = float(sampleCratersTexture(i_tex, vec2(1)).x).toVar('zeroCraterHeight');
    const craterHeight = mix(
      voronoi3(i_vPos.mul(i_baseNoise.x), i_baseNoise.y, 0),
      fbm3(i_vPos, i_detailNoise),
      0.1,
    ).toVar('craterHeight');
    craterHeight.assign(sampleCratersTexture(i_tex, vec2(craterHeight, 0.5)));

    const result = float(i_height).toVar('result');
    result.subAssign(craterHeight.negate().add(zeroCraterHeight));
    return result;
  },
);

export const sampleCratersTexture = /*@__PURE__*/ Fn(([i_tex, i_texCoord]: [TextureNode, Node<'vec2'>]) => {
  return i_tex.sample(i_texCoord);
});
