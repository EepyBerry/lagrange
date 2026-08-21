export interface SerializedColor {
  r: number;
  g: number;
  b: number;
}

export interface SerializedVector3 {
  x: number;
  y: number;
  z: number;
}

export interface SerializedFbmNoiseParameters {
  frequency: number;
  amplitude: number;
  lacunarity: number;
  octaves: number;
  layers: number;
  warpFactor: SerializedVector3;
}

export interface SerializedDisplacementParameters {
  epsilon: number;
  multiplier: number;
  factor: number;
  frequency: number;
  amplitude: number;
  lacunarity: number;
  octaves: number;
}

export interface SerializedVoronoiNoiseParameters {
  scale: number;
  jitter: number;
}

export interface SerializedColorRampStep {
  id: string;
  color: SerializedColor;
  alpha: number;
  factor: number;
  isBound: boolean;
}

export interface SerializedColorRamp {
  steps: SerializedColorRampStep[];
}

export interface SerializedBiomeParameters {
  id: string;
  tempMin: number;
  tempMax: number;
  humiMin: number;
  humiMax: number;
  color: SerializedColor;
  smoothness: number;
  emissiveIntensity: number;
}

export interface SerializedRingParameters {
  id: string;
  innerRadius: number;
  outerRadius: number;
  colorRamp: SerializedColorRamp;
}

export interface SerializedPlanetData {
  defaultPlanetName: string;
  planetName: string;
  initCamDistance: number;
  initCamAngle: number;
  lensFlareEnabled: boolean;
  lensFlarePointsIntensity: number;
  lensFlareGlareIntensity: number;
  sunLightAngle: number;
  sunLightColor: SerializedColor;
  sunLightIntensity: number;
  ambLightColor: SerializedColor;
  ambLightIntensity: number;
  planetType: number;
  planetClass: number;
  planetMeshQuality: number;
  planetRadius: number;
  planetAxialTilt: number;
  planetRotation: number;
  planetWaterRoughness: number;
  planetWaterMetalness: number;
  planetGroundRoughness: number;
  planetGroundMetalness: number;
  planetWaterLevel: number;
  planetShowEmissive: boolean;
  planetWaterEmissiveIntensity: number;
  planetGroundEmissiveIntensity: number;
  planetSurfaceShowBumps: boolean;
  planetSurfaceBumpOffset: number;
  planetSurfaceBumpStrength: number;
  planetSurfaceShowWarping: boolean;
  planetSurfaceShowDisplacement: boolean;
  planetSurfaceDisplacement: SerializedDisplacementParameters;
  planetSurfaceNoise: SerializedFbmNoiseParameters;
  planetSurfaceColorRamp: SerializedColorRamp;
  biomesEnabled: boolean;
  biomesTemperatureMode: number;
  biomesTemperatureNoise: SerializedFbmNoiseParameters;
  biomesHumidityMode: number;
  biomesHumidityNoise: SerializedFbmNoiseParameters;
  biomesParams: SerializedBiomeParameters[];
  cracksEnabled: boolean;
  cracksDistanceToEdge: number;
  cracksEmissiveIntensity: number;
  cracksUnderwaterStrength: number;
  cracksDetailNoiseStrength: number;
  cracksBaseNoise: SerializedVoronoiNoiseParameters;
  cracksDetailNoise: SerializedFbmNoiseParameters;
  cracksLimiterNoise: SerializedFbmNoiseParameters;
  cracksColorNoise: SerializedFbmNoiseParameters;
  cracksColorRamp: SerializedColorRamp;
  cratersEnabled: boolean;
  cratersBaseNoise: SerializedVoronoiNoiseParameters;
  cratersDetailNoise: SerializedFbmNoiseParameters;
  cratersColorRamp: SerializedColorRamp;
  cloudsEnabled: boolean;
  cloudsRotation: number;
  cloudsHeight: number;
  cloudsShowWarping: boolean;
  cloudsShowDisplacement: boolean;
  cloudsDisplacement: SerializedDisplacementParameters;
  cloudsNoise: SerializedFbmNoiseParameters;
  cloudsColor: SerializedColor;
  cloudsColorRamp: SerializedColorRamp;
  atmosphereEnabled: boolean;
  atmosphereHeight: number;
  atmosphereDensityScale: number;
  atmosphereIntensity: number;
  atmosphereColorMode: number;
  atmosphereHue: number;
  atmosphereTint: SerializedColor;
  atmosphereMieScatteringConstant: number;
  atmosphereRayleighDensityRatio: number;
  atmosphereMieDensityRatio: number;
  atmosphereOpticalDensityRatio: number;
  ringsEnabled: boolean;
  ringsParams: SerializedRingParameters[];
}
