import type { DataTexture } from 'three'
import type PlanetData from '../planet-data.model'
import type { PlanetUniformData } from '@/core/tsl/materials/planet.tslmat'
import type { CloudsUniformData } from '@/core/tsl/materials/clouds.tslmat'
import type { RingUniformData } from '@/core/tsl/materials/ring.tslmat'
import type { RingParameters } from '../ring-parameters.model'

/**
 * Converts editor planet data to uniform data used specifically for planet materials
 * @param data editor planet data
 * @param surfaceTex surface texture (optional, required only for certain materials)
 * @param biomeTex biome texture (optional, required only for certain materials)
 * @returns a PlanetUniformData object with the required data within
 */
export function convertToTexturedPlanetUniformData(
  data: PlanetData,
  surfaceTex: DataTexture,
  biomeTex: DataTexture,
): PlanetUniformData {
  return {
    ...convertToPlanetUniformData(data),
    textures: { surface: surfaceTex!, biomes: biomeTex! },
  }
}
export function convertToPlanetUniformData(data: PlanetData): PlanetUniformData {
  return {
    radius: data.planetRadius,
    bumpStrength: data.planetSurfaceBumpStrength,
    flags: {
      showWarping: data.planetSurfaceShowWarping,
      showDisplacement: data.planetSurfaceShowDisplacement,
      showBumps: data.planetSurfaceShowBumps,
      showBiomes: data.biomesEnabled,
      showEmissive: data.planetShowEmissive,
    },
    pbr: {
      waterLevel: data.planetWaterLevel,
      metallicRoughness: {
        waterRoughness: data.planetWaterRoughness,
        waterMetalness: data.planetWaterMetalness,
        groundRoughness: data.planetGroundRoughness,
        groundMetalness: data.planetGroundMetalness,
      },
      emissive: {
        waterEmissiveIntensity: data.planetWaterEmissiveIntensity,
        groundEmissiveIntensity: data.planetGroundEmissiveIntensity,
      },
    },
    noise: {
      frequency: data.planetSurfaceNoise.frequency,
      amplitude: data.planetSurfaceNoise.amplitude,
      lacunarity: data.planetSurfaceNoise.lacunarity,
      octaves: data.planetSurfaceNoise.octaves,
    },
    warping: {
      layers: data.planetSurfaceNoise.layers,
      warpFactor: data.planetSurfaceNoise.warpFactor,
    },
    displacement: {
      params: {
        factor: data.planetSurfaceDisplacement.factor,
        epsilon: data.planetSurfaceDisplacement.epsilon,
        multiplier: data.planetSurfaceDisplacement.multiplier,
      },
      noise: {
        frequency: data.planetSurfaceDisplacement.frequency,
        amplitude: data.planetSurfaceDisplacement.amplitude,
        lacunarity: data.planetSurfaceDisplacement.lacunarity,
        octaves: data.planetSurfaceDisplacement.octaves,
      },
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
      },
    },
  }
}

/**
 * Converts editor planet data to uniform data used specifically for cloud materials
 * @param data editor planet data
 * @param opacityTex opacity texture
 * @returns a CloudsUniformData object with the required data within
 */
export function convertToCloudsUniformData(data: PlanetData, opacityTex: DataTexture): CloudsUniformData {
  return {
    flags: {
      showWarping: data.cloudsShowWarping,
      showDisplacement: data.cloudsShowDisplacement,
    },
    color: data.cloudsColor,
    noise: data.cloudsNoise,
    warping: {
      layers: data.cloudsNoise.layers,
      warpFactor: data.cloudsNoise.warpFactor,
    },
    displacement: {
      params: {
        factor: data.cloudsDisplacement.factor,
        epsilon: data.cloudsDisplacement.epsilon,
        multiplier: data.cloudsDisplacement.multiplier,
      },
      noise: {
        frequency: data.cloudsDisplacement.frequency,
        amplitude: data.cloudsDisplacement.amplitude,
        lacunarity: data.cloudsDisplacement.lacunarity,
        octaves: data.cloudsDisplacement.octaves,
      },
    },
    texture: opacityTex,
  }
}

export function convertToRingUniformData(ringParams: RingParameters, ringTex: DataTexture): RingUniformData {
  return {
    innerRadius: ringParams.innerRadius,
    outerRadius: ringParams.outerRadius,
    texture: ringTex,
  }
}
