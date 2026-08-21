import type {
  SerializedBiomeParameters,
  SerializedColorRamp,
  SerializedColorRampStep,
  SerializedDisplacementParameters,
  SerializedFbmNoiseParameters,
  SerializedPlanetData,
  SerializedRingParameters,
  SerializedVoronoiNoiseParameters,
} from '@core/editor/workers/worker-serializer.types.ts';
import type { DisplacementParameters } from '@core/models/planet/displacement-parameters.model.ts';
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import type { FbmNoiseParameters } from '@core/models/planet/noise/fbm-noise-parameters.model.ts';
import type { VoronoiNoiseParameters } from '@core/models/planet/noise/voronoi-noise-parameters.model.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';
import type { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { type ColorRamp, ColorRampStep } from '@core/models/planet/color-ramp.model.ts';

export function serializeBakingWorkerData(planetData: PlanetData): SerializedPlanetData {
  return {
    defaultPlanetName: planetData.defaultPlanetName,
    planetName: planetData.planetName,
    initCamDistance: planetData.initCamDistance,
    initCamAngle: planetData.initCamAngle,
    lensFlareEnabled: planetData.lensFlareEnabled,
    lensFlarePointsIntensity: planetData.lensFlarePointsIntensity,
    lensFlareGlareIntensity: planetData.lensFlareGlareIntensity,
    sunLightAngle: planetData.sunLightAngle,
    sunLightColor: { r: planetData.sunLightColor.r, g: planetData.sunLightColor.g, b: planetData.sunLightColor.b },
    sunLightIntensity: planetData.sunLightIntensity,
    ambLightColor: { r: planetData.ambLightColor.r, g: planetData.ambLightColor.g, b: planetData.ambLightColor.b },
    ambLightIntensity: planetData.ambLightIntensity,
    planetType: planetData.planetType,
    planetClass: planetData.planetClass,
    planetMeshQuality: planetData.planetMeshQuality,
    planetRadius: planetData.planetRadius,
    planetAxialTilt: planetData.planetAxialTilt,
    planetRotation: planetData.planetRotation,
    planetWaterRoughness: planetData.planetWaterRoughness,
    planetWaterMetalness: planetData.planetWaterMetalness,
    planetGroundRoughness: planetData.planetGroundRoughness,
    planetGroundMetalness: planetData.planetGroundMetalness,
    planetWaterLevel: planetData.planetWaterLevel,
    planetShowEmissive: planetData.planetShowEmissive,
    planetWaterEmissiveIntensity: planetData.planetWaterEmissiveIntensity,
    planetGroundEmissiveIntensity: planetData.planetGroundEmissiveIntensity,
    planetSurfaceShowBumps: planetData.planetSurfaceShowBumps,
    planetSurfaceBumpOffset: planetData.planetSurfaceBumpOffset,
    planetSurfaceBumpStrength: planetData.planetSurfaceBumpStrength,
    planetSurfaceShowWarping: planetData.planetSurfaceShowWarping,
    planetSurfaceShowDisplacement: planetData.planetSurfaceShowDisplacement,
    planetSurfaceDisplacement: serializeDisplacement(planetData.planetSurfaceDisplacement),
    planetSurfaceNoise: serializeFbmNoise(planetData.planetSurfaceNoise),
    planetSurfaceColorRamp: serializeColorRamp(planetData.planetSurfaceColorRamp),
    biomesEnabled: planetData.biomesEnabled,
    biomesTemperatureMode: planetData.biomesTemperatureMode,
    biomesTemperatureNoise: serializeFbmNoise(planetData.biomesTemperatureNoise),
    biomesHumidityMode: planetData.biomesHumidityMode,
    biomesHumidityNoise: serializeFbmNoise(planetData.biomesHumidityNoise),
    biomesParams: planetData.biomesParams.map(serializeBiome),
    cracksEnabled: planetData.cracksEnabled,
    cracksDistanceToEdge: planetData.cracksDistanceToEdge,
    cracksEmissiveIntensity: planetData.cracksEmissiveIntensity,
    cracksUnderwaterStrength: planetData.cracksUnderwaterStrength,
    cracksDetailNoiseStrength: planetData.cracksDetailNoiseStrength,
    cracksBaseNoise: serializeVoronoiNoise(planetData.cracksBaseNoise),
    cracksDetailNoise: serializeFbmNoise(planetData.cracksDetailNoise),
    cracksLimiterNoise: serializeFbmNoise(planetData.cracksLimiterNoise),
    cracksColorNoise: serializeFbmNoise(planetData.cracksColorNoise),
    cracksColorRamp: serializeColorRamp(planetData.cracksColorRamp),
    cratersEnabled: planetData.cratersEnabled,
    cratersBaseNoise: serializeVoronoiNoise(planetData.cratersBaseNoise),
    cratersDetailNoise: serializeFbmNoise(planetData.cratersDetailNoise),
    cratersColorRamp: serializeColorRamp(planetData.cratersColorRamp),
    cloudsEnabled: planetData.cloudsEnabled,
    cloudsRotation: planetData.cloudsRotation,
    cloudsHeight: planetData.cloudsHeight,
    cloudsShowWarping: planetData.cloudsShowWarping,
    cloudsShowDisplacement: planetData.cloudsShowDisplacement,
    cloudsDisplacement: serializeDisplacement(planetData.cloudsDisplacement),
    cloudsNoise: serializeFbmNoise(planetData.cloudsNoise),
    cloudsColor: { r: planetData.cloudsColor.r, g: planetData.cloudsColor.g, b: planetData.cloudsColor.b },
    cloudsColorRamp: serializeColorRamp(planetData.cloudsColorRamp),
    atmosphereEnabled: planetData.atmosphereEnabled,
    atmosphereHeight: planetData.atmosphereHeight,
    atmosphereDensityScale: planetData.atmosphereDensityScale,
    atmosphereIntensity: planetData.atmosphereIntensity,
    atmosphereColorMode: planetData.atmosphereColorMode,
    atmosphereHue: planetData.atmosphereHue,
    atmosphereTint: { r: planetData.atmosphereTint.r, g: planetData.atmosphereTint.g, b: planetData.atmosphereTint.b },
    atmosphereMieScatteringConstant: planetData.atmosphereMieScatteringConstant,
    atmosphereRayleighDensityRatio: planetData.atmosphereRayleighDensityRatio,
    atmosphereMieDensityRatio: planetData.atmosphereMieDensityRatio,
    atmosphereOpticalDensityRatio: planetData.atmosphereOpticalDensityRatio,
    ringsEnabled: planetData.ringsEnabled,
    ringsParams: planetData.ringsParams.map(serializeRing),
  };
}

function serializeFbmNoise(noise: FbmNoiseParameters): SerializedFbmNoiseParameters {
  return {
    frequency: noise.frequency,
    amplitude: noise.amplitude,
    lacunarity: noise.lacunarity,
    octaves: noise.octaves,
    layers: noise.layers,
    warpFactor: { x: noise.warpFactor.x, y: noise.warpFactor.y, z: noise.warpFactor.z },
  };
}

function serializeVoronoiNoise(noise: VoronoiNoiseParameters): SerializedVoronoiNoiseParameters {
  return {
    scale: noise.scale,
    jitter: noise.jitter,
  };
}

function serializeDisplacement(disp: DisplacementParameters): SerializedDisplacementParameters {
  return {
    epsilon: disp.epsilon,
    multiplier: disp.multiplier,
    factor: disp.factor,
    frequency: disp.frequency,
    amplitude: disp.amplitude,
    lacunarity: disp.lacunarity,
    octaves: disp.octaves,
  };
}

function serializeColorRamp(ramp: ColorRamp): SerializedColorRamp {
  return {
    steps: ramp.steps.map(serializeColorRampStep),
  };
}

function serializeColorRampStep(step: ColorRampStep): SerializedColorRampStep {
  return {
    id: step.id,
    color: { r: step.color.r, g: step.color.g, b: step.color.b },
    alpha: step.alpha,
    factor: step.factor,
    isBound: step.isBound,
  };
}

function serializeBiome(biome: BiomeParameters): SerializedBiomeParameters {
  return {
    id: biome.id,
    tempMin: biome.tempMin,
    tempMax: biome.tempMax,
    humiMin: biome.humiMin,
    humiMax: biome.humiMax,
    color: { r: biome.color.r, g: biome.color.g, b: biome.color.b },
    smoothness: biome.smoothness,
    emissiveIntensity: biome.emissiveIntensity,
  };
}

function serializeRing(ring: RingParameters): SerializedRingParameters {
  return {
    id: ring.id,
    innerRadius: ring.innerRadius,
    outerRadius: ring.outerRadius,
    colorRamp: serializeColorRamp(ring.colorRamp),
  };
}
