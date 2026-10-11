import { clampToRange } from '@tsl/utils/math.tsl.ts';
import { float, Fn, vec2, length } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';

export const sampleRampTexture = Fn(
  ([pos, innerRadius, outerRadius, texture]: [Node<'vec3'>, Node<'float'>, Node<'float'>, TextureNode]) => {
    const distanceToCenter = length(pos.xy).toVar('distanceToCenter');
    const rampFactor = float(clampToRange(distanceToCenter, innerRadius, outerRadius)).toVar('rampFactor');
    const texCoord = vec2(rampFactor, 0.5).toVar('texCoord');
    return texture.sample(texCoord);
  },
);
