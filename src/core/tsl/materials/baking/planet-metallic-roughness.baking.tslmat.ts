import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { NullCracksInput } from '@tsl/features/cracks.ts';
import { applyXYZTransformations } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { step, vec4, mix, uv, positionLocal, uniform, uniformArray, texture, float } from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  Texture,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector2,
  Vector3,
  Vector4,
  Node,
} from 'three/webgpu';
import { CratersInput } from '../../features/craters';
import { calculateTotalHeight } from '../../features/height';

type BakingPlanetMetallicRoughnessUniforms = {
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
    metallicRoughness: UniformNode<'vec4', Vector4>;
  };
  surface: {
    noise: UniformNode<'vec4', Vector4>;
    warping: UniformNode<'vec4', Vector4>;
    displacement: {
      params: UniformNode<'vec3', Vector3>;
      noise: UniformNode<'vec4', Vector4>;
    };
  };
  features: {
    craters: {
      detailNoiseStrength: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec2', Vector2>;
      detailNoise: UniformNode<'vec4', Vector4>;
    };
  };
  textures: {
    craters: TextureNode;
  };
};
export class BakingPlanetMetallicRoughnessTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetMetallicRoughnessUniforms
> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, initTextures: Texture[]): BakingPlanetMetallicRoughnessUniforms {
    return {
      flags: uniformArray([
        +data.planetSurfaceShowWarping,
        +data.planetSurfaceShowDisplacement,
        +data.cracksEnabled,
        +data.cratersEnabled,
      ]),
      pbr: {
        waterLevel: uniform(data.planetWaterLevel),
        metallicRoughness: uniform(
          new Vector4(
            data.planetWaterRoughness,
            data.planetWaterMetalness,
            data.planetGroundRoughness,
            data.planetGroundMetalness,
          ),
        ),
      },
      surface: {
        noise: uniform(
          new Vector4(
            data.planetSurfaceNoise.frequency,
            data.planetSurfaceNoise.amplitude,
            data.planetSurfaceNoise.lacunarity,
            data.planetSurfaceNoise.octaves,
          ),
        ),
        warping: uniform(
          new Vector4(
            data.planetSurfaceNoise.layers,
            data.planetSurfaceNoise.warpFactor.x,
            data.planetSurfaceNoise.warpFactor.y,
            data.planetSurfaceNoise.warpFactor.z,
          ),
        ),
        displacement: {
          params: uniform(
            new Vector3(
              data.planetSurfaceDisplacement.factor,
              data.planetSurfaceDisplacement.epsilon,
              data.planetSurfaceDisplacement.multiplier,
            ),
          ),
          noise: uniform(
            new Vector4(
              data.planetSurfaceDisplacement.frequency,
              data.planetSurfaceDisplacement.amplitude,
              data.planetSurfaceDisplacement.lacunarity,
              data.planetSurfaceDisplacement.octaves,
            ),
          ),
        },
      },
      features: {
        craters: {
          detailNoiseStrength: uniform(data.cratersDetailNoiseStrength),
          baseNoise: uniform(new Vector2(data.cratersBaseNoise.scale, data.cratersBaseNoise.jitter)),
          detailNoise: uniform(
            new Vector4(
              data.cratersDetailNoise.frequency,
              data.cratersDetailNoise.amplitude,
              data.cratersDetailNoise.lacunarity,
              data.cratersDetailNoise.octaves,
            ),
          ),
        },
      },
      textures: {
        craters: texture(initTextures[0]),
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
    // XYZ Warping + displacement
    const vPos = applyXYZTransformations(
      positionLocal,
      this.uniforms.surface.warping,
      this.uniforms.flags.element(0),
      this.uniforms.surface.displacement.params,
      this.uniforms.surface.displacement.noise,
      this.uniforms.flags.element(1),
    );

    // heightmap & features
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(2)).toVar('FLAG_CRACKS_ENABLED');
    const FLAG_CRATERS_ENABLED = float(this.uniforms.flags.element(3)).toVar('FLAG_CRATERS_ENABLED');
    const surfaceData = calculateTotalHeight(
      vPos,
      this.uniforms.surface.noise,
      this.uniforms.surface.warping.x,
      this.uniforms.textures.craters,
      CratersInput(
        this.uniforms.features.craters.detailNoiseStrength,
        this.uniforms.features.craters.baseNoise,
        this.uniforms.features.craters.detailNoise,
      ),
      NullCracksInput,
      FLAG_CRATERS_ENABLED,
      FLAG_CRACKS_ENABLED,
    );

    const heightBeforeCracks = float(<Node<'float'>>surfaceData.get('heightBeforeCracks')).toVar('heightBeforeCracks');
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, heightBeforeCracks).toVar('FLAG_SURFACE_TYPE');

    // render PBR as green/blue mask
    const outRoughness = mix(
      this.uniforms.pbr.metallicRoughness.x,
      this.uniforms.pbr.metallicRoughness.z,
      FLAG_SURFACE_TYPE,
    );
    const outMetalness = mix(
      this.uniforms.pbr.metallicRoughness.y,
      this.uniforms.pbr.metallicRoughness.w,
      FLAG_SURFACE_TYPE,
    );

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(0, outRoughness, outMetalness, 1);
    return material;
  }
}
