import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { calculateBiomeTextureCoordinates, renderBiomes } from '@tsl/features/biomes.ts';
import { applyEmissiveIntensity } from '@tsl/features/emissive.ts';
import { applyXYZTransformations, layer } from '@tsl/features/lwd.ts';
import { TSLMaterial } from '@tsl/materials/tsl-material.ts';
import { flattenUV } from '@tsl/utils/vertex.tsl.ts';
import {
  step,
  vec4,
  uv,
  positionLocal,
  uniform,
  uniformArray,
  EPSILON,
  float,
  vec2,
  vec3,
  min,
  texture,
} from 'three/tsl';
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

type BakingPlanetEmissivityUniforms = {
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
    metallicRoughness: UniformNode<'vec4', Vector4>;
    emissive: UniformNode<'vec2', Vector2>;
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
    biomesEmissive: TextureNode;
  };
};
export class BakingPlanetEmissivityTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetEmissivityUniforms
> {
  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, textures: Texture[]): BakingPlanetEmissivityUniforms {
    return {
      flags: uniformArray([+data.biomesEnabled, +data.planetShowEmissive]),
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
        emissive: uniform(new Vector2(data.planetWaterEmissiveIntensity, data.planetGroundEmissiveIntensity)),
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
        biomesEmissive: texture(textures[2]),
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
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar();
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar();
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(0)));

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.textures.surface.sample(texCoord).xyz);

    // get biome texcoords for emissivity calculations
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

    // Init material & set outputs
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.fragmentNode = vec4(
      applyEmissiveIntensity(
        colour,
        this.uniforms.pbr.emissive,
        this.uniforms.textures.biomes,
        this.uniforms.textures.biomesEmissive,
        biomeTexCoord,
        float(this.uniforms.flags.element(1)),
        FLAG_SURFACE_TYPE,
      ).xyz,
      1,
    );
    return material;
  }
}
