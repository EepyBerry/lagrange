import type { SerializedPlanetData } from '@core/editor/workers/worker-serializer.types.ts';
import { BiomesInput, calculateBiomeTextureCoordinates, renderBiomes } from '@tsl/features/biomes.ts';
import { calculateCracksHeight, CracksInput, renderCracks } from '@tsl/features/cracks.ts';
import { CratersInput } from '@tsl/features/craters.ts';
import { calculateTotalHeight } from '@tsl/features/height.ts';
import { applyXYZTransformations } from '@tsl/features/lwd.ts';
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
  struct,
  Fn,
  If,
} from 'three/tsl';
import {
  MeshBasicNodeMaterial,
  Texture,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector3,
  Vector4,
  Node,
  Vector2,
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
      underwaterStrength: UniformNode<'float', number>;
      detailNoiseStrength: UniformNode<'float', number>;
      baseNoise: UniformNode<'vec2', Vector2>;
      detailNoise: UniformNode<'vec4', Vector4>;
      limiterNoise: UniformNode<'vec4', Vector4>;
      colorNoise: UniformNode<'vec4', Vector4>;
    };
    craters: {
      baseNoise: UniformNode<'vec2', Vector2>;
      detailNoise: UniformNode<'vec4', Vector4>;
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
    craters: TextureNode;
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
        craters: texture(textures[3]),
      },
    };
  }

  // --------------------------------------------------
  // |               Shading functions                |
  // --------------------------------------------------

  // Pre-defined common shader structs
  private readonly ShaderOutput = struct({
    color: 'vec4',
  });
  private readonly HeightData = struct(
    {
      height: 'float',
      cracksExtents: 'vec2',
    },
    'HeightData',
  );

  buildMaterial(): MeshBasicNodeMaterial {
    const shaderOutput = this.runShader();
    const material = new MeshBasicNodeMaterial();
    material.vertexNode = flattenUV(uv());
    material.colorNode = <Node<'vec4'>>shaderOutput.get('color');
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

    // heightmap & features
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(4)).toVar('FLAG_CRACKS_ENABLED');
    const FLAG_CRATERS_ENABLED = float(this.uniforms.flags.element(5)).toVar('FLAG_CRATERS_ENABLED');
    const surfaceData = calculateTotalHeight(
      vPos,
      this.uniforms.surface.noise,
      this.uniforms.surface.warping.x,
      this.uniforms.textures.craters,
      CratersInput(this.uniforms.features.craters.baseNoise, this.uniforms.features.craters.detailNoise),
      CracksInput(
        this.uniforms.features.cracks.distanceToEdge,
        this.uniforms.features.cracks.detailNoiseStrength,
        this.uniforms.features.cracks.baseNoise,
        this.uniforms.features.cracks.detailNoise,
        this.uniforms.features.cracks.limiterNoise,
      ),
      FLAG_CRATERS_ENABLED,
      FLAG_CRACKS_ENABLED,
    );

    const height = float(<Node<'float'>>surfaceData.get('height')).toVar('height');
    const heightBeforeCracks = float(<Node<'float'>>surfaceData.get('heightBeforeCracks')).toVar('heightBeforeCracks');
    const cracksExtents = vec2(<Node<'vec2'>>surfaceData.get('cracksExtents')).toVar('cracksExtents');

    // flags
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, heightBeforeCracks).toVar('FLAG_SURFACE_TYPE');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).toVar(
      'FLAG_BIOMES_ENABLED',
    );

    // ------------------------------------------ //
    //              STEP 2: rendering             //
    // ------------------------------------------ //

    // render noise as color
    const texCoord = vec2(min(height, float(1).sub(EPSILON)), 0.5).toVar('texCoord');
    const colour = vec3(this.uniforms.textures.surface.sample(texCoord).xyz).toVar('colour');

    // calculate biomes
    const biomeTexCoord = vec2(0).toVar('biomeTexCoord');
    If(FLAG_BIOMES_ENABLED.greaterThan(0.5), () => {
      biomeTexCoord.assign(
        calculateBiomeTextureCoordinates(
          vPos,
          BiomesInput(
            this.uniforms.features.biomes.temperatureMode,
            this.uniforms.features.biomes.temperatureNoise,
            this.uniforms.features.biomes.humidityMode,
            this.uniforms.features.biomes.humidityNoise,
          ),
        ),
      );
      colour.assign(renderBiomes(colour, this.uniforms.textures.biomes, biomeTexCoord));
    });

    // calculate cracks
    const cracksColor = vec3(0).toVar('cracksColour');
    const cracksTextureColor = vec3(0).toVar('cracksTextureColor');
    If(FLAG_CRACKS_ENABLED.greaterThan(0.5), () => {
      const cracksData = renderCracks(
        cracksExtents,
        colour,
        vPos,
        this.uniforms.features.cracks.colorNoise,
        this.uniforms.textures.cracks,
        this.uniforms.features.cracks.underwaterStrength,
        FLAG_SURFACE_TYPE,
      );
      cracksColor.assign(cracksData.get('fragmentColor'));
      cracksTextureColor.assign(cracksData.get('textureColor'));

      height.assign(calculateCracksHeight(height, cracksExtents, FLAG_CRACKS_ENABLED));
      colour.assign(mix(colour, cracksColor, FLAG_CRACKS_ENABLED));
    });

    // Return shader output
    shaderOutput.get('color').assign(vec4(colour, 1));
    return shaderOutput;
  });
}
