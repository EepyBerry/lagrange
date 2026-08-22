import type PlanetData from '@core/models/planet/planet-data.model.ts';
import type { PrefixedWith } from '@core/models/planet/planet-data.model.ts';
import { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { ColorMode, GradientMode, PlanetClass, PlanetType } from '@core/types.ts';
import { clampedPRNG } from '@core/utils/math-utils.ts';
import { Color } from 'three';
import { randomBoolean, randomColor, randomIntervals } from '@/core/utils/math-utils';
import { ColorRamp, ColorRampStep } from './color-ramp.model';

/**
 * Loads the given data into a target planet data object
 * @param target the object to load onto
 * @param data the data to load
 */
export function loadPlanetData(target: PlanetData, data?: PrefixedWith<PlanetData, '_'>): void {
  target.planetName = data?._planetName?.replaceAll('_', ' ') ?? target.defaultPlanetName;

  // Lighting
  target.lensFlareEnabled = data?._lensFlareEnabled ?? true;
  target.lensFlarePointsIntensity = data?._lensFlarePointsIntensity ?? 0.25;
  target.lensFlareGlareIntensity = data?._lensFlareGlareIntensity ?? 0.4;
  target.sunLightAngle = data?._sunLightAngle ?? -30;
  target.sunLightColor.set(data?._sunLightColor ?? 0xfff6e8);
  target.sunLightIntensity = data?._sunLightIntensity ?? 10;
  target.ambLightColor.set(data?._ambLightColor ?? 0xffffff);
  target.ambLightIntensity = data?._ambLightIntensity ?? 0.02;

  // Planet & Rendering
  target.planetType = data?._planetType ?? PlanetType.PLANET;
  target.planetClass = data?._planetClass ?? PlanetClass.PLANET_TELLURIC;
  target.planetRadius = data?._planetRadius ?? 1;
  target.planetAxialTilt = data?._planetAxialTilt ?? 15;
  target.planetRotation = data?._planetRotation ?? 0;
  target.planetWaterRoughness = data?._planetWaterRoughness ?? 0.55;
  target.planetWaterMetalness = data?._planetWaterMetalness ?? 0.5;
  target.planetGroundRoughness = data?._planetGroundRoughness ?? 0.8;
  target.planetGroundMetalness = data?._planetGroundMetalness ?? 0.1;
  target.planetWaterLevel = data?._planetWaterLevel ?? 0.5;
  target.planetShowEmissive = data?._planetShowEmissive ?? false;
  target.planetWaterEmissiveIntensity = data?._planetWaterEmissiveIntensity ?? 2;
  target.planetGroundEmissiveIntensity = data?._planetGroundEmissiveIntensity ?? 0;

  // Surface
  target.planetSurfaceShowBumps = data?._planetSurfaceShowBumps ?? true;
  target.planetSurfaceBumpStrength = data?._planetSurfaceBumpStrength ?? 0.0875;
  target.planetSurfaceShowWarping = data?._planetSurfaceShowWarping ?? false;
  target.planetSurfaceShowDisplacement = data?._planetSurfaceShowDisplacement ?? false;
  target.planetSurfaceDisplacement.loadData(data?._planetSurfaceDisplacement);
  target.planetSurfaceNoise.loadData(data?._planetSurfaceNoise);
  target.planetSurfaceColorRamp.loadFromSteps(
    data?._planetSurfaceColorRamp
      ? data?._planetSurfaceColorRamp._steps
      : [
          new ColorRampStep(0x000000, 0, true),
          new ColorRampStep(0x0b1931, 0.4),
          new ColorRampStep(0x2d4265, 0.495),
          new ColorRampStep(0x2f2e10, 0.5),
          new ColorRampStep(0x446611, 0.525),
          new ColorRampStep(0x223b05, 0.65),
          new ColorRampStep(0x223b05, 1, true),
        ],
  );

  // Biomes
  target.biomesEnabled = data?._biomesEnabled ?? true;
  target.biomesTemperatureMode = data?._biomesTemperatureMode ?? GradientMode.REALISTIC;
  target.biomesTemperatureNoise.loadData(data?._biomesTemperatureNoise);
  target.biomesHumidityMode = data?._biomesHumidityMode ?? GradientMode.REALISTIC;
  target.biomesHumidityNoise.loadData(data?._biomesHumidityNoise);
  target.clearBiomes();
  if (data?._biomesParams && data?._biomesParams?.length > 0) {
    target.addBiomesFromData(data?._biomesParams);
  }

  // Cracks
  target.cracksEnabled = data?._cracksEnabled ?? false;
  target.cracksDistanceToEdge = data?._cracksDistanceToEdge ?? 0.01;
  target.cracksEmissiveIntensity = data?._cracksEmissiveIntensity ?? 2.5;
  target.cracksBaseNoise.loadData(data?._cracksBaseNoise);
  target.cracksDetailNoise.loadData(data?._cracksDetailNoise);
  target.cracksLimiterNoise.loadData(data?._cracksLimiterNoise);
  target.cracksColorNoise.loadData(data?._cracksColorNoise);
  target.cracksColorRamp.loadFromSteps(
    data?._cracksColorRamp?._steps ?? [
      new ColorRampStep(0x2e221b, 0, true),
      new ColorRampStep(0xad5a11, 0.55),
      new ColorRampStep(0xe6962e, 0.8),
      new ColorRampStep(0xffdc73, 1, true),
    ],
  );

  // Craters
  target.cratersEnabled = data?._cratersEnabled ?? false;
  target.cratersBaseNoise.loadData(data?._cratersBaseNoise);
  target.cratersDetailNoise.loadData(data?._cratersDetailNoise);
  target.cratersColorRamp.loadFromSteps(
    data?._cratersColorRamp?._steps ?? [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x000000, 0.27),
      new ColorRampStep(0x8f8f8f, 0.34),
      new ColorRampStep(0x7f7f7f, 0.4),
      new ColorRampStep(0x7f7f7f, 1, true),
    ],
  );

  // Clouds
  target.cloudsEnabled = data?._cloudsEnabled ?? true;
  target.cloudsRotation = data?._cloudsRotation ?? 0;
  target.cloudsShowWarping = data?._cloudsShowWarping ?? false;
  target.cloudsShowDisplacement = data?._cloudsShowDisplacement ?? false;
  target.cloudsDisplacement.loadData(data?._cloudsDisplacement);
  target.cloudsNoise.loadData(data?._cloudsNoise);
  target.cloudsColor.set(data?._cloudsColor ?? 0xffffff);
  target.cloudsColorRamp.loadFromSteps(
    data?._cloudsColorRamp
      ? data?._cloudsColorRamp._steps
      : [new ColorRampStep(0x000000, 0, true), new ColorRampStep(0x000000, 0.6), new ColorRampStep(0xffffff, 1, true)],
  );

  // Atmosphere
  target.atmosphereEnabled = data?._atmosphereEnabled ?? true;
  target.atmosphereHeight = data?._atmosphereHeight ?? 0.01;
  target.atmosphereDensityScale = data?._atmosphereDensityScale ?? 7.5;
  target.atmosphereIntensity = data?._atmosphereIntensity ?? 1.35;
  target.atmosphereColorMode = data?._atmosphereColorMode ?? ColorMode.REALISTIC;
  target.atmosphereHue = data?._atmosphereHue ?? 0;
  target.atmosphereTint.set(data?._atmosphereTint ?? 0xffffff);
  target.atmosphereMieScatteringConstant = data?._atmosphereMieScatteringConstant ?? -0.78;
  target.atmosphereRayleighDensityRatio = data?._atmosphereRayleighDensityRatio ?? 0.05;
  target.atmosphereMieDensityRatio = data?._atmosphereMieDensityRatio ?? 0.02;
  target.atmosphereOpticalDensityRatio = data?._atmosphereOpticalDensityRatio ?? 0.25;

  // Ring
  target.ringsEnabled = data?._ringsEnabled ?? false;
  target.clearRings();
  if (data?._ringsParams && data?._ringsParams?.length > 0) {
    data?._ringsParams.forEach((params) => target.addRing(params));
  }

  // Compatibility & conversion calls
  convertLegacyRingStorage(target, data);
}

/**
 * Randomize the given planet's data<br>
 * <i>(note: adjusted ranges to get more coherent data)</i>
 * @param target target planet data
 */
export function randomizePlanetData(target: PlanetData): void {
  // Lighting
  target.lensFlareEnabled = randomBoolean();
  target.lensFlarePointsIntensity = clampedPRNG(0, 1);
  target.lensFlareGlareIntensity = clampedPRNG(0, 1);
  target.sunLightAngle = clampedPRNG(-90, 90);
  target.sunLightColor.set(clampedPRNG(0.5, 1) * 0xffffff);
  target.dataEventEndpoint.emit('sunlightColor', { value: target.sunLightColor });
  target.sunLightIntensity = clampedPRNG(10, 35);
  target.ambLightColor.set(clampedPRNG(0.5, 1) * 0xffffff);
  target.dataEventEndpoint.emit('ambientLightColor', { value: target.ambLightColor });
  target.ambLightIntensity = clampedPRNG(0, 0.25);

  // Planet & Rendering
  target.planetType = Math.round(clampedPRNG(0, 2)) as PlanetType;
  const availablePlanetClasses = target.getPlanetClassesFromType(target.planetType);
  target.planetClass = availablePlanetClasses[Math.round(clampedPRNG(0, availablePlanetClasses.length - 1))];
  target.planetRadius = clampedPRNG(0.5, 1);
  target.planetAxialTilt = clampedPRNG(-180, 180);
  target.planetRotation = clampedPRNG(0, 360);
  target.planetWaterRoughness = clampedPRNG(0, 1);
  target.planetWaterMetalness = clampedPRNG(0, 1);
  target.planetWaterEmissiveIntensity = clampedPRNG(0, 10);
  target.planetGroundRoughness = clampedPRNG(0, 1);
  target.planetGroundMetalness = clampedPRNG(0, 1);
  target.planetGroundEmissiveIntensity = clampedPRNG(0, 10);
  target.planetWaterLevel = clampedPRNG(0, 1);
  target.planetShowEmissive = randomBoolean();

  // Surface
  target.planetSurfaceShowBumps = randomBoolean();
  target.planetSurfaceBumpStrength = clampedPRNG(0, 0.2);
  target.planetSurfaceShowWarping = randomBoolean();
  target.planetSurfaceShowDisplacement = randomBoolean();
  target.planetSurfaceDisplacement.randomize();
  target.planetSurfaceNoise.randomize();
  target.planetSurfaceColorRamp.randomize(8);

  // Biomes
  target.biomesEnabled = randomBoolean();
  target.biomesTemperatureMode = Math.round(clampedPRNG(0, 2)) as GradientMode;
  target.biomesTemperatureNoise.randomize();
  target.biomesHumidityMode = Math.round(clampedPRNG(0, 2)) as GradientMode;
  target.biomesHumidityNoise.randomize();
  target.clearBiomes();
  const biomesCount = Math.round(clampedPRNG(0, 8));
  for (let i = 0; i < biomesCount; i++) {
    if (i < target.biomesParams.length) {
      target.biomesParams[i].randomize();
    } else {
      const b = BiomeParameters.createRandom(target.dataEventEndpoint);
      target.biomesParams.push(b);
      target.dataEventEndpoint.emit('biomeAdd', { value: b });
    }
  }

  // Cracks
  target.cracksEnabled = randomBoolean();
  target.cracksDistanceToEdge = clampedPRNG(0.001, 0.02);
  target.cracksEmissiveIntensity = clampedPRNG(0, 10);
  target.cracksUnderwaterStrength = clampedPRNG(0, 1);
  target.cracksDetailNoiseStrength = clampedPRNG(0, 1);
  target.cracksBaseNoise.randomize();
  target.cracksDetailNoise.randomize();
  target.cracksLimiterNoise.randomize();
  target.cracksColorNoise.randomize();
  target.cracksColorRamp.randomize(4);

  // Craters
  target.cratersEnabled = randomBoolean();
  target.cratersBaseNoise.randomize();
  target.cratersDetailNoise.randomize();
  //target.cratersColorRamp.randomize(4);

  // Clouds
  target.cloudsEnabled = randomBoolean();
  target.cloudsRotation = clampedPRNG(0, 360);
  target.cloudsShowWarping = randomBoolean();
  target.cloudsShowDisplacement = randomBoolean();
  target.cloudsDisplacement.randomize();
  target.cloudsNoise.randomize();
  target.cloudsColor.set(clampedPRNG(0, 1) * 0xffffff);
  target.dataEventEndpoint.emit('cloudsColor', { value: target.cloudsColor });
  target.cloudsColorRamp.loadFromSteps([
    new ColorRampStep(0x000000, 0, true),
    new ColorRampStep(randomColor(true), clampedPRNG(0.05, 0.95)),
    new ColorRampStep(randomColor(true), 1, true),
  ]);

  // Atmosphere
  target.atmosphereEnabled = randomBoolean();
  target.atmosphereHeight = clampedPRNG(0.0075, 0.025);
  target.atmosphereDensityScale = clampedPRNG(0.25, 10);
  target.atmosphereIntensity = clampedPRNG(0.25, 2.5);
  target.atmosphereColorMode = Math.round(clampedPRNG(0, 2)) as ColorMode;
  target.atmosphereHue = clampedPRNG(0, 2);
  target.atmosphereTint.set(clampedPRNG(0, 1) * 0xffffff);
  target.dataEventEndpoint.emit('atmosphereTint', { value: target.atmosphereTint });
  target.atmosphereMieScatteringConstant = clampedPRNG(-0.999, -0.5);
  target.atmosphereRayleighDensityRatio = clampedPRNG(0.05, 0.95);
  target.atmosphereMieDensityRatio = clampedPRNG(0.05, 0.95);
  target.atmosphereOpticalDensityRatio = clampedPRNG(0.05, 0.95);

  // Ring
  target.ringsEnabled = randomBoolean();
  target.clearRings();
  const ringIntervals = randomIntervals(1.25, 4.75, 2 * Math.round(clampedPRNG(2, 16) / 2));
  for (let i = 0; i < ringIntervals.length; i++) {
    const interval = ringIntervals[i];
    if (i < target.ringsParams.length) {
      target.ringsParams[i].randomize();
      target.ringsParams[i].innerRadius = interval[0];
      target.ringsParams[i].outerRadius = interval[1];
    } else {
      const newRing = RingParameters.createRandom(target.dataEventEndpoint);
      target.ringsParams.push(newRing);
      target.dataEventEndpoint.emit('ringAdd', { value: newRing });
      newRing.innerRadius = interval[0];
      newRing.outerRadius = interval[1];
    }
  }
}

/**
 * Resets the given planet's data to defaults
 * @param target target planet data
 */
export function resetPlanetData(target: PlanetData): void {
  target.planetName = target.defaultPlanetName;

  // Lighting
  target.lensFlareEnabled = true;
  target.lensFlarePointsIntensity = 0.25;
  target.lensFlareGlareIntensity = 0.4;
  target.sunLightAngle = -30;
  target.sunLightColor = new Color(0xfff6e8);
  target.sunLightIntensity = 10;
  target.ambLightColor = new Color(0xffffff);
  target.ambLightIntensity = 0;

  // Planet & Rendering
  target.planetType = PlanetType.PLANET;
  target.planetClass = PlanetClass.PLANET_TELLURIC;
  target.planetMeshQuality = 64;
  target.planetRadius = 1;
  target.planetAxialTilt = -15;
  target.planetRotation = 0;
  target.planetWaterRoughness = 0.55;
  target.planetWaterMetalness = 0.1;
  target.planetGroundRoughness = 0.8;
  target.planetGroundMetalness = 0.1;
  target.planetWaterLevel = 0.5;
  target.planetShowEmissive = false;
  target.planetWaterEmissiveIntensity = 2;
  target.planetGroundEmissiveIntensity = 0;

  // Surface
  target.planetSurfaceShowBumps = true;
  target.planetSurfaceBumpStrength = 0.09;
  target.planetSurfaceShowWarping = false;
  target.planetSurfaceShowDisplacement = false;
  target.planetSurfaceDisplacement.reset(2, 0.2, 2, 6, 0.001, 2, 0.05);
  target.planetSurfaceNoise.reset(4.57, 0.49, 2.45, 6, 1, 1);
  target.planetSurfaceColorRamp.loadFromSteps([
    new ColorRampStep(0x000000, 0, true),
    new ColorRampStep(0x0b1931, 0.4),
    new ColorRampStep(0x2d4265, 0.495),
    new ColorRampStep(0x766f17, 0.5),
    new ColorRampStep(0x446611, 0.505),
    new ColorRampStep(0x223b05, 0.65),
    new ColorRampStep(0x223b05, 1, true),
  ]);

  // Features
  target.biomesEnabled = true;
  target.biomesTemperatureMode = GradientMode.REALISTIC;
  target.biomesTemperatureNoise.reset(2.5, 1.25, 2.4, 6, 1, 1);
  target.biomesHumidityMode = GradientMode.FULLNOISE;
  target.biomesHumidityNoise.reset(3.15, 0.65, 2.57, 6, 1, 1);
  target.clearBiomes();
  target.addBiomes([
    new BiomeParameters(
      { endpointRef: target.dataEventEndpoint },
      {
        temperatureMin: 0,
        temperatureMax: 0.1,
        humidityMin: 0.35,
        humidityMax: 1,
      },
      new Color(0xffffff),
      0.25,
    ),
    new BiomeParameters(
      { endpointRef: target.dataEventEndpoint },
      {
        temperatureMin: 0.77,
        temperatureMax: 1,
        humidityMin: 0,
        humidityMax: 0.73,
      },
      new Color(0xbaa345),
      0.25,
    ),
    new BiomeParameters(
      { endpointRef: target.dataEventEndpoint },
      {
        temperatureMin: 0,
        temperatureMax: 1,
        humidityMin: 0,
        humidityMax: 0.685,
      },
      new Color(0x132e06),
      0.25,
    ),
  ]);

  target.cracksEnabled = false;
  target.cracksDistanceToEdge = 0.01;
  target.cracksEmissiveIntensity = 2.5;
  target.cracksDetailNoiseStrength = 0.5;
  target.cracksBaseNoise.reset(3.97, 1);
  target.cracksDetailNoise.reset(0.6, 1, 3, 8);
  target.cracksLimiterNoise.reset(6.96, 0.49, 2.5, 4);
  target.cracksColorNoise.reset(25, 0.8, 3, 4, 1);
  target.cracksColorRamp.loadFromSteps([
    new ColorRampStep(0x2e221b, 0, true),
    new ColorRampStep(0xad5a11, 0.55),
    new ColorRampStep(0xe6962e, 0.8),
    new ColorRampStep(0xffdc73, 1, true),
  ]);

  // Craters
  target.cratersEnabled = false;
  target.cratersBaseNoise.reset(7.25, 1);
  target.cratersDetailNoise.reset(3.8, 1, 2.6, 6);
  target.cratersColorRamp.loadFromSteps([
    new ColorRampStep(0x000000, 0, true),
    new ColorRampStep(0x000000, 0.27),
    new ColorRampStep(0x8f8f8f, 0.34),
    new ColorRampStep(0x7f7f7f, 0.4),
    new ColorRampStep(0x7f7f7f, 1, true),
  ]);

  // Clouds
  target.cloudsEnabled = true;
  target.cloudsRotation = 0;
  target.cloudsShowWarping = false;
  target.cloudsShowDisplacement = false;
  target.cloudsDisplacement.reset(2, 0.2, 2, 6, 0.001, 2, 0.05);
  target.cloudsNoise.reset(4, 0.6, 1.75, 6, 1, 1);
  target.cloudsColor = new Color(0xffffff);
  target.cloudsColorRamp.loadFromSteps([
    new ColorRampStep(0x000000, 0, true),
    new ColorRampStep(0x000000, 0.6),
    new ColorRampStep(0xffffff, 1, true),
  ]);

  // Atmosphere
  target.atmosphereEnabled = true;
  target.atmosphereHeight = 0.01;
  target.atmosphereDensityScale = 10;
  target.atmosphereIntensity = 1.5;
  target.atmosphereColorMode = ColorMode.REALISTIC;
  target.atmosphereHue = 0;
  target.atmosphereTint = new Color(0xffffff);
  target.atmosphereMieScatteringConstant = -0.999;
  target.atmosphereRayleighDensityRatio = 0.05;
  target.atmosphereMieDensityRatio = 0.02;
  target.atmosphereOpticalDensityRatio = 0.25;

  // Ring
  target.ringsEnabled = false;
  target.clearRings();
}

type LegacyRingPlanetData = PrefixedWith<PlanetData, '_'> & {
  _id: string;
  _ringEnabled: boolean;
  _ringInnerRadius: number;
  _ringOuterRadius: number;
  _ringColorRamp: ColorRamp;
};

/**
 * Converts legacy singular ring storage to multi-ring format
 * @since v0.4.3
 * @param self target PlanetData object
 * @param legacyData legacy data object
 */
function convertLegacyRingStorage(self: PlanetData, legacyData?: PrefixedWith<PlanetData, '_'>): void {
  const typedLegacyData = legacyData as LegacyRingPlanetData | undefined;
  if (typedLegacyData?._ringInnerRadius) {
    self.ringsEnabled = typedLegacyData._ringEnabled ?? false;
    const convertedParams = new RingParameters(
      { endpointRef: self.dataEventEndpoint },
      typedLegacyData._ringInnerRadius ?? 1.25,
      typedLegacyData._ringOuterRadius ?? 1.5,
      typedLegacyData._ringColorRamp?._steps,
    );
    convertedParams.id = typedLegacyData._id ? typedLegacyData._id : convertedParams.id;
    self.ringsParams.push(convertedParams);
  }
}
