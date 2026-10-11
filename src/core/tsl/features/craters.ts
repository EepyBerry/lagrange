import { voronoi3 } from '@tsl/noise/voronoi3.ts';
import { Fn, float, vec2, mix, normalize, struct } from 'three/tsl';
import { Node, StructNode, TextureNode } from 'three/webgpu';
import { fbm3 } from '../noise/fbm3';

export const CratersInput = struct({
  detailNoiseStrength: 'float',
  baseNoise: 'vec2',
  detailNoise: 'vec4',
});

export const calculateCratersHeight = /*@__PURE__*/ Fn(
  ([i_vPos, i_height, i_tex, i_cratersInput]: [Node<'vec3'>, Node<'float'>, TextureNode, StructNode]) => {
    const detailNoiseStrength = <Node<'float'>>i_cratersInput.get('detailNoiseStrength');
    const baseNoise = <Node<'vec2'>>i_cratersInput.get('baseNoise');
    const detailNoise = <Node<'vec4'>>i_cratersInput.get('detailNoise');

    const zeroCraterHeight = float(i_tex.sample(vec2(1)).x);
    const craterHeight = mix(
      voronoi3(normalize(i_vPos).mul(baseNoise.x), baseNoise.y, 0),
      fbm3(normalize(i_vPos), detailNoise),
      detailNoiseStrength,
    );
    craterHeight.assign(i_tex.sample(vec2(craterHeight, 0.5)));

    const result = float(i_height);
    result.subAssign(craterHeight.negate().add(zeroCraterHeight));
    return result;
  },
);
