import { float, Fn, If, mix, mul, step, vec2, vec3, vec4 } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';

export const applyEmissiveIntensity = /*@__PURE__*/ Fn(
  ([i_color, i_emissiveParams, biomeTex, biomeEmissiveTex, i_biomeTexCoord, i_showEmissive, i_FLAG_SURFACE_TYPE]: [
    Node<'vec3'>,
    Node<'vec2'>,
    TextureNode,
    TextureNode,
    Node<'vec2'>,
    Node<'float'>,
    Node<'float'>,
  ]) => {
    const color = vec3(i_color).toVar('emissiveColor');
    const emissiveParams = vec2(i_emissiveParams).toVar('emissiveParams');
    const flippedBiomeTexCoord = vec2(i_biomeTexCoord.y, i_biomeTexCoord.x).setName('flippedBiomeTexCoord');
    const showEmissive = float(i_showEmissive).toVar('showEmissive');
    const flagSurfaceType = float(i_FLAG_SURFACE_TYPE).toVar('flagSurfaceType');

    If(flagSurfaceType.equal(1), () => {
      // calculate emissive
      // note: X/Y axes are flipped on texture, so we must also flip coords when sampling
      const biomeEmissiveTexel = vec4(biomeEmissiveTex.sample(flippedBiomeTexCoord)).toVar('biomeEmissiveTexel');
      const emissiveFactor = mix(emissiveParams.y, biomeEmissiveTexel.y.mul(10), biomeEmissiveTexel.w).toVar(
        'emissiveFactor',
      );

      // override color to biome value if we're on a biome
      const biomeColor = vec3(biomeTex.sample(flippedBiomeTexCoord).xyz).setName('biomeTexel');
      color.assign(mix(color, biomeColor, step(1e-3, biomeEmissiveTexel.w)));

      // assign and return
      color.mulAssign(mul(showEmissive, emissiveFactor));
    }).Else(() => {
      color.mulAssign(mul(showEmissive, emissiveParams.x));
    });
    return color;
  },
);
