import type { DataEventContext, DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type { ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { EDITOR_WORKERS } from '@core/editor/state/editor.state.ts';
import { TEXTURE_SIZES } from '@core/globals.ts';
import { WorkerBoundDataArrayTexture } from '@core/utils/texture/worker-bound-data-array-texture.ts';
import { renderCracks, CracksInput } from '@tsl/features/cracks.ts';
import { CratersInput } from '@tsl/features/craters.ts';
import { applyBaseEmissive, applyBiomesEmissive, applyCracksEmissive } from '@tsl/features/emissive.ts';
import {
  bitangentLocal,
  EPSILON,
  float,
  Fn,
  If,
  int,
  min,
  mix,
  normalLocal,
  positionLocal,
  step,
  struct,
  tangentLocal,
  texture,
  transformNormalToView,
  uniform,
  uniformArray,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import {
  MeshStandardNodeMaterial,
  Node,
  TextureNode,
  UniformArrayNode,
  UniformNode,
  Vector2,
  Vector3,
  Vector4,
} from 'three/webgpu';
import { BiomesInput, calculateBiomeTextureCoordinates, renderBiomes } from '../features/biomes';
import { applyBumpMapping } from '../features/bump';
import { calculateTotalHeight } from '../features/height';
import { applyXYZTransformations } from '../features/lwd';
import { TSLMaterial } from './tsl-material';

export type PlanetUniforms = {
  arrayTexture: TextureNode;
  radius: UniformNode<'float', number>;
  flags: UniformArrayNode<'int'>;
  pbr: {
    waterLevel: UniformNode<'float', number>;
    metallicRoughness: UniformNode<'vec4', Vector4>;
    emissive: UniformNode<'vec2', Vector2>;
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
};
export class PlanetTSLMaterial extends TSLMaterial<MeshStandardNodeMaterial, PlanetUniforms> {
  public readonly dataEventEndpoint = new DataEventEndpoint<keyof DataEventPayloadTypeMap>('endpoint-planet');
  public static readonly ALLOWED_CONTEXTS = new Set<DataEventContext>([
    'surface',
    'biomes',
    'biomesTemperatureNoise',
    'biomesHumidityNoise',
    'cracks',
    'cracksBaseNoise',
    'cracksDetailNoise',
    'cracksLimiterNoise',
    'cracksColorNoise',
    'craters',
    'cratersBaseNoise',
    'cratersDetailNoise',
  ]);

  /*
   * TEXTURE REFERENCE (depth-indexed)
   * - 0: surface
   * - 1: biomes
   * - 2: biomes emissive
   * - 3: cracks
   * - 4: craters
   */
  public readonly workerBoundDataArrayTexture: WorkerBoundDataArrayTexture = new WorkerBoundDataArrayTexture(
    TEXTURE_SIZES.PLANET,
    TEXTURE_SIZES.PLANET,
    5,
  );

  constructor(initData: PlanetData) {
    super();
    this.uniforms = this.initUniforms(initData);
    this.initTextures(initData);
    this.dataEventEndpoint.canProcess = (payload) =>
      !payload.context || PlanetTSLMaterial.ALLOWED_CONTEXTS.has(payload.context);
    this.dataEventEndpoint
      .on('showWarping', (payload) => (this.uniforms.flags.array[0] = +payload.value))
      .on('showDisplacement', (payload) => (this.uniforms.flags.array[1] = +payload.value))
      .on('showBumps', (payload) => (this.uniforms.flags.array[2] = +payload.value))
      .on('showBiomes', (payload) => (this.uniforms.flags.array[3] = +payload.value))
      .on('showCracks', (payload) => (this.uniforms.flags.array[4] = +payload.value))
      .on('showCraters', (payload) => (this.uniforms.flags.array[5] = +payload.value))
      .on('showEmissive', (payload) => (this.uniforms.flags.array[6] = +payload.value))
      // unique params
      .on('waterLevel', (payload) => (this.uniforms.pbr.waterLevel.value = payload.value))
      .on('pbr', (payload) => {
        this.uniforms.pbr.metallicRoughness.value.x = payload.value.waterRoughness;
        this.uniforms.pbr.metallicRoughness.value.y = payload.value.waterMetalness;
        this.uniforms.pbr.metallicRoughness.value.z = payload.value.groundRoughness;
        this.uniforms.pbr.metallicRoughness.value.w = payload.value.groundMetalness;
      })
      .on('emissiveIntensity', async (payload) => {
        this.uniforms.pbr.emissive.value.x = payload.value.water;
        this.uniforms.pbr.emissive.value.y = payload.value.ground;
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes-emissive',
          initData.biomesParams,
          2,
        );
      })
      .on('bumpOffset', (payload) => (this.uniforms.bump.offset.value = payload.value))
      .on('bumpStrength', (payload) => (this.uniforms.bump.strength.value = payload.value))
      .on('biomesTemperatureMode', (payload) => (this.uniforms.features.biomes.temperatureMode.value = payload.value))
      .on('biomesHumidityMode', (payload) => (this.uniforms.features.biomes.humidityMode.value = payload.value))
      .on('cracksDistanceToEdge', (payload) => (this.uniforms.features.cracks.distanceToEdge.value = payload.value))
      .on(
        'cracksEmissiveIntensity',
        (payload) => (this.uniforms.features.cracks.emissiveIntensity.value = payload.value),
      )
      .on(
        'cracksUnderwaterStrength',
        (payload) => (this.uniforms.features.cracks.underwaterStrength.value = payload.value),
      )
      .on(
        'cracksDetailNoiseStrength',
        (payload) => (this.uniforms.features.cracks.detailNoiseStrength.value = payload.value),
      )
      // noise
      .on('displacementParametersUpdate', (payload) => {
        this.uniforms.surface.displacement.params.value.x = payload.value.factor;
        this.uniforms.surface.displacement.params.value.y = payload.value.epsilon;
        this.uniforms.surface.displacement.params.value.z = payload.value.multiplier;
        this.uniforms.surface.displacement.noise.value.x = payload.value.frequency;
        this.uniforms.surface.displacement.noise.value.y = payload.value.amplitude;
        this.uniforms.surface.displacement.noise.value.z = payload.value.lacunarity;
        this.uniforms.surface.displacement.noise.value.w = payload.value.octaves;
      })
      .on('fbmNoiseParametersUpdate', (payload) => {
        switch (payload.context) {
          case 'surface':
            this.uniforms.surface.warping.value.x = payload.value.layers;
            this.uniforms!.surface.warping.value.y = payload.value.warpFactor.x;
            this.uniforms!.surface.warping.value.z = payload.value.warpFactor.y;
            this.uniforms!.surface.warping.value.w = payload.value.warpFactor.z;
            this.uniforms.surface.noise.value.x = payload.value.frequency;
            this.uniforms.surface.noise.value.y = payload.value.amplitude;
            this.uniforms.surface.noise.value.z = payload.value.lacunarity;
            this.uniforms.surface.noise.value.w = payload.value.octaves;
            break;
          case 'biomesTemperatureNoise':
            this.uniforms.features.biomes.temperatureNoise.value.x = payload.value.frequency;
            this.uniforms.features.biomes.temperatureNoise.value.y = payload.value.amplitude;
            this.uniforms.features.biomes.temperatureNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.biomes.temperatureNoise.value.w = payload.value.octaves;
            break;
          case 'biomesHumidityNoise':
            this.uniforms.features.biomes.humidityNoise.value.x = payload.value.frequency;
            this.uniforms.features.biomes.humidityNoise.value.y = payload.value.amplitude;
            this.uniforms.features.biomes.humidityNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.biomes.humidityNoise.value.w = payload.value.octaves;
            break;
          case 'cracksDetailNoise':
            this.uniforms.features.cracks.detailNoise.value.x = payload.value.frequency;
            this.uniforms.features.cracks.detailNoise.value.y = payload.value.amplitude;
            this.uniforms.features.cracks.detailNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.cracks.detailNoise.value.w = payload.value.octaves;
            break;
          case 'cracksLimiterNoise':
            this.uniforms.features.cracks.limiterNoise.value.x = payload.value.frequency;
            this.uniforms.features.cracks.limiterNoise.value.y = payload.value.amplitude;
            this.uniforms.features.cracks.limiterNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.cracks.limiterNoise.value.w = payload.value.octaves;
            break;
          case 'cracksColorNoise':
            this.uniforms.features.cracks.colorNoise.value.x = payload.value.frequency;
            this.uniforms.features.cracks.colorNoise.value.y = payload.value.amplitude;
            this.uniforms.features.cracks.colorNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.cracks.colorNoise.value.w = payload.value.octaves;
            break;
          case 'cratersDetailNoise':
            this.uniforms.features.craters.detailNoise.value.x = payload.value.frequency;
            this.uniforms.features.craters.detailNoise.value.y = payload.value.amplitude;
            this.uniforms.features.craters.detailNoise.value.z = payload.value.lacunarity;
            this.uniforms.features.craters.detailNoise.value.w = payload.value.octaves;
        }
      })
      .on('voronoiNoiseParametersUpdate', (payload) => {
        switch (payload.context) {
          case 'cracksBaseNoise':
            this.uniforms.features.cracks.baseNoise.value.x = payload.value.scale;
            this.uniforms.features.cracks.baseNoise.value.y = payload.value.jitter;
            break;
          case 'cratersBaseNoise':
            this.uniforms.features.craters.baseNoise.value.x = payload.value.scale;
            this.uniforms.features.craters.baseNoise.value.y = payload.value.jitter;
            break;
        }
      })
      // color ramps
      .on('colorRampUpdate', async (payload) => {
        switch (payload.context) {
          case 'surface':
            await this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
              EDITOR_WORKERS.texture!,
              'color-ramp',
              payload.value.steps,
              0,
            );
            break;
          case 'cracks':
            await this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
              EDITOR_WORKERS.texture!,
              'color-ramp',
              payload.value.steps,
              3,
            );
            break;
          case 'craters':
            await this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
              EDITOR_WORKERS.texture!,
              'color-ramp',
              payload.value.steps,
              4,
            );
            break;
        }
      })
      // biomes
      .on('biomeParametersUpdate', async () => {
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes',
          initData.biomesParams,
          1,
        );
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes-emissive',
          initData.biomesParams,
          2,
        );
      })
      .on('biomeAdd', async () => {
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes',
          initData.biomesParams,
          1,
        );
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes-emissive',
          initData.biomesParams,
          2,
        );
      })
      .on('biomeRemove', async () => {
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes',
          initData.biomesParams,
          1,
        );
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes-emissive',
          initData.biomesParams,
          2,
        );
      })
      .on('biomesClear', async () => {
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes',
          initData.biomesParams,
          1,
        );
        await this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
          EDITOR_WORKERS.texture!,
          'biomes-emissive',
          initData.biomesParams,
          2,
        );
      });
  }

  dispose(): void {
    super.dispose();
    this.workerBoundDataArrayTexture.texture.dispose();
  }

  initUniforms(data: PlanetData): PlanetUniforms {
    return {
      arrayTexture: texture(this.workerBoundDataArrayTexture.texture),
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
    };
  }

  initTextures(initData: PlanetData) {
    Promise.all([
      this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
        EDITOR_WORKERS.texture!,
        'color-ramp',
        initData.planetSurfaceColorRamp.steps,
        0,
      ),
      this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
        EDITOR_WORKERS.texture!,
        'biomes',
        initData.biomesParams,
        1,
      ),
      this.workerBoundDataArrayTexture.update<BiomeParameters[]>(
        EDITOR_WORKERS.texture!,
        'biomes-emissive',
        initData.biomesParams,
        2,
      ),
      this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
        EDITOR_WORKERS.texture!,
        'color-ramp',
        initData.cracksColorRamp.steps,
        3,
      ),
      this.workerBoundDataArrayTexture.update<ColorRampStep[]>(
        EDITOR_WORKERS.texture!,
        'color-ramp',
        initData.cratersColorRamp.steps,
        4,
      ),
    ]).catch(console.error);
  }

  // --------------------------------------------------
  // |               Shading functions                |
  // --------------------------------------------------

  // Pre-defined common shader structs
  private readonly ShaderOutput = struct(
    {
      color: 'vec4',
      normal: 'vec3',
      metalness: 'float',
      roughness: 'float',
      emissive: 'vec4',
    },
    'ShaderOutput',
  );

  buildMaterial(): MeshStandardNodeMaterial {
    const shaderOutput = this.runShader();
    const material = new MeshStandardNodeMaterial();
    material.colorNode = <Node<'vec4'>>shaderOutput.get('color');
    material.normalNode = <Node<'vec3'>>shaderOutput.get('normal');
    material.roughnessNode = <Node<'float'>>shaderOutput.get('roughness');
    material.metalnessNode = <Node<'float'>>shaderOutput.get('metalness');
    material.emissiveNode = <Node<'vec4'>>shaderOutput.get('emissive');
    return material;
  }

  private readonly runShader = Fn(() => {
    // define output variables
    const shaderOutput = this.ShaderOutput(vec4(0), vec3(0), float(0), float(0), vec3(0));

    // ------------------------------------------ //
    //      STEP 1: base height-map + flags       //
    // ------------------------------------------ //

    // XYZ Warping + displacement
    const vPos = vec3(positionLocal).toVar('vPos');
    vPos.assign(
      applyXYZTransformations(
        vPos,
        this.uniforms.surface.warping,
        this.uniforms.flags.element(0),
        this.uniforms.surface.displacement.params,
        this.uniforms.surface.displacement.noise,
        this.uniforms.flags.element(1),
      ),
    );

    // heightmap & features
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(4)).toVar('FLAG_CRACKS_ENABLED');
    const FLAG_CRATERS_ENABLED = float(this.uniforms.flags.element(5)).toVar('FLAG_CRATERS_ENABLED');
    const surfaceData = calculateTotalHeight(
      vPos,
      this.uniforms.surface.noise,
      this.uniforms.surface.warping.x,
      this.uniforms.arrayTexture.depth(int(4)),
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

    const heightBeforeCracks = float(<Node<'float'>>surfaceData.get('heightBeforeCracks')).toVar('heightBeforeCracks');
    const height = float(<Node<'float'>>surfaceData.get('height')).toVar('height');
    const cracksExtents = vec2(<Node<'vec2'>>surfaceData.get('cracksExtents')).toVar('cracksExtents');

    // flags
    const FLAG_SURFACE_TYPE = step(this.uniforms.pbr.waterLevel, heightBeforeCracks).toVar('FLAG_SURFACE_TYPE');
    const FLAG_BUMPS_ENABLED = float(this.uniforms.flags.element(2)).toVar('FLAG_BUMPS_ENABLED');
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).toVar(
      'FLAG_BIOMES_ENABLED',
    );
    const FLAG_EMISSIVE_ENABLED = float(this.uniforms.flags.element(6)).toVar('FLAG_EMISSIVE_ENABLED');

    // ------------------------------------------ //
    //              STEP 2: rendering             //
    // ------------------------------------------ //

    // render noise as color
    const texCoord = vec2(min(height, float(1).sub(EPSILON)), 0.5).toVar('texCoord');
    const colour = vec3(this.uniforms.arrayTexture.depth(int(0)).sample(texCoord).xyz).toVar('colour');

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
      colour.assign(renderBiomes(colour, this.uniforms.arrayTexture.depth(int(1)), biomeTexCoord));
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
        this.uniforms.arrayTexture.depth(int(3)),
        this.uniforms.features.cracks.underwaterStrength,
        FLAG_SURFACE_TYPE,
      );
      cracksColor.assign(cracksData.get('fragmentColor'));
      cracksTextureColor.assign(cracksData.get('textureColor'));
      colour.assign(mix(colour, cracksColor, FLAG_CRACKS_ENABLED));
    });

    // ------------------------------------------ //
    //       STEP 3: bump-map calculations        //
    // ------------------------------------------ //

    const bump = vec3(normalLocal).toVar('bump');
    If(FLAG_SURFACE_TYPE.mul(FLAG_BUMPS_ENABLED).greaterThan(0.5), () => {
      const bitangent = <Node<'vec3'>>(<unknown>bitangentLocal); // required cuz typedefs are borked...
      const bumpOffset = float(this.uniforms.bump.offset).toVar('bumpOffset');
      const dx = vec3(tangentLocal.xyz.mul(this.uniforms.surface.warping.yzw).mul(bumpOffset)).toVar('dx');
      const dy = vec3(bitangent.mul(this.uniforms.surface.warping.yzw).mul(bumpOffset)).toVar('dy');
      const dxHeight = float(
        calculateTotalHeight(
          vPos.add(dx),
          this.uniforms.surface.noise,
          this.uniforms.surface.warping.x,
          this.uniforms.arrayTexture.depth(int(4)),
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
        ).get('height') as Node<'float'>,
      ).toVar('dxHeight');
      const dyHeight = float(
        calculateTotalHeight(
          vPos.add(dy),
          this.uniforms.surface.noise,
          this.uniforms.surface.warping.x,
          this.uniforms.arrayTexture.depth(int(4)),
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
        ).get('height') as Node<'float'>,
      ).toVar('dyHeight');
      bump.assign(
        applyBumpMapping(
          normalLocal,
          vPos,
          dx,
          dy,
          height,
          dxHeight,
          dyHeight,
          this.uniforms.radius,
          this.uniforms.bump.strength,
        ),
      );
    });

    // ------------------------------------------ //
    //       STEP 4: emissive calculations        //
    // ------------------------------------------ //

    const emissiveColour = vec3(0).toVar('emissiveColour');
    If(FLAG_EMISSIVE_ENABLED.greaterThan(0.5), () => {
      emissiveColour.assign(applyBaseEmissive(colour, this.uniforms.pbr.emissive, FLAG_SURFACE_TYPE));
      emissiveColour.assign(
        mix(
          emissiveColour,
          applyBiomesEmissive(
            emissiveColour,
            this.uniforms.pbr.emissive,
            this.uniforms.arrayTexture.depth(int(1)),
            this.uniforms.arrayTexture.depth(int(2)),
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

    // ------------------------------------------ //
    //           STEP 5: return outputs           //
    // ------------------------------------------ //

    // Return shader output
    shaderOutput.get('color').assign(vec4(colour, 1));
    shaderOutput
      .get('normal')
      .assign(transformNormalToView(mix(normalLocal, bump, FLAG_SURFACE_TYPE.mul(FLAG_BUMPS_ENABLED))));
    shaderOutput
      .get('metalness')
      .assign(mix(this.uniforms.pbr.metallicRoughness.y, this.uniforms.pbr.metallicRoughness.w, FLAG_SURFACE_TYPE));
    shaderOutput
      .get('roughness')
      .assign(mix(this.uniforms.pbr.metallicRoughness.x, this.uniforms.pbr.metallicRoughness.z, FLAG_SURFACE_TYPE));
    shaderOutput.get('emissive').assign(vec4(mix(vec3(0), emissiveColour, FLAG_EMISSIVE_ENABLED), 1));
    return shaderOutput;
  });
}
