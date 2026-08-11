import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { calculateBiomeTextureCoordinates, renderBiomes } from '@tsl/features/biomes.ts';
import { calculateCracksExtents, renderCracks } from '@tsl/features/cracks.ts';
import { applyXYZTransformations, layer } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import {
  float,
  step,
  vec2,
  vec3,
  vec4,
  min,
  mix,
  uv,
  positionLocal,
  EPSILON,
  uniform,
  uniformArray,
  texture,
} from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  Texture,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
} from 'three/webgpu';

type BakingPlanetSurfaceUniforms = {
  radius: UniformNode<'float', number>;
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
  };
  bump: {
    offset: UniformNode<'float', number>;
    strength: UniformNode<'float', number>;
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
      emissiveIntensity: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec3', Vector3>;
      detailNoise: UniformNode<'vec4', Vector4>;
      limiterNoise: UniformNode<'vec4', Vector4>;
      colorNoise: UniformNode<'vec4', Vector4>;
    };
    biomes: {
      temperatureMode: UniformNode<'float', number>;
      temperatureNoise: UniformNode<'vec4', Vector4>;
      humidityMode: UniformNode<'float', number>;
      humidityNoise: UniformNode<'vec4', Vector4>;
    };
  };
  textures: {
    surface: TextureNode;
    biomes: TextureNode;
    cracks: TextureNode;
  };
};
export class BakingPlanetSurfaceTSLMaterial extends TSLMaterial<MeshBasicNodeMaterial, BakingPlanetSurfaceUniforms> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, textures: Texture[]): BakingPlanetSurfaceUniforms {
    return {
      radius: uniform(data.planetRadius),
      bump: {
        offset: uniform(data.planetSurfaceBumpOffset),
        strength: uniform(data.planetSurfaceBumpStrength),
      },
      flags: uniformArray([
        +data.planetSurfaceShowWarping,
        +data.planetSurfaceShowDisplacement,
        +data.planetSurfaceShowBumps,
        +data.biomesEnabled,
        +data.cracksEnabled,
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
          emissiveIntensity: uniform(data.cracksEmissiveIntensity),
          baseNoise: uniform(
            new Vector3(data.cracksBaseNoise.scale, data.cracksBaseNoise.jitter, data.cracksBaseNoise.mode),
          ),
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
          colorNoise: uniform(
            new Vector4(
              data.cracksColorNoise.frequency,
              data.cracksColorNoise.amplitude,
              data.cracksColorNoise.lacunarity,
              data.cracksColorNoise.octaves,
            ),
          ),
        },
        biomes: {
          temperatureMode: uniform(data.biomesTemperatureMode),
          temperatureNoise: uniform(
            new Vector4(
              data.biomesTemperatureNoise.frequency,
              data.biomesTemperatureNoise.amplitude,
              data.biomesTemperatureNoise.lacunarity,
              data.biomesTemperatureNoise.octaves,
            ),
          ),
          humidityMode: uniform(data.biomesHumidityMode),
          humidityNoise: uniform(
            new Vector4(
              data.biomesHumidityNoise.frequency,
              data.biomesHumidityNoise.amplitude,
              data.biomesHumidityNoise.lacunarity,
              data.biomesHumidityNoise.octaves,
            ),
          ),
        },
      },
      textures: {
        surface: texture(textures[0]),
        biomes: texture(textures[1]),
        cracks: texture(textures[2]),
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
    const heightLimit = float(1).sub(EPSILON);
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).setName('height');
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).setName('FLAG_SURFACE_TYPE');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).setName(
      'FLAG_BIOMES_ENABLED',
    );
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(4)).setName('FLAG_CRACKS_ENABLED');

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).setName('texCoord');
    let colour = vec3(this.uniforms.textures.surface.sample(texCoord).xyz).setName('colour');

    // Render biomes
    const biomeTexCoord = calculateBiomeTextureCoordinates(
      vPos,
      heightLimit,
      this.uniforms.features.biomes.temperatureMode,
      this.uniforms.features.biomes.temperatureNoise,
      this.uniforms.features.biomes.humidityMode,
      this.uniforms.features.biomes.humidityNoise,
      FLAG_BIOMES_ENABLED,
    ).toVar('biomeTexCoord');
    colour = renderBiomes(colour, this.uniforms.textures.biomes, biomeTexCoord, FLAG_BIOMES_ENABLED).toVec3();

    // Render cracks
    const cracksExtents = calculateCracksExtents(
      vPos,
      this.uniforms.features.cracks.distanceToEdge,
      this.uniforms.features.cracks.baseNoise,
      this.uniforms.features.cracks.detailNoise,
      this.uniforms.features.cracks.limiterNoise,
    ).toVar('cracksExtents');
    const cracksColour = renderCracks(
      height,
      cracksExtents,
      colour,
      vPos,
      this.uniforms.features.cracks.colorNoise,
      this.uniforms.textures.cracks,
      FLAG_SURFACE_TYPE,
    );
    colour = mix(colour, cracksColour, FLAG_CRACKS_ENABLED).toVec3();

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = vec4(colour, 1);
    return material;
  }
}
