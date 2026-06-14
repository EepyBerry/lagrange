import type PlanetData from '@core/models/planet/planet-data.model.ts';
import type { PlanetUniformData } from '@tsl/materials/planet.tslmat';
import type { Texture } from 'three';
import { ModelConverter } from './model-converter';

export class PlanetDataConverter extends ModelConverter<PlanetData, PlanetUniformData> {
  private _surfaceTexture?: Texture;
  private _biomesTexture?: Texture;
  private _cracksTexture?: Texture;
  private _biomesEmissiveTexture?: Texture;

  private _bakingSurfaceHeightMapTexture?: Texture;

  constructor(data: PlanetData) {
    super(data);
  }

  public withSurfaceTexture(tex: Texture): this {
    this._surfaceTexture = tex;
    return this;
  }

  public withCracksTexture(tex: Texture): this {
    this._cracksTexture = tex;
    return this;
  }

  public withBiomesTexture(tex: Texture): this {
    this._biomesTexture = tex;
    return this;
  }

  public withBiomesEmissiveTexture(tex: Texture): this {
    this._biomesEmissiveTexture = tex;
    return this;
  }

  public withBakingSurfaceHeightMapTexture(tex: Texture): this {
    this._bakingSurfaceHeightMapTexture = tex;
    return this;
  }

  public convert(): PlanetUniformData {
    return {
      radius: this._data.planetRadius,
      bumpStrength: this._data.planetSurfaceBumpStrength,
      flags: {
        showWarping: this._data.planetSurfaceShowWarping,
        showDisplacement: this._data.planetSurfaceShowDisplacement,
        showBumps: this._data.planetSurfaceShowBumps,
        showBiomes: this._data.biomesEnabled,
        showCracks: this._data.cracksEnabled,
        showEmissive: this._data.planetShowEmissive,
      },
      pbr: {
        waterLevel: this._data.planetWaterLevel,
        metallicRoughness: {
          waterRoughness: this._data.planetWaterRoughness,
          waterMetalness: this._data.planetWaterMetalness,
          groundRoughness: this._data.planetGroundRoughness,
          groundMetalness: this._data.planetGroundMetalness,
        },
        emissive: {
          waterEmissiveIntensity: this._data.planetWaterEmissiveIntensity,
          groundEmissiveIntensity: this._data.planetGroundEmissiveIntensity,
        },
      },
      surface: {
        baseTexture: this._surfaceTexture,
        noise: {
          frequency: this._data.planetSurfaceNoise.frequency,
          amplitude: this._data.planetSurfaceNoise.amplitude,
          lacunarity: this._data.planetSurfaceNoise.lacunarity,
          octaves: this._data.planetSurfaceNoise.octaves,
        },
        warping: {
          layers: this._data.planetSurfaceNoise.layers,
          warpFactor: this._data.planetSurfaceNoise.warpFactor,
        },
        displacement: {
          params: {
            factor: this._data.planetSurfaceDisplacement.factor,
            epsilon: this._data.planetSurfaceDisplacement.epsilon,
            multiplier: this._data.planetSurfaceDisplacement.multiplier,
          },
          noise: {
            frequency: this._data.planetSurfaceDisplacement.frequency,
            amplitude: this._data.planetSurfaceDisplacement.amplitude,
            lacunarity: this._data.planetSurfaceDisplacement.lacunarity,
            octaves: this._data.planetSurfaceDisplacement.octaves,
          },
        },
      },
      features: {
        cracks: {
          baseTexture: this._cracksTexture,
          distanceToEdge: this._data.cracksDistanceToEdge,
          emissiveIntensity: this._data.cracksEmissiveIntensity,
          baseNoise: {
            scale: this._data.cracksBaseNoise.scale,
            jitter: this._data.cracksBaseNoise.jitter,
            mode: this._data.cracksBaseNoise.mode,
          },
          detailNoise: {
            frequency: this._data.cracksDetailNoise.frequency,
            amplitude: this._data.cracksDetailNoise.amplitude,
            lacunarity: this._data.cracksDetailNoise.lacunarity,
            octaves: this._data.cracksDetailNoise.octaves,
          },
          limiterNoise: {
            frequency: this._data.cracksLimiterNoise.frequency,
            amplitude: this._data.cracksLimiterNoise.amplitude,
            lacunarity: this._data.cracksLimiterNoise.lacunarity,
            octaves: this._data.cracksLimiterNoise.octaves,
          },
          colorNoise: {
            frequency: this._data.cracksColorNoise.frequency,
            amplitude: this._data.cracksColorNoise.amplitude,
            lacunarity: this._data.cracksColorNoise.lacunarity,
            octaves: this._data.cracksColorNoise.octaves,
          },
        },
        biomes: {
          baseTexture: this._biomesTexture,
          emissiveTexture: this._biomesEmissiveTexture,
          temperatureMode: this._data.biomesTemperatureMode,
          temperatureNoise: {
            frequency: this._data.biomesTemperatureNoise.frequency,
            amplitude: this._data.biomesTemperatureNoise.amplitude,
            lacunarity: this._data.biomesTemperatureNoise.lacunarity,
            octaves: this._data.biomesTemperatureNoise.octaves,
          },
          humidityMode: this._data.biomesHumidityMode,
          humidityNoise: {
            frequency: this._data.biomesHumidityNoise.frequency,
            amplitude: this._data.biomesHumidityNoise.amplitude,
            lacunarity: this._data.biomesHumidityNoise.lacunarity,
            octaves: this._data.biomesHumidityNoise.octaves,
          },
        },
      },
      baking: {
        heightMapTexture: this._bakingSurfaceHeightMapTexture,
      },
    };
  }
}
