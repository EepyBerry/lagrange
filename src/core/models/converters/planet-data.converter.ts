import type { DataTexture } from "three";
import type PlanetData from "../planet-data.model";
import type { PlanetUniformData } from "@/core/tsl/materials/planet.tslmat";

export function convertToPlanetUniformData(data: PlanetData, surfaceTex?: DataTexture, biomeTex?: DataTexture): PlanetUniformData {
  return {
    radius: data.planetRadius,
    bumpStrength: data.planetSurfaceBumpStrength,
    flags: {
      showWarping: data.planetSurfaceShowWarping,
      showDisplacement: data.planetSurfaceShowDisplacement,
      showBumps: data.planetSurfaceShowBumps,
      enableBiomes: data.biomesEnabled
    },
    pbr: {
      waterLevel: data.planetWaterLevel,
      waterRoughness: data.planetWaterRoughness,
      waterMetalness: data.planetWaterMetalness,
      groundRoughness: data.planetGroundRoughness,
      groundMetalness: data.planetGroundMetalness
    },
    noise: {
      frequency: data.planetSurfaceNoise.frequency,
      amplitude: data.planetSurfaceNoise.amplitude,
      lacunarity: data.planetSurfaceNoise.lacunarity,
      octaves: data.planetSurfaceNoise.octaves,
    },
    warping: {
      layers: data.planetSurfaceNoise.layers,
      warpFactor: data.planetSurfaceNoise.warpFactor
    },
    displacement: {
      params: {
        factor: data.planetSurfaceDisplacement.factor,
        epsilon: data.planetSurfaceDisplacement.epsilon,
        multiplier: data.planetSurfaceDisplacement.multiplier
      },
      noise: {
        frequency: data.planetSurfaceDisplacement.frequency,
        amplitude: data.planetSurfaceDisplacement.amplitude,
        lacunarity: data.planetSurfaceDisplacement.lacunarity,
        octaves: data.planetSurfaceDisplacement.octaves,
      }
    },
    biomes: {
      temperatureMode: data.biomesTemperatureMode,
      temperatureNoise: {
        frequency: data.biomesTemperatureNoise.frequency,
        amplitude: data.biomesTemperatureNoise.amplitude,
        lacunarity: data.biomesTemperatureNoise.lacunarity,
        octaves: data.biomesTemperatureNoise.octaves,
      },
      humidityMode: data.biomesHumidityMode,
      humidityNoise: {
        frequency: data.biomesHumidityNoise.frequency,
        amplitude: data.biomesHumidityNoise.amplitude,
        lacunarity: data.biomesHumidityNoise.lacunarity,
        octaves: data.biomesHumidityNoise.octaves,
      }
    },
    textures: (surfaceTex && biomeTex)
      ? { surface: surfaceTex!, biomes: biomeTex! }
      : undefined
  }
}