import { fbm3 } from '@tsl/noise/fbm3.ts';
import { float, Fn, vec2, min, vec3, EPSILON } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';

export const calculateCloudsOpacity = /*@__PURE__*/ Fn(
  ([position, noise, texture]: [Node<'vec3'>, Node<'vec4'>, TextureNode]) => {
    const DVEC_A = vec3(0.1, 0.1, 0).toVar('DVEC_A');
    const DVEC_B = vec3(0.2, 0.2, 0).toVar('DVEC_B');

    const fOpacity = vec3(
      fbm3(position, noise),
      fbm3(position.add(DVEC_A), noise),
      fbm3(position.add(DVEC_B), noise),
    ).toVar('fOpacity');
    const opacity = vec3(fbm3(position.add(fOpacity), noise)).toVar('opacity');
    const texCoords = vec2(min(float(1).sub(EPSILON), opacity.x)).toVar('texCoords');
    return texture.sample(texCoords).xyz;
  },
);
