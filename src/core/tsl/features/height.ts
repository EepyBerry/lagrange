import type { StructNode, TextureNode } from 'three/webgpu';
import { calculateCracksExtents, calculateCracksHeight } from '@tsl/features/cracks.ts';
import { calculateCratersHeight } from '@tsl/features/craters.ts';
import { layer } from '@tsl/features/lwd.ts';
import { float, Fn, If, struct, vec2 } from 'three/tsl';
import { Node } from 'three/webgpu';

export const HeightOutput = struct(
  {
    height: 'float',
    heightBeforeCracks: 'float',
    cracksExtents: 'vec2',
  },
  'HeightOutput',
);

export const calculateTotalHeight = /*@__PURE__*/ Fn(
  ([
    i_p,
    i_surfaceNoise,
    i_layers,
    i_cratersTex,
    i_cratersInput,
    i_cracksInput,
    FLAG_CRATERS_ENABLED,
    FLAG_CRACKS_ENABLED,
  ]: [
    Node<'vec3'>,
    Node<'vec4'>,
    Node<'float'>,
    TextureNode,
    StructNode,
    StructNode,
    Node<'float'>,
    Node<'float'>,
  ]) => {
    const totalHeight = layer(i_p, i_surfaceNoise, i_layers);
    If(FLAG_CRATERS_ENABLED.greaterThan(0.5), () => {
      totalHeight.assign(calculateCratersHeight(i_p, totalHeight, i_cratersTex, i_cratersInput));
    });

    const heightBeforeCracks = float(totalHeight).toVar();
    const cracksExtents = vec2(0);
    If(FLAG_CRACKS_ENABLED.greaterThan(0.5), () => {
      cracksExtents.assign(calculateCracksExtents(i_p, i_cracksInput));
      totalHeight.assign(calculateCracksHeight(totalHeight, cracksExtents, FLAG_CRACKS_ENABLED));
    });

    return HeightOutput(totalHeight, heightBeforeCracks, cracksExtents);
  },
);
