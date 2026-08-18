import { float, Fn, If, mix, step, vec2, vec3, vec4 } from 'three/tsl';
import { Node, TextureNode } from 'three/webgpu';

export const applyBaseEmissive = /*@__PURE__*/ Fn(
  ([i_color, i_emissiveParams, i_FLAG_SURFACE_TYPE]: [Node<'vec3'>, Node<'vec2'>, Node<'float'>]) => {
    const color = vec3(i_color).toVar('emissiveColor');
    const emissiveParams = vec2(i_emissiveParams).toVar('emissiveParams');
    const flagSurfaceType = float(i_FLAG_SURFACE_TYPE).toVar('flagSurfaceType');

    return color.mul(mix(emissiveParams.x, emissiveParams.y, flagSurfaceType));
  },
  {
    name: 'LG_EMISSIVE_applyBaseEmissive',
    type: 'vec3',
    inputs: [
      { name: 'i_color', type: 'vec3' },
      { name: 'i_emissiveParams', type: 'vec2' },
      { name: 'i_FLAG_SURFACE_TYPE', type: 'float' },
    ],
  },
);

export const applyBiomesEmissive = /*@__PURE__*/ Fn(
  ([i_color, i_emissiveParams, biomeTex, biomeEmissiveTex, i_biomeTexCoord, i_FLAG_SURFACE_TYPE]: [
    Node<'vec3'>,
    Node<'vec2'>,
    TextureNode,
    TextureNode,
    Node<'vec2'>,
    Node<'float'>,
  ]) => {
    const color = vec3(i_color).toVar('emissiveColor');
    const emissiveParams = vec2(i_emissiveParams).toVar('emissiveParams');
    const flippedBiomeTexCoord = vec2(i_biomeTexCoord.y, i_biomeTexCoord.x).setName('flippedBiomeTexCoord');
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
      color.mulAssign(emissiveFactor);
    });
    return color;
  },
);

export const applyCracksEmissive = /*@__PURE__*/ Fn(
  ([i_color, i_cracksColor, i_extents, i_emissiveIntensity, i_underwaterStrength, i_FLAG_SURFACE_TYPE]: [
    Node<'vec3'>,
    Node<'vec3'>,
    Node<'vec2'>,
    Node<'float'>,
    Node<'float'>,
    Node<'float'>,
  ]) => {
    const emissiveColor = vec3(i_color).toVar('emissiveColor');
    const cracksColor = vec3(i_cracksColor).toVar('cracksColor');
    const extents = vec2(i_extents).toVar('cracksExtents');
    const cracksEmissiveIntensity = float(i_emissiveIntensity).toVar('cracksEmissiveIntensity');
    const cracksUnderwaterStrength = float(i_underwaterStrength).toVar('cracksUnderwaterStrength');
    const FLAG_SURFACE_TYPE = float(i_FLAG_SURFACE_TYPE).toVar('FLAG_SURFACE_TYPE');

    // override color to cracks value if we're on a biome
    const result = vec3(0).toVar('result');
    If(FLAG_SURFACE_TYPE.equal(1), () => {
      result.assign(mix(emissiveColor, cracksColor.mul(cracksEmissiveIntensity), extents.x.mul(extents.y)));
    }).Else(() => {
      const emissiveValue = mix(emissiveColor, cracksColor.mul(cracksEmissiveIntensity), extents.x.mul(extents.y));
      result.assign(mix(emissiveColor, emissiveValue, cracksUnderwaterStrength));
    });
    return result;
  },
  {
    name: 'LG_EMISSIVE_applyCracksEmissive',
    type: 'vec3',
    inputs: [
      { name: 'i_color', type: 'vec3' },
      { name: 'i_cracksColor', type: 'vec3' },
      { name: 'i_cracksExtents', type: 'vec2' },
      { name: 'i_emissiveIntensity', type: 'float' },
      { name: 'i_underwaterStrength', type: 'float' },
      { name: 'i_FLAG_SURFACE_TYPE', type: 'float' },
    ],
  },
);
