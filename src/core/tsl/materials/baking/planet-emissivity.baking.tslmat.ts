import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { BiomesInput, calculateBiomeTextureCoordinates } from '@tsl/features/biomes.ts';
import { calculateCracksExtents, CracksInput, renderCracks } from '@tsl/features/cracks.ts';
import { applyBaseEmissive, applyBiomesEmissive, applyCracksEmissive } from '@tsl/features/emissive.ts';
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
  mix,
  Fn,
  struct,
  If,
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
  Node,
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
      underwaterStrength: UniformNode<'float', number>;
      detailNoiseStrength: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec2', Vector2>;
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
    cracks: TextureNode;
  };
};
export class BakingPlanetEmissivityTSLMaterial extends TSLMaterial<
  MeshBasicNodeMaterial,
  BakingPlanetEmissivityUniforms
> {
  private readonly ShaderOutput = struct({
    emissive: 'vec4',
  });

  constructor(initData: SerializedPlanetData, initTextures: Texture[]) {
    super();
    this.uniforms = this.initUniforms(initData, initTextures);
  }

  initUniforms(data: SerializedPlanetData, textures: Texture[]): BakingPlanetEmissivityUniforms {
    return {
      flags: uniformArray([
        +data.planetSurfaceShowWarping,
        +data.planetSurfaceShowDisplacement,
        +data.biomesEnabled,
        +data.cracksEnabled,
        +data.planetShowEmissive,
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
          underwaterStrength: uniform(data.cracksUnderwaterStrength),
          detailNoiseStrength: uniform(data.cracksDetailNoiseStrength),
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
        cracks: texture(textures[3]),
      },
    };
  }

  buildMaterial(): MeshBasicNodeMaterial {
    const shaderOutput = this.runShader();
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.fragmentNode = <Node<'vec4'>>shaderOutput.get('emissive');
    return material;
  }

  private readonly runShader = Fn(() => {
    // define output variables
    const shaderOutput = this.ShaderOutput(vec4(0));

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
    const heightLimit = float(1).sub(EPSILON).toVar('heightLimit');
    const height = layer(vPos, this.uniforms.surface.noise, this.uniforms.surface.warping.x).toVar('height');
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, height).toVar('FLAG_SURFACE_TYPE');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(2))).toVar(
      'FLAG_BIOMES_ENABLED',
    );
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(3)).toVar('FLAG_CRACKS_ENABLED');
    const FLAG_EMISSIVE_ENABLED = float(this.uniforms.flags.element(4)).toVar('FLAG_EMISSIVE_ENABLED');

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    const colour = vec3(this.uniforms.textures.surface.sample(texCoord).xyz).toVar('colour');

    // Calculate biomes data
    const biomeTexCoord = vec2(0).toVar('biomeTexCoord');
    If(FLAG_BIOMES_ENABLED.equal(1), () => {
      biomeTexCoord.assign(
        calculateBiomeTextureCoordinates(
          vPos,
          heightLimit,
          BiomesInput(
            this.uniforms.features.biomes.temperatureMode,
            this.uniforms.features.biomes.temperatureNoise,
            this.uniforms.features.biomes.humidityMode,
            this.uniforms.features.biomes.humidityNoise,
          ),
        ),
      );
    });

    // Calculate cracks data
    const cracksExtents = vec2(0).toVar('cracksExtents');
    const cracksColor = vec3(0).toVar('cracksColour');
    const cracksTextureColor = vec3(0).toVar('cracksTextureColor');
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
      const cracksData = renderCracks(
        height,
        cracksExtents,
        colour,
        vPos,
        this.uniforms.features.cracks.colorNoise,
        this.uniforms.textures.cracks,
        this.uniforms.features.cracks.underwaterStrength,
        FLAG_SURFACE_TYPE,
        FLAG_CRACKS_ENABLED,
      );
      cracksColor.assign(cracksData.get('fragmentColor'));
      cracksTextureColor.assign(cracksData.get('textureColor'));
    });

    // Calculate emissive
    const emissiveColour = vec3(0).toVar('emissiveColour');
    If(FLAG_EMISSIVE_ENABLED.equal(1), () => {
      emissiveColour.assign(applyBaseEmissive(colour, this.uniforms.pbr.emissive, FLAG_SURFACE_TYPE));
      emissiveColour.assign(
        mix(
          emissiveColour,
          applyBiomesEmissive(
            emissiveColour,
            this.uniforms.pbr.emissive,
            this.uniforms.textures.biomes,
            this.uniforms.textures.biomesEmissive,
            biomeTexCoord,
            FLAG_SURFACE_TYPE,
          ),
          FLAG_BIOMES_ENABLED,
        ),
      );
      emissiveColour.assign(
        mix(
          emissiveColour,
          applyCracksEmissive(
            emissiveColour,
            cracksTextureColor,
            cracksExtents,
            this.uniforms.features.cracks.emissiveIntensity,
            this.uniforms.features.cracks.underwaterStrength,
            FLAG_SURFACE_TYPE,
          ),
          FLAG_CRACKS_ENABLED,
        ),
      );
    });

    // Return shader output
    shaderOutput.get('emissive').assign(vec4(emissiveColour, 1));
    return shaderOutput;
  });
}
