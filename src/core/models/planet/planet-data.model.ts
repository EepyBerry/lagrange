import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import { ColorRamp, ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import { DisplacementParameters } from '@core/models/planet/displacement-parameters.model.ts';
import { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';
import { FbmNoiseParameters } from '@core/models/planet/noise/fbm-noise-parameters.model.ts';
import { VoronoiMode, VoronoiNoiseParameters } from '@core/models/planet/noise/voronoi-noise-parameters.model.ts';
import { loadPlanetData } from '@core/models/planet/planet-data.utils.ts';
import { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { ColorMode, GradientMode, PlanetClass, PlanetType } from '@core/types.ts';
import { isNumeric } from '@core/utils/math-utils.ts';
import { Color } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';

export type PrefixedWith<T, Prefix extends string> = {
  [InternalProp in keyof T as `${Prefix}${string & InternalProp}`]: T[InternalProp];
};
export default class PlanetData {
  public readonly dataEventEndpoint = new DataEventEndpoint<keyof DataEventPayloadTypeMap>('endpoint-model');

  // --------------------------------------------------
  // |                      Init                      |
  // --------------------------------------------------

  private readonly _defaultPlanetName: string;
  private _planetName: string;

  private _initCamDistance: number = 4;
  private _initCamAngle: number = -60;

  // --------------------------------------------------

  public get defaultPlanetName(): string {
    return this._defaultPlanetName;
  }

  public get planetName(): string {
    return this._planetName;
  }
  public set planetName(value: string) {
    this._planetName = value;
  }

  public get initCamDistance() {
    return this._initCamDistance;
  }
  public get initCamAngle() {
    return this._initCamAngle;
  }

  // --------------------------------------------------
  // |               Lighting settings                |
  // --------------------------------------------------

  private _lensFlareEnabled: boolean;
  private _lensFlarePointsIntensity: number;
  private _lensFlareGlareIntensity: number;
  private _sunLightAngle: number;
  private readonly _sunLightColor: Color;
  private _sunLightIntensity: number;
  private readonly _ambLightColor: Color;
  private _ambLightIntensity: number;

  // --------------------------------------------------

  public get lensFlareEnabled(): boolean {
    return this._lensFlareEnabled;
  }
  public set lensFlareEnabled(value: boolean) {
    this._lensFlareEnabled = value;
    this.dataEventEndpoint.emit('lensFlareEnabled', { value });
  }
  public get lensFlarePointsIntensity(): number {
    return this._lensFlarePointsIntensity;
  }
  public set lensFlarePointsIntensity(value: number) {
    this._lensFlarePointsIntensity = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('lensFlarePointsIntensity', { value });
  }
  public get lensFlareGlareIntensity(): number {
    return this._lensFlareGlareIntensity;
  }
  public set lensFlareGlareIntensity(value: number) {
    this._lensFlareGlareIntensity = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('lensFlareGlareIntensity', { value });
  }

  public get sunLightAngle(): number {
    return this._sunLightAngle;
  }
  public set sunLightAngle(value: number) {
    this._sunLightAngle = clamp(value, -180, 180);
    this.dataEventEndpoint.emit('sunlightAngle', { value });
  }
  public get sunLightColor(): Color {
    return this._sunLightColor;
  }

  public set sunLightColor(value: Color) {
    this._sunLightColor.set(value);
    this.dataEventEndpoint.emit('sunlightColor', { value });
  }

  public get sunLightIntensity(): number {
    return this._sunLightIntensity;
  }

  public set sunLightIntensity(value: number) {
    this._sunLightIntensity = value;
    this.dataEventEndpoint.emit('sunlightIntensity', { value });
  }

  public get ambLightColor(): Color {
    return this._ambLightColor;
  }

  public set ambLightColor(value: Color) {
    this._ambLightColor.set(value);
    this.dataEventEndpoint.emit('ambientLightColor', { value });
  }

  public get ambLightIntensity(): number {
    return this._ambLightIntensity;
  }

  public set ambLightIntensity(value: number) {
    this._ambLightIntensity = value;
    this.dataEventEndpoint.emit('ambientLightIntensity', { value });
  }

  // --------------------------------------------------
  // |                Planet settings                 |
  // --------------------------------------------------

  private _planetType: PlanetType = PlanetType.PLANET;
  private _planetClass: PlanetClass = PlanetClass.INDETERMINATE;
  private _planetMeshQuality: number;

  private _planetRadius: number;
  private _planetAxialTilt: number;
  private _planetRotation: number;
  // Metallic roughness
  private _planetWaterRoughness: number;
  private _planetWaterMetalness: number;
  private _planetGroundRoughness: number;
  private _planetGroundMetalness: number;
  private _planetWaterLevel: number;
  // Emissive
  private _planetShowEmissive: boolean;
  private _planetWaterEmissiveIntensity: number;
  private _planetGroundEmissiveIntensity: number;

  // --------------------------------------------------

  public get planetType() {
    return this._planetType;
  }

  public set planetType(value: PlanetType) {
    this._planetType = value;
    this.dataEventEndpoint.emit('planetType', { value });
  }

  public get planetClass(): PlanetClass {
    return this._planetClass;
  }

  public set planetClass(value: PlanetClass) {
    this._planetClass = value;
    this.dataEventEndpoint.emit('planetClass', { value });
  }

  public get planetMeshQuality() {
    return this._planetMeshQuality;
  }

  public set planetMeshQuality(value: number) {
    this._planetMeshQuality = isNumeric(value) ? clamp(value, 0, 48) : 48;
    this.dataEventEndpoint.emit('meshQuality', { value });
  }

  public get planetRadius() {
    return this._planetRadius;
  }

  public set planetRadius(value: number) {
    this._planetRadius = value;
    this.dataEventEndpoint.emit('radius', { value: { surface: value, atmosphere: value + this.atmosphereHeight } });
    this.dataEventEndpoint.emit('atmosphereHeight', { value: value + this.atmosphereHeight });
  }

  public get planetAxialTilt() {
    return this._planetAxialTilt;
  }

  public set planetAxialTilt(value: number) {
    this._planetAxialTilt = isNumeric(value) ? clamp(value, -180, 180) : 0;
    this.dataEventEndpoint.emit('axialTilt', { value });
  }

  public get planetRotation() {
    return this._planetRotation;
  }

  public set planetRotation(value: number) {
    this._planetRotation = isNumeric(value) ? clamp(value, 0, 360) : 0;
    this.dataEventEndpoint.emit('rotation', { value: { surface: value, clouds: this.cloudsRotation } });
  }

  public get planetWaterMetalness(): number {
    return this._planetWaterMetalness;
  }

  public set planetWaterMetalness(value: number) {
    this._planetWaterMetalness = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('pbr', {
      value: {
        waterMetalness: value,
        waterRoughness: this.planetWaterRoughness,
        groundMetalness: this.planetGroundMetalness,
        groundRoughness: this.planetGroundRoughness,
      },
    });
  }

  public get planetWaterRoughness(): number {
    return this._planetWaterRoughness;
  }

  public set planetWaterRoughness(value: number) {
    this._planetWaterRoughness = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('pbr', {
      value: {
        waterMetalness: this.planetWaterMetalness,
        waterRoughness: value,
        groundMetalness: this.planetGroundMetalness,
        groundRoughness: this.planetGroundRoughness,
      },
    });
  }

  public get planetGroundMetalness(): number {
    return this._planetGroundMetalness;
  }

  public set planetGroundMetalness(value: number) {
    this._planetGroundMetalness = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('pbr', {
      value: {
        waterMetalness: this.planetWaterMetalness,
        waterRoughness: this.planetWaterRoughness,
        groundMetalness: value,
        groundRoughness: this.planetGroundRoughness,
      },
    });
  }

  public get planetGroundRoughness(): number {
    return this._planetGroundRoughness;
  }

  public set planetGroundRoughness(value: number) {
    this._planetGroundRoughness = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('pbr', {
      value: {
        waterMetalness: this.planetWaterMetalness,
        waterRoughness: this.planetWaterRoughness,
        groundMetalness: this.planetGroundMetalness,
        groundRoughness: value,
      },
    });
  }

  public get planetWaterLevel(): number {
    return this._planetWaterLevel;
  }

  public set planetWaterLevel(value: number) {
    this._planetWaterLevel = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('waterLevel', { value });
  }

  public get planetShowEmissive(): boolean {
    return this._planetShowEmissive;
  }

  public set planetShowEmissive(value: boolean) {
    this._planetShowEmissive = value;
    this.dataEventEndpoint.emit('showEmissive', { value });
  }

  public get planetWaterEmissiveIntensity(): number {
    return this._planetWaterEmissiveIntensity;
  }

  public set planetWaterEmissiveIntensity(value: number) {
    this._planetWaterEmissiveIntensity = clamp(value, 0, 10);
    this.dataEventEndpoint.emit('emissiveIntensity', {
      value: { water: value, ground: this.planetGroundEmissiveIntensity },
    });
  }

  public get planetGroundEmissiveIntensity(): number {
    return this._planetGroundEmissiveIntensity;
  }

  public set planetGroundEmissiveIntensity(value: number) {
    const v = clamp(value, 0, 10);
    this._planetGroundEmissiveIntensity = v;
    this._biomesParams.forEach((b) => (b.parentEmissiveIntensity = v));
    this.dataEventEndpoint.emit('emissiveIntensity', {
      value: { water: this.planetWaterEmissiveIntensity, ground: value },
    });
  }

  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceShowBumps: boolean;
  private _planetSurfaceBumpOffset: number;
  private _planetSurfaceBumpStrength: number;
  private _planetSurfaceShowWarping: boolean;
  private _planetSurfaceShowDisplacement: boolean;
  private readonly _planetSurfaceDisplacement: DisplacementParameters;
  private readonly _planetSurfaceNoise: FbmNoiseParameters;
  private readonly _planetSurfaceColorRamp: ColorRamp;

  // --------------------------------------------------

  public get planetSurfaceShowBumps(): boolean {
    return this._planetSurfaceShowBumps;
  }

  public set planetSurfaceShowBumps(value: boolean) {
    this._planetSurfaceShowBumps = value;
    this.dataEventEndpoint.emit('showBumps', { value });
  }

  public get planetSurfaceBumpOffset(): number {
    return this._planetSurfaceBumpOffset;
  }

  public set planetSurfaceBumpOffset(value: number) {
    this._planetSurfaceBumpOffset = value;
    this.dataEventEndpoint.emit('bumpOffset', { value });
  }

  public get planetSurfaceBumpStrength(): number {
    return this._planetSurfaceBumpStrength;
  }

  public set planetSurfaceBumpStrength(value: number) {
    this._planetSurfaceBumpStrength = value;
    this.dataEventEndpoint.emit('bumpStrength', { value });
  }

  public get planetSurfaceShowWarping(): boolean {
    return this._planetSurfaceShowWarping;
  }

  public set planetSurfaceShowWarping(value: boolean) {
    this._planetSurfaceShowWarping = value;
    this.dataEventEndpoint.emit('showWarping', { value });
  }

  public get planetSurfaceShowDisplacement(): boolean {
    return this._planetSurfaceShowDisplacement;
  }

  public set planetSurfaceShowDisplacement(value: boolean) {
    this._planetSurfaceShowDisplacement = value;
    this.dataEventEndpoint.emit('showDisplacement', { value });
  }

  public get planetSurfaceDisplacement(): DisplacementParameters {
    return this._planetSurfaceDisplacement;
  }

  public get planetSurfaceNoise(): FbmNoiseParameters {
    return this._planetSurfaceNoise;
  }

  public get planetSurfaceColorRamp(): ColorRamp {
    return this._planetSurfaceColorRamp;
  }

  // --------------------------------------------------
  // |                 Biome settings                 |
  // --------------------------------------------------

  private _biomesEnabled: boolean;
  private _biomesTemperatureMode: GradientMode;
  private readonly _biomesTemperatureNoise: FbmNoiseParameters;
  private _biomesHumidityMode: GradientMode;
  private readonly _biomesHumidityNoise: FbmNoiseParameters;
  private readonly _biomesParams: BiomeParameters[];

  // --------------------------------------------------

  public get biomesEnabled(): boolean {
    return this._biomesEnabled;
  }

  public set biomesEnabled(value: boolean) {
    this._biomesEnabled = value;
    this.dataEventEndpoint.emit('showBiomes', { value });
  }

  public get biomesTemperatureMode(): GradientMode {
    return this._biomesTemperatureMode;
  }

  public set biomesTemperatureMode(value: GradientMode) {
    this._biomesTemperatureMode = value;
    this.dataEventEndpoint.emit('biomesTemperatureMode', { value });
  }

  public get biomesTemperatureNoise(): FbmNoiseParameters {
    return this._biomesTemperatureNoise;
  }

  public get biomesHumidityMode(): GradientMode {
    return this._biomesHumidityMode;
  }

  public set biomesHumidityMode(value: GradientMode) {
    this._biomesHumidityMode = value;
    this.dataEventEndpoint.emit('biomesHumidityMode', { value });
  }

  public get biomesHumidityNoise(): FbmNoiseParameters {
    return this._biomesHumidityNoise;
  }

  public get biomesParams(): BiomeParameters[] {
    return this._biomesParams;
  }

  // --------------------------------------------------
  // |                Cracks settings                 |
  // --------------------------------------------------

  private _cracksEnabled: boolean;
  private _cracksEmissiveIntensity: number = 3;
  private _cracksDistanceToEdge: number = 0.01;
  private readonly _cracksBaseNoise: VoronoiNoiseParameters;
  private readonly _cracksDetailNoise: FbmNoiseParameters;
  private readonly _cracksLimiterNoise: FbmNoiseParameters;
  private readonly _cracksColorNoise: FbmNoiseParameters;
  private readonly _cracksColorRamp: ColorRamp;

  // --------------------------------------------------

  public get cracksEnabled(): boolean {
    return this._cracksEnabled;
  }

  public set cracksEnabled(value: boolean) {
    this._cracksEnabled = value;
    this.dataEventEndpoint.emit('showCracks', { value });
  }

  public get cracksDistanceToEdge(): number {
    return this._cracksDistanceToEdge;
  }

  public set cracksDistanceToEdge(value: number) {
    this._cracksDistanceToEdge = clamp(value, 0.001, 0.02);
    this.dataEventEndpoint.emit('cracksDistanceToEdge', { value });
  }

  public get cracksEmissiveIntensity(): number {
    return this._cracksEmissiveIntensity;
  }

  public set cracksEmissiveIntensity(value: number) {
    this._cracksEmissiveIntensity = value;
    this.dataEventEndpoint.emit('cracksEmissiveIntensity', { value });
  }

  public get cracksBaseNoise(): VoronoiNoiseParameters {
    return this._cracksBaseNoise;
  }

  public get cracksDetailNoise(): FbmNoiseParameters {
    return this._cracksDetailNoise;
  }

  public get cracksLimiterNoise(): FbmNoiseParameters {
    return this._cracksLimiterNoise;
  }

  public get cracksColorNoise(): FbmNoiseParameters {
    return this._cracksColorNoise;
  }

  public get cracksColorRamp(): ColorRamp {
    return this._cracksColorRamp;
  }

  // --------------------------------------------------
  // |                Clouds settings                 |
  // --------------------------------------------------

  private _cloudsEnabled: boolean;
  private _cloudsRotation: number;
  private readonly _cloudsHeight: number;
  private _cloudsShowWarping: boolean;
  private _cloudsShowDisplacement: boolean;
  private readonly _cloudsDisplacement: DisplacementParameters;
  private readonly _cloudsNoise: FbmNoiseParameters;
  private readonly _cloudsColor: Color;
  private readonly _cloudsColorRamp: ColorRamp;

  // --------------------------------------------------

  public get cloudsEnabled(): boolean {
    return this._cloudsEnabled;
  }

  public set cloudsEnabled(value: boolean) {
    this._cloudsEnabled = value;
    this.dataEventEndpoint.emit('cloudsEnabled', { value });
  }

  public get cloudsRotation() {
    return this._cloudsRotation;
  }

  public set cloudsRotation(value: number) {
    this._cloudsRotation = isNumeric(value) ? clamp(value, 0, 360) : 0;
    this.dataEventEndpoint.emit('cloudsRotation', { value: { clouds: value, surface: this.planetRotation } });
  }

  public get cloudsHeight() {
    return this._cloudsHeight;
  }

  public get cloudsShowWarping(): boolean {
    return this._cloudsShowWarping;
  }

  public set cloudsShowWarping(value: boolean) {
    this._cloudsShowWarping = value;
    this.dataEventEndpoint.emit('cloudsShowWarping', { value });
  }

  public get cloudsShowDisplacement(): boolean {
    return this._cloudsShowDisplacement;
  }

  public set cloudsShowDisplacement(value: boolean) {
    this._cloudsShowDisplacement = value;
    this.dataEventEndpoint.emit('cloudsShowDisplacement', { value });
  }

  public get cloudsDisplacement(): DisplacementParameters {
    return this._cloudsDisplacement;
  }

  public get cloudsNoise(): FbmNoiseParameters {
    return this._cloudsNoise;
  }

  public get cloudsColor(): Color {
    return this._cloudsColor;
  }

  public set cloudsColor(value: Color) {
    this._cloudsColor.set(value);
    this.dataEventEndpoint.emit('cloudsColor', { value });
  }

  public get cloudsColorRamp(): ColorRamp {
    return this._cloudsColorRamp;
  }

  // --------------------------------------------------
  // |               Atmosphere settings              |
  // --------------------------------------------------

  private _atmosphereEnabled: boolean;
  private _atmosphereHeight: number;
  private _atmosphereDensityScale: number;
  private _atmosphereIntensity: number;
  private _atmosphereColorMode: number;
  private _atmosphereHue: number;
  private readonly _atmosphereTint: Color;
  // Advanced values
  private _atmosphereMieScatteringConstant: number;
  private _atmosphereRayleighDensityRatio: number;
  private _atmosphereMieDensityRatio: number;
  private _atmosphereOpticalDensityRatio: number;

  // --------------------------------------------------

  public get atmosphereEnabled(): boolean {
    return this._atmosphereEnabled;
  }

  public set atmosphereEnabled(value: boolean) {
    this._atmosphereEnabled = value;
    this.dataEventEndpoint.emit('atmosphereEnabled', { value });
  }

  public get atmosphereHeight(): number {
    return this._atmosphereHeight;
  }

  public set atmosphereHeight(value: number) {
    this._atmosphereHeight = clamp(value, 0.0075, 0.025);
    this.dataEventEndpoint.emit('atmosphereHeight', { value: this.planetRadius + value });
  }

  public get atmosphereDensityScale(): number {
    return this._atmosphereDensityScale;
  }

  public set atmosphereDensityScale(value: number) {
    this._atmosphereDensityScale = clamp(value, 0.25, 20);
    this.dataEventEndpoint.emit('atmosphereDensityScale', { value });
  }

  public get atmosphereIntensity(): number {
    return this._atmosphereIntensity;
  }

  public set atmosphereIntensity(value: number) {
    this._atmosphereIntensity = clamp(value, 0, 5);
    this.dataEventEndpoint.emit('atmosphereIntensity', { value });
  }

  public get atmosphereColorMode(): number {
    return this._atmosphereColorMode;
  }

  public set atmosphereColorMode(value: number) {
    this._atmosphereColorMode = value;
    this.dataEventEndpoint.emit('atmosphereColorMode', { value });
  }

  public get atmosphereHue(): number {
    return this._atmosphereHue;
  }

  public set atmosphereHue(value: number) {
    this._atmosphereHue = clamp(value, 0, 2);
    this.dataEventEndpoint.emit('atmosphereHue', { value });
  }

  public get atmosphereTint(): Color {
    return this._atmosphereTint;
  }

  public set atmosphereTint(value: Color) {
    this._atmosphereTint.set(value);
    this.dataEventEndpoint.emit('atmosphereTint', { value });
  }

  public get atmosphereMieScatteringConstant(): number {
    return this._atmosphereMieScatteringConstant;
  }

  public set atmosphereMieScatteringConstant(value: number) {
    this._atmosphereMieScatteringConstant = clamp(value, -0.999, 0);
    this.dataEventEndpoint.emit('atmosphereMieScatteringConstant', { value });
  }

  public get atmosphereRayleighDensityRatio(): number {
    return this._atmosphereRayleighDensityRatio;
  }

  public set atmosphereRayleighDensityRatio(value: number) {
    this._atmosphereRayleighDensityRatio = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('atmosphereRayleighDensityRatio', { value });
  }

  public get atmosphereMieDensityRatio(): number {
    return this._atmosphereMieDensityRatio;
  }

  public set atmosphereMieDensityRatio(value: number) {
    this._atmosphereMieDensityRatio = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('atmosphereMieDensityRatio', { value });
  }

  public get atmosphereOpticalDensityRatio(): number {
    return this._atmosphereOpticalDensityRatio;
  }

  public set atmosphereOpticalDensityRatio(value: number) {
    this._atmosphereOpticalDensityRatio = clamp(value, 0, 1);
    this.dataEventEndpoint.emit('atmosphereOpticalDensityRatio', { value });
  }

  // --------------------------------------------------
  // |                 Ring settings                  |
  // --------------------------------------------------

  private _ringsEnabled: boolean;
  private readonly _ringsParams: RingParameters[];

  // --------------------------------------------------

  public get ringsEnabled(): boolean {
    return this._ringsEnabled;
  }

  public set ringsEnabled(value: boolean) {
    this._ringsEnabled = value;
    this.dataEventEndpoint.emit('ringsEnabled', { value });
  }

  public get ringsParams() {
    return this._ringsParams;
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor(defaultName?: string) {
    this._defaultPlanetName = defaultName ?? 'New planet';
    this._planetName = this._defaultPlanetName;

    // Lighting
    this._lensFlareEnabled = true;
    this._lensFlarePointsIntensity = 0.25;
    this._lensFlareGlareIntensity = 0.4;
    this._sunLightAngle = -30;
    this._sunLightColor = new Color(0xfff6e8);
    this._sunLightIntensity = 10;
    this._ambLightColor = new Color(0xffffff);
    this._ambLightIntensity = 0;

    // Planet & Rendering

    this._planetType = PlanetType.PLANET;
    this._planetClass = PlanetClass.PLANET_TELLURIC;
    this._planetMeshQuality = 64;
    this._planetRadius = 1;
    this._planetAxialTilt = -15;
    this._planetRotation = 0;
    this._planetWaterRoughness = 0.55;
    this._planetWaterMetalness = 0.1;
    this._planetGroundRoughness = 0.8;
    this._planetGroundMetalness = 0.1;
    this._planetWaterLevel = 0.5;
    this._planetShowEmissive = false;
    this._planetWaterEmissiveIntensity = 2;
    this._planetGroundEmissiveIntensity = 0;

    // Surface

    this._planetSurfaceShowBumps = true;
    this._planetSurfaceBumpOffset = 0.005;
    this._planetSurfaceBumpStrength = 0.09;
    this._planetSurfaceShowWarping = false;
    this._planetSurfaceShowDisplacement = false;
    this._planetSurfaceDisplacement = new DisplacementParameters(
      { context: 'surface', endpointRef: this.dataEventEndpoint },
      2,
      0.2,
      2,
      6,
    );
    this._planetSurfaceNoise = new FbmNoiseParameters(
      { context: 'surface', endpointRef: this.dataEventEndpoint },
      4.57,
      0.49,
      2.45,
      6,
    );
    this._planetSurfaceColorRamp = new ColorRamp({ context: 'surface', endpointRef: this.dataEventEndpoint }, [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x0b1931, 0.4),
      new ColorRampStep(0x2d4265, 0.495),
      new ColorRampStep(0x766f17, 0.5),
      new ColorRampStep(0x446611, 0.505),
      new ColorRampStep(0x223b05, 0.65),
      new ColorRampStep(0x223b05, 1, true),
    ]);

    // Features

    this._biomesEnabled = true;
    this._biomesTemperatureMode = GradientMode.REALISTIC;
    this._biomesTemperatureNoise = new FbmNoiseParameters(
      { context: 'biomes', endpointRef: this.dataEventEndpoint },
      2.5,
      1.25,
      2.4,
      6,
    );
    this._biomesHumidityMode = GradientMode.FULLNOISE;
    this._biomesHumidityNoise = new FbmNoiseParameters(
      { context: 'biomes', endpointRef: this.dataEventEndpoint },
      3.15,
      0.65,
      2.57,
      6,
    );
    this._biomesParams = [
      new BiomeParameters(
        { endpointRef: this.dataEventEndpoint },
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
        { endpointRef: this.dataEventEndpoint },
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
        { endpointRef: this.dataEventEndpoint },
        {
          temperatureMin: 0,
          temperatureMax: 1,
          humidityMin: 0,
          humidityMax: 0.685,
        },
        new Color(0x132e06),
        0.25,
      ),
    ];
    this._biomesParams.forEach((b) => (b.parentEmissiveIntensity = this._planetGroundEmissiveIntensity));

    this._cracksEnabled = false;
    this._cracksDistanceToEdge = 0.01;
    this._cracksBaseNoise = new VoronoiNoiseParameters(
      { endpointRef: this.dataEventEndpoint },
      4,
      1,
      VoronoiMode.DistanceToEdge,
    );
    this._cracksDetailNoise = new FbmNoiseParameters(
      { context: 'cracks', endpointRef: this.dataEventEndpoint },
      6,
      1,
      2.5,
      6,
    );
    this._cracksLimiterNoise = new FbmNoiseParameters(
      { context: 'cracks', endpointRef: this.dataEventEndpoint },
      3,
      1.25,
      1.25,
      4,
    );
    this._cracksColorNoise = new FbmNoiseParameters(
      { context: 'cracks', endpointRef: this.dataEventEndpoint },
      2.5,
      1.25,
      1.75,
      4,
    );
    this._cracksColorRamp = new ColorRamp({ context: 'cracks', endpointRef: this.dataEventEndpoint }, [
      new ColorRampStep(0x2e221b, 0, true),
      new ColorRampStep(0xad5a11, 0.55),
      new ColorRampStep(0xe6962e, 0.8),
      new ColorRampStep(0xffdc73, 1, true),
    ]);
    this._cracksEmissiveIntensity = 2.5;
    // Clouds

    this._cloudsEnabled = true;
    this._cloudsRotation = 0;
    this._cloudsHeight = 1.005;
    this._cloudsShowWarping = false;
    this._cloudsShowDisplacement = false;
    this._cloudsDisplacement = new DisplacementParameters(
      { context: 'clouds', endpointRef: this.dataEventEndpoint },
      2,
      0.2,
      2,
      6,
    );
    this._cloudsNoise = new FbmNoiseParameters(
      { context: 'clouds', endpointRef: this.dataEventEndpoint },
      4,
      0.6,
      1.75,
      6,
    );
    this._cloudsColor = new Color(0xffffff);
    this._cloudsColorRamp = new ColorRamp({ context: 'clouds', endpointRef: this.dataEventEndpoint }, [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x000000, 0.6),
      new ColorRampStep(0xffffff, 1, true),
    ]);

    // Atmosphere

    this._atmosphereEnabled = true;
    this._atmosphereHeight = 0.01;
    this._atmosphereDensityScale = 10;
    this._atmosphereIntensity = 1.5;
    this._atmosphereColorMode = ColorMode.REALISTIC;
    this._atmosphereHue = 0;
    this._atmosphereTint = new Color(0xffffff);
    this._atmosphereMieScatteringConstant = -0.999;
    this._atmosphereRayleighDensityRatio = 0.05;
    this._atmosphereMieDensityRatio = 0.02;
    this._atmosphereOpticalDensityRatio = 0.25;

    // Ring

    this._ringsEnabled = false;
    this._ringsParams = [];
  }

  // --------------------------------------------------
  // |            Data handling functions             |
  // --------------------------------------------------

  public addBiome(): BiomeParameters {
    const newBiome = new BiomeParameters(
      { endpointRef: this.dataEventEndpoint },
      {
        temperatureMin: 0,
        temperatureMax: 1,
        humidityMin: 0,
        humidityMax: 1,
      },
      new Color(0xffffff),
      0.2,
    );
    this._biomesParams.push(newBiome);
    this.dataEventEndpoint.emit('biomeAdd', { value: newBiome });
    return newBiome;
  }

  public moveBiomeUp(biome: BiomeParameters): void {
    const biomeIdx = this.findBiomeIndexById(biome.id);
    if (!biome || biomeIdx < 0) {
      throw new Error(`Cannot move invalid or missing biome of ID: ${biome.id}`);
    }
    if (biomeIdx === 0) {
      console.warn('Biome is already at the top, skipping moveBiomeUp operation');
      return;
    }
    this._biomesParams.splice(biomeIdx, 1);
    this._biomesParams.splice(biomeIdx - 1, 0, biome);
    this.dataEventEndpoint.emit('biomeMoveUp', { value: biome });
  }

  public moveBiomeDown(biome: BiomeParameters): void {
    const biomeIdx = this.findBiomeIndexById(biome.id);
    if (!biome || biomeIdx < 0) {
      throw new Error(`Cannot move invalid or missing biome of ID: ${biome.id}`);
    }
    if (biomeIdx === this.biomesParams.length - 1) {
      console.warn('Biome is already at the bottom, skipping moveBiomeDown operation');
      return;
    }
    this._biomesParams.splice(biomeIdx, 1);
    this._biomesParams.splice(biomeIdx + 1, 0, biome);
    this.dataEventEndpoint.emit('biomeMoveDown', { value: biome });
  }

  public removeBiome(biome: BiomeParameters) {
    const biomeIdx = this.findBiomeIndexById(biome.id);
    if (biomeIdx < 0) {
      throw new Error(`Cannot delete invalid or missing biome of ID: ${biome.id}`);
    }
    this._biomesParams.splice(biomeIdx, 1);
    this.dataEventEndpoint.emit('biomeRemove', { value: biome });
  }

  public addRing(): RingParameters {
    const newRing = new RingParameters({ endpointRef: this.dataEventEndpoint }, 1.5, 1.75);
    this._ringsParams.push(newRing);
    this.dataEventEndpoint.emit('ringAdd', { instanceId: newRing.id, value: newRing });
    return newRing;
  }

  public removeRing(ring: RingParameters): string {
    const ringParamsIdx = this.findRingIndexById(ring.id);
    if (!ring || ringParamsIdx < 0) {
      throw new Error(`Cannot delete invalid or missing ring of ID: ${ring.id}`);
    }
    this._ringsParams.splice(ringParamsIdx, 1);
    this.dataEventEndpoint.emit('ringRemove', { instanceId: ring.id, value: ring });
    return ring.id;
  }

  // --------------------------------------------------
  // |               Utility functions                |
  // --------------------------------------------------

  public findBiomeIndexById(id: string) {
    return this._biomesParams.findIndex((b) => b.id === id);
  }

  public findRingIndexById(id: string) {
    return this._ringsParams.findIndex((b) => b.id === id);
  }

  public getPlanetClassesFromType(t: PlanetType) {
    switch (t) {
      case PlanetType.PLANET:
        return [
          PlanetClass.PLANET_TELLURIC,
          PlanetClass.PLANET_ICE,
          PlanetClass.PLANET_OCEAN,
          PlanetClass.PLANET_TROPICAL,
          PlanetClass.PLANET_ARID,
          PlanetClass.PLANET_CHTHONIAN,
          PlanetClass.PLANET_MAGMATIC,
          PlanetClass.INDETERMINATE,
        ];
      case PlanetType.MOON:
        return [PlanetClass.MOON_ICE, PlanetClass.MOON_ROCKY, PlanetClass.MOON_CHTHONIAN, PlanetClass.INDETERMINATE];
      case PlanetType.GASGIANT:
        return [PlanetClass.GASGIANT_COLD, PlanetClass.GASGIANT_HOT, PlanetClass.INDETERMINATE];
    }
  }

  // --------------------------------------------------
  // |               Static functions                 |
  // --------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static createFrom(data: any) {
    const planetData = new PlanetData();
    loadPlanetData(planetData, data);
    return planetData;
  }
}
