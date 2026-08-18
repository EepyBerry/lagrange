import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { calculateCracksExtents, calculateCracksHeight, CracksInput } from '@tsl/features/cracks.ts';
import { calculateCratersHeight } from '@tsl/features/craters.ts';
import { applyXYZTransformations, layer } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import { step, vec4, uv, positionLocal, uniform, uniformArray, vec3, mix, float, If, vec2, texture } from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  Texture,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector2,
  Vector3,
  Vector4,
} from 'three/webgpu';

type BakingPlanetHeightMapUniforms = {
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
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
    cracks: {
      distanceToEdge: UniformNode<'float', number>;
      detailNoiseStrength: UniformNode<'float', number>;
      emissiveIntensity: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec2', Vector2>;
      detailNoise: UniformNode<'vec4', Vector4>;
      limiterNoise: UniformNode<'vec4', Vector4>;
    };
    craters: {
      baseNoise: UniformNode<'vec2', Vector2>;
      detailNoise: UniformNode<'vec4', Vector4>;
    };
  };
  textures: {
    craters: TextureNode;
  };
};
export class BakingPlanetHeightMapTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetHeightMapUniforms
> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, initTextures: Texture[]): BakingPlanetHeightMapUniforms {
    return {
      flags: uniformArray([
        +data.planetSurfaceShowWarping,
        +data.planetSurfaceShowDisplacement,
        +data.cracksEnabled,
        +data.cratersEnabled,
      ]),
      pbr: {
        waterLevel: uniform(data.planetWaterLevel),
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
        cracks: {
          distanceToEdge: uniform(data.cracksDistanceToEdge),
          detailNoiseStrength: uniform(data.cracksDetailNoiseStrength),
          emissiveIntensity: uniform(data.cracksEmissiveIntensity),
          baseNoise: uniform(new Vector2(data.cracksBaseNoise.scale, data.cracksBaseNoise.jitter)),
          detailNoise: uniform(
            new Vector4(
              data.cracksDetailNoise.frequency,
              data.cracksDetailNoise.amplitude,
              data.cracksDetailNoise.lacunarity,
              data.cracksDetailNoise.octaves,
            ),
          ),
          limiterNoise: uniform(
            new Vector4(
              data.cracksLimiterNoise.frequency,
              data.cracksLimiterNoise.amplitude,
              data.cracksLimiterNoise.lacunarity,
              data.cracksLimiterNoise.octaves,
            ),
          ),
        },
        craters: {
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

    // Heightmap & global flags
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar();
    const FLAG_CRATERS_ENABLED = float(this.uniforms.flags.element(3)).toVar('FLAG_CRATERS_ENABLED');
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(2)).toVar('FLAG_CRACKS_ENABLED');

    // apply cracks and craters calculations
    If(FLAG_CRATERS_ENABLED.equal(1), () => {
      height.assign(
        calculateCratersHeight(
          vPos,
          height,
          this.uniforms.textures.craters,
          this.uniforms.features.craters.baseNoise,
          this.uniforms.features.craters.detailNoise,
        ),
      );
    });

    const cracksExtents = vec2(0);
    If(FLAG_CRACKS_ENABLED.equal(1), () => {
      cracksExtents.assign(
        calculateCracksExtents(
          vPos,
          CracksInput(
            this.uniforms.features.cracks.distanceToEdge,
            this.uniforms.features.cracks.detailNoiseStrength,
            this.uniforms.features.cracks.baseNoise,
            this.uniforms.features.cracks.detailNoise,
            this.uniforms.features.cracks.limiterNoise,
          ),
        ),
      );
      height.assign(calculateCracksHeight(height, cracksExtents, FLAG_CRACKS_ENABLED));
    });

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(mix(vec3(this.uniforms.pbr.waterLevel), vec3(height), FLAG_SURFACE_TYPE), 1);
    return material;
  }
}
