import type { DataEventContext, DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import type { ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { EDITOR_WORKERS } from '@core/editor/state/editor.state.ts';
import { TEXTURE_SIZES } from '@core/globals.ts';
import { WorkerBoundDataArrayTexture } from '@core/utils/texture/worker-bound-data-array-texture.ts';
import { calculateCracksExtents, renderCracks } from '@tsl/features/cracks.ts';
import { applyEmissiveIntensity } from '@tsl/features/emissive.ts';
import {
  bitangentLocal,
  EPSILON,
  float,
  int,
  min,
  mix,
  normalLocal,
  positionLocal,
  step,
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
import { calculateBiomeTextureCoordinates, renderBiomes } from '../features/biomes';
import { applyBumpMap } from '../features/bump';
import { applyXYZTransformations, layer } from '../features/lwd';
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
      detailNoiseStrength: UniformNode<'float', number>;
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
  ]);

  /*
   * TEXTURE REFERENCE (depth-indexed)
   * - 0: surface
   * - 1: biomes
   * - 2: biomes emissive
   * - 3: cracks
   * - 4: heightmap (baking only)
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
      .on('showEmissive', (payload) => (this.uniforms.flags.array[5] = +payload.value))
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
        }
      })
      .on('voronoiNoiseParametersUpdate', (payload) => {
        switch (payload.context) {
          case 'cracksBaseNoise':
            this.uniforms.features.cracks.baseNoise.value.x = payload.value.scale;
            this.uniforms.features.cracks.baseNoise.value.y = payload.value.jitter;
            this.uniforms.features.cracks.baseNoise.value.z = payload.value.mode;
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
        console.log('add biome');
        console.log(initData.biomesParams);
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
        console.log('clear biomes');
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
          detailNoiseStrength: uniform(data.cracksDetailNoiseStrength),
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
    ]).catch(console.error);
  }

  // --------------------------------------------------
  // |              Building functions                |
  // --------------------------------------------------

  buildMaterial(): MeshStandardNodeMaterial {
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
    const FLAG_BIOMES_ENABLED = FLAG_SURFACE_TYPE.mul(float(this.uniforms.flags.element(3))).toVar(
      'FLAG_BIOMES_ENABLED',
    );
    const FLAG_CRACKS_ENABLED = float(this.uniforms.flags.element(4)).toVar('FLAG_CRACKS_ENABLED');

    // render noise as color
    const texCoord = vec2(min(height, heightLimit), 0.5).toVar('texCoord');
    let colour = vec3(this.uniforms.arrayTexture.depth(int(0)).sample(texCoord).xyz);

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
    colour = renderBiomes(
      colour,
      this.uniforms.arrayTexture.depth(int(1)),
      biomeTexCoord,
      FLAG_BIOMES_ENABLED,
    ).toVec3();

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
      this.uniforms.arrayTexture.depth(int(3)),
      FLAG_SURFACE_TYPE,
    ).toVar('cracksColor');
    colour = mix(colour, cracksColour, FLAG_CRACKS_ENABLED).toVec3();

    // Render bump-map (under MIT license)
    const bump = applyBumpMap(
      vPos,
      height,
      this.uniforms.radius,
      vec2(this.uniforms.bump.offset, this.uniforms.bump.strength),
      this.uniforms.surface.noise,
      this.uniforms.surface.warping,
      tangentLocal,
      <Node<'vec3'>>(<unknown>bitangentLocal),
      normalLocal,
    );

    // Init material & set outputs
    const material = new MeshStandardNodeMaterial();
    material.colorNode = vec4(colour, 1);
    material.normalNode = transformNormalToView(
      mix(normalLocal, bump, FLAG_SURFACE_TYPE.mul(int(this.uniforms.flags.element(2)))),
    );
    material.roughnessNode = mix(
      this.uniforms.pbr.metallicRoughness.x,
      this.uniforms.pbr.metallicRoughness.z,
      FLAG_SURFACE_TYPE,
    );
    material.metalnessNode = mix(
      this.uniforms.pbr.metallicRoughness.y,
      this.uniforms.pbr.metallicRoughness.w,
      FLAG_SURFACE_TYPE,
    );
    material.emissiveNode = applyEmissiveIntensity(
      colour,
      this.uniforms.pbr.emissive,
      this.uniforms.arrayTexture.depth(int(1)),
      this.uniforms.arrayTexture.depth(int(2)),
      biomeTexCoord,
      float(this.uniforms.flags.element(5)),
      FLAG_SURFACE_TYPE,
    );
    return material;
  }
}
