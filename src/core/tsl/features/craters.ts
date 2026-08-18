import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { Fn, float, vec2, mix, normalize, struct } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';
import { fbm3 } from '../noise/fbm3';

export const CratersInput = struct({
  baseNoise: 'vec2',
  detailNoise: 'vec4',
});

export const calculateCratersHeight = /*@__PURE__*/ Fn(
  ([i_vPos, i_height, i_tex, i_baseNoise, i_detailNoise]: [
    Node<'vec3'>,
    Node<'float'>,
    TextureNode,
    Node<'vec2'>,
    Node<'vec4'>,
  ]) => {
    const zeroCraterHeight = float(i_tex.sample(vec2(1)).x);
    const craterHeight = mix(
      voronoi3(normalize(i_vPos).mul(i_baseNoise.x), i_baseNoise.y, 0),
      fbm3(normalize(i_vPos), i_detailNoise),
      0.25,
    );
    craterHeight.assign(i_tex.sample(vec2(craterHeight, 0.5)));

    const result = float(i_height);
    result.subAssign(craterHeight.negate().add(zeroCraterHeight));
    return result;
  },
);
