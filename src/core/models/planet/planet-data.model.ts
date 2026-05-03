import { convertLegacyRingStorage } from '@core/helpers/compatibility.helper.ts';
import { BiomeParameters } from '@core/models/planet/biome-parameters.model.ts';
import { ColorRamp, ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import { DisplacementParameters } from '@core/models/planet/displacement-parameters.model.ts';
import { NoiseParameters } from '@core/models/planet/noise-parameters.model.ts';
import { RingParameters } from '@core/models/planet/ring-parameters.model.ts';
import { ColorMode, GradientMode, PlanetClass, PlanetType } from '@core/types.ts';
import { clampedPRNG, isNumeric, randomBoolean, randomColor, randomIntervals } from '@core/utils/math-utils.ts';
import { Observable, ObservableEventAction } from '@core/utils/observable-utils.ts';
import { Color } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';

export type PrefixedWith<T, Prefix extends string> = {
  [InternalProp in keyof T as `${Prefix}${string & InternalProp}`]: T[InternalProp];
};
export default class PlanetData extends Observable {
  // --------------------------------------------------
  // |                      Init                      |
  // --------------------------------------------------

  private _defaultPlanetName: string;
  private _planetName: string;

  private _initCamDistance: number = 4;
  private _initCamAngle: number = -60;

  // --------------------------------------------------

  public get planetName(): string {
    return this._planetName;
  }
  public set planetName(value: string) {
    this._planetName = value;
    this.notify({ key: 'planetName' });
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
  private _sunLightColor: Color;
  private _sunLightIntensity: number;
  private _ambLightColor: Color;
  private _ambLightIntensity: number;

  // --------------------------------------------------

  public get lensFlareEnabled(): boolean {
    return this._lensFlareEnabled;
  }
  public set lensFlareEnabled(value: boolean) {
    this._lensFlareEnabled = value;
    this.notify({ key: 'lensFlareEnabled' });
  }
  public get lensFlarePointsIntensity(): number {
    return this._lensFlarePointsIntensity;
  }
  public set lensFlarePointsIntensity(value: number) {
    this._lensFlarePointsIntensity = clamp(value, 0, 1);
    this.notify({ key: 'lensFlarePointsIntensity' });
  }
  public get lensFlareGlareIntensity(): number {
    return this._lensFlareGlareIntensity;
  }
  public set lensFlareGlareIntensity(value: number) {
    this._lensFlareGlareIntensity = clamp(value, 0, 1);
    this.notify({ key: 'lensFlareGlareIntensity' });
  }

  public get sunLightAngle(): number {
    return this._sunLightAngle;
  }
  public set sunLightAngle(value: number) {
    this._sunLightAngle = clamp(value, -180, 180);
    this.notify({ key: 'sunLightAngle' });
  }
  public get sunLightColor(): Color {
    return this._sunLightColor;
  }
  public set sunLightColor(value: Color) {
    this._sunLightColor.set(value);
    this.notify({ key: 'sunLightColor' });
  }
  public get sunLightIntensity(): number {
    return this._sunLightIntensity;
  }
  public set sunLightIntensity(value: number) {
    this._sunLightIntensity = value;
    this.notify({ key: 'sunLightIntensity' });
  }

  public get ambLightColor(): Color {
    return this._ambLightColor;
  }
  public set ambLightColor(value: Color) {
    this._ambLightColor.set(value);
    this.notify({ key: 'ambLightColor' });
  }
  public get ambLightIntensity(): number {
    return this._ambLightIntensity;
  }
  public set ambLightIntensity(value: number) {
    this._ambLightIntensity = value;
    this.notify({ key: 'ambLightIntensity' });
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
  public set planetType(ptype: PlanetType) {
    this._planetType = ptype;
    this.notify({ key: 'planetType' });
  }
  public get planetClass(): PlanetClass {
    return this._planetClass;
  }
  public set planetClass(value: PlanetClass) {
    this._planetClass = value;
    this.notify({ key: 'planetClass' });
  }
  public get planetMeshQuality() {
    return this._planetMeshQuality;
  }
  public set planetMeshQuality(quality: number) {
    this._planetMeshQuality = isNumeric(quality) ? clamp(quality, 0, 48) : 48;
    this.notify({ key: 'planetMeshQuality' });
  }

  public get planetRadius() {
    return this._planetRadius;
  }
  public set planetRadius(radius: number) {
    this._planetRadius = radius;
    this.notify({ key: 'planetRadius' });
  }
  public get planetAxialTilt() {
    return this._planetAxialTilt;
  }
  public set planetAxialTilt(tilt: number) {
    this._planetAxialTilt = isNumeric(tilt) ? clamp(tilt, -180, 180) : 0;
    this.notify({ key: 'planetAxialTilt' });
  }

  public get planetRotation() {
    return this._planetRotation;
  }
  public set planetRotation(rot: number) {
    this._planetRotation = isNumeric(rot) ? clamp(rot, 0, 360) : 0;
    this.notify({ key: 'planetRotation' });
  }

  public get planetWaterMetalness(): number {
    return this._planetWaterMetalness;
  }
  public set planetWaterMetalness(value: number) {
    this._planetWaterMetalness = clamp(value, 0, 1);
    this.notify({ key: 'planetWaterMetalness' });
  }
  public get planetWaterRoughness(): number {
    return this._planetWaterRoughness;
  }
  public set planetWaterRoughness(value: number) {
    this._planetWaterRoughness = clamp(value, 0, 1);
    this.notify({ key: 'planetWaterRoughness' });
  }

  public get planetGroundMetalness(): number {
    return this._planetGroundMetalness;
  }
  public set planetGroundMetalness(value: number) {
    this._planetGroundMetalness = clamp(value, 0, 1);
    this.notify({ key: 'planetGroundMetalness' });
  }
  public get planetGroundRoughness(): number {
    return this._planetGroundRoughness;
  }
  public set planetGroundRoughness(value: number) {
    this._planetGroundRoughness = clamp(value, 0, 1);
    this.notify({ key: 'planetGroundRoughness' });
  }

  public get planetWaterLevel(): number {
    return this._planetWaterLevel;
  }
  public set planetWaterLevel(value: number) {
    this._planetWaterLevel = clamp(value, 0, 1);
    this.notify({ key: 'planetWaterLevel' });
  }

  public get planetShowEmissive(): boolean {
    return this._planetShowEmissive;
  }
  public set planetShowEmissive(value: boolean) {
    this._planetShowEmissive = value;
    this.notify({ key: 'planetShowEmissive' });
  }
  public get planetWaterEmissiveIntensity(): number {
    return this._planetWaterEmissiveIntensity;
  }
  public set planetWaterEmissiveIntensity(value: number) {
    this._planetWaterEmissiveIntensity = clamp(value, 0, 10);
    this.notify({ key: 'planetWaterEmissiveIntensity' });
  }
  public get planetGroundEmissiveIntensity(): number {
    return this._planetGroundEmissiveIntensity;
  }
  public set planetGroundEmissiveIntensity(value: number) {
    const v = clamp(value, 0, 10);
    this._planetGroundEmissiveIntensity = v;
    this._biomesParams.forEach((b) => (b.parentEmissiveIntensity = v));
    this.notify({ key: 'planetGroundEmissiveIntensity' });
  }

  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceShowBumps: boolean;
  private _planetSurfaceBumpStrength: number;
  private _planetSurfaceShowWarping: boolean;
  private _planetSurfaceShowDisplacement: boolean;
  private _planetSurfaceDisplacement: DisplacementParameters;
  private _planetSurfaceNoise: NoiseParameters;
  private _planetSurfaceColorRamp: ColorRamp;

  // --------------------------------------------------

  public get planetSurfaceShowBumps(): boolean {
    return this._planetSurfaceShowBumps;
  }
  public set planetSurfaceShowBumps(value: boolean) {
    this._planetSurfaceShowBumps = value;
    this.notify({ key: 'planetSurfaceShowBumps' });
  }
  public get planetSurfaceBumpStrength(): number {
    return this._planetSurfaceBumpStrength;
  }
  public set planetSurfaceBumpStrength(value: number) {
    this._planetSurfaceBumpStrength = value;
    this.notify({ key: 'planetSurfaceBumpStrength' });
  }

  public get planetSurfaceShowWarping(): boolean {
    return this._planetSurfaceShowWarping;
  }
  public set planetSurfaceShowWarping(value: boolean) {
    this._planetSurfaceShowWarping = value;
    this.notify({ key: 'planetSurfaceShowWarping' });
  }
  public get planetSurfaceShowDisplacement(): boolean {
    return this._planetSurfaceShowDisplacement;
  }
  public set planetSurfaceShowDisplacement(value: boolean) {
    this._planetSurfaceShowDisplacement = value;
    this.notify({ key: 'planetSurfaceShowDisplacement' });
  }

  public get planetSurfaceDisplacement(): DisplacementParameters {
    return this._planetSurfaceDisplacement;
  }

  public get planetSurfaceNoise(): NoiseParameters {
    return this._planetSurfaceNoise;
  }

  public get planetSurfaceColorRamp(): ColorRamp {
    return this._planetSurfaceColorRamp;
  }
  public get planetSurfaceColorRampSize() {
    return this._planetSurfaceColorRamp.steps.length;
  }

  // --------------------------------------------------
  // |                 Biome settings                 |
  // --------------------------------------------------

  private _biomesEnabled: boolean;
  private _biomesTemperatureMode: GradientMode;
  private _biomesTemperatureNoise: NoiseParameters;
  private _biomesHumidityMode: GradientMode;
  private _biomesHumidityNoise: NoiseParameters;
  private _biomesParams: BiomeParameters[];

  // --------------------------------------------------

  public get biomesEnabled(): boolean {
    return this._biomesEnabled;
  }
  public set biomesEnabled(value: boolean) {
    this._biomesEnabled = value;
    this.notify({ key: 'biomesEnabled' });
  }

  public get biomesTemperatureMode(): GradientMode {
    return this._biomesTemperatureMode;
  }
  public set biomesTemperatureMode(value: GradientMode) {
    this._biomesTemperatureMode = value;
    this.notify({ key: 'biomesTemperatureMode' });
  }
  public get biomesTemperatureNoise(): NoiseParameters {
    return this._biomesTemperatureNoise;
  }

  public get biomesHumidityMode(): GradientMode {
    return this._biomesHumidityMode;
  }
  public set biomesHumidityMode(value: GradientMode) {
    this._biomesHumidityMode = value;
    this.notify({ key: 'biomesHumidityMode' });
  }
  public get biomesHumidityNoise(): NoiseParameters {
    return this._biomesHumidityNoise;
  }

  public get biomesParams(): BiomeParameters[] {
    return this._biomesParams;
  }

  // --------------------------------------------------
  // |                Cracks settings                 |
  // --------------------------------------------------

  private _cracksEnabled: boolean;
  private _cracksNoise: NoiseParameters;
  private _cracksColorRamp: ColorRamp;
  private _cracksEmissiveIntensity: number = 3;

  // --------------------------------------------------

  public get cracksEnabled(): boolean {
    return this._cracksEnabled;
  }
  public set cracksEnabled(value: boolean) {
    this._cracksEnabled = value;
    this.notify({ key: 'cracksEnabled' });
  }

  public get cracksNoise(): NoiseParameters {
    return this._cracksNoise;
  }

  public get cracksColorRamp(): ColorRamp {
    return this._cracksColorRamp;
  }

  public get cracksEmissiveIntensity(): number {
    return this._cracksEmissiveIntensity;
  }
  public set cracksEmissiveIntensity(value: number) {
    this._cracksEmissiveIntensity = value;
    this.notify({ key: 'cracksEmissiveIntensity' });
  }

  // --------------------------------------------------
  // |                Clouds settings                 |
  // --------------------------------------------------

  private _cloudsEnabled: boolean;
  private _cloudsRotation: number;
  private _cloudsHeight: number;
  private _cloudsShowWarping: boolean;
  private _cloudsShowDisplacement: boolean;
  private _cloudsDisplacement: DisplacementParameters;
  private _cloudsNoise: NoiseParameters;
  private _cloudsColor: Color;
  private _cloudsColorRamp: ColorRamp;

  // --------------------------------------------------

  public get cloudsEnabled(): boolean {
    return this._cloudsEnabled;
  }
  public set cloudsEnabled(value: boolean) {
    this._cloudsEnabled = value;
    this.notify({ key: 'cloudsEnabled' });
  }

  public get cloudsRotation() {
    return this._cloudsRotation;
  }
  public set cloudsRotation(rot: number) {
    this._cloudsRotation = isNumeric(rot) ? clamp(rot, 0, 360) : 0;
    this.notify({ key: 'cloudsRotation' });
  }

  public get cloudsHeight() {
    return this._cloudsHeight;
  }
  public set cloudsHeight(height: number) {
    this._cloudsHeight = clamp(height, 0, 10);
    this.notify({ key: 'cloudsHeight' });
  }

  public get cloudsShowWarping(): boolean {
    return this._cloudsShowWarping;
  }
  public set cloudsShowWarping(value: boolean) {
    this._cloudsShowWarping = value;
    this.notify({ key: 'cloudsShowWarping' });
  }

  public get cloudsShowDisplacement(): boolean {
    return this._cloudsShowDisplacement;
  }
  public set cloudsShowDisplacement(value: boolean) {
    this._cloudsShowDisplacement = value;
    this.notify({ key: 'cloudsShowDisplacement' });
  }
  public get cloudsDisplacement(): DisplacementParameters {
    return this._cloudsDisplacement;
  }

  public get cloudsNoise(): NoiseParameters {
    return this._cloudsNoise;
  }

  public get cloudsColor(): Color {
    return this._cloudsColor;
  }
  public set cloudsColor(value: Color) {
    this._cloudsColor.set(value);
    this.notify({ key: 'cloudsColor' });
  }

  public get cloudsColorRamp(): ColorRamp {
    return this._cloudsColorRamp;
  }
  public get cloudsColorRampSize(): number {
    return this._cloudsColorRamp.steps.length;
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
  private _atmosphereTint: Color;
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
    this.notify({ key: 'atmosphereEnabled' });
  }

  public get atmosphereHeight(): number {
    return this._atmosphereHeight;
  }
  public set atmosphereHeight(value: number) {
    this._atmosphereHeight = clamp(value, 0.0075, 0.025);
    this.notify({ key: 'atmosphereHeight' });
  }
  public get atmosphereDensityScale(): number {
    return this._atmosphereDensityScale;
  }
  public set atmosphereDensityScale(value: number) {
    this._atmosphereDensityScale = clamp(value, 0.25, 20);
    this.notify({ key: 'atmosphereDensityScale' });
  }

  public get atmosphereIntensity(): number {
    return this._atmosphereIntensity;
  }
  public set atmosphereIntensity(value: number) {
    this._atmosphereIntensity = clamp(value, 0, 5);
    this.notify({ key: 'atmosphereIntensity' });
  }
  public get atmosphereColorMode(): number {
    return this._atmosphereColorMode;
  }
  public set atmosphereColorMode(value: number) {
    this._atmosphereColorMode = value;
    this.notify({ key: 'atmosphereColorMode' });
  }
  public get atmosphereHue(): number {
    return this._atmosphereHue;
  }
  public set atmosphereHue(value: number) {
    this._atmosphereHue = clamp(value, 0, 2);
    this.notify({ key: 'atmosphereHue' });
  }
  public get atmosphereTint(): Color {
    return this._atmosphereTint;
  }
  public set atmosphereTint(value: Color) {
    this._atmosphereTint.set(value);
    this.notify({ key: 'atmosphereTint' });
  }

  public get atmosphereMieScatteringConstant(): number {
    return this._atmosphereMieScatteringConstant;
  }
  public set atmosphereMieScatteringConstant(value: number) {
    this._atmosphereMieScatteringConstant = clamp(value, -0.999, 0);
    this.notify({ key: 'atmosphereMieScatteringConstant' });
  }
  public get atmosphereRayleighDensityRatio(): number {
    return this._atmosphereRayleighDensityRatio;
  }
  public set atmosphereRayleighDensityRatio(value: number) {
    this._atmosphereRayleighDensityRatio = clamp(value, 0, 1);
    this.notify({ key: 'atmosphereRayleighDensityRatio' });
  }
  public get atmosphereMieDensityRatio(): number {
    return this._atmosphereMieDensityRatio;
  }
  public set atmosphereMieDensityRatio(value: number) {
    this._atmosphereMieDensityRatio = clamp(value, 0, 1);
    this.notify({ key: 'atmosphereMieDensityRatio' });
  }
  public get atmosphereOpticalDensityRatio(): number {
    return this._atmosphereOpticalDensityRatio;
  }
  public set atmosphereOpticalDensityRatio(value: number) {
    this._atmosphereOpticalDensityRatio = clamp(value, 0, 1);
    this.notify({ key: 'atmosphereOpticalDensityRatio' });
  }

  // --------------------------------------------------
  // |                 Ring settings                  |
  // --------------------------------------------------

  private _ringsEnabled: boolean;
  private _ringsParams: RingParameters[];

  // --------------------------------------------------

  public get ringsEnabled(): boolean {
    return this._ringsEnabled;
  }
  public set ringsEnabled(value: boolean) {
    this._ringsEnabled = value;
    this.notify({ key: 'ringsEnabled' });
  }

  public get ringsParams() {
    return this._ringsParams;
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor(defaultName?: string) {
    super();
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
    this._planetSurfaceBumpStrength = 0.09;
    this._planetSurfaceShowWarping = false;
    this._planetSurfaceShowDisplacement = false;
    this._planetSurfaceDisplacement = new DisplacementParameters(
      'planetSurfaceDisplacement',
      this.notifyRelayCallback,
      2,
      0.2,
      2,
      6,
    );
    this._planetSurfaceNoise = new NoiseParameters('planetSurfaceNoise', this.notifyRelayCallback, 3.75, 0.48, 2.45, 6);
    this._planetSurfaceColorRamp = new ColorRamp('planetSurfaceColorRamp', this.notifyRelayCallback, [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x0b1931, 0.4),
      new ColorRampStep(0x2d4265, 0.495),
      new ColorRampStep(0x766f17, 0.5),
      new ColorRampStep(0x446611, 0.505),
      new ColorRampStep(0x223b05, 0.65),
      new ColorRampStep(0x223b05, 1, true),
    ]);

    // Features
    this._cracksEnabled = false;
    this._cracksNoise = new NoiseParameters('cracksNoise', this.notifyRelayCallback, 2.5, 1.25, 2.4, 6);
    this._cracksColorRamp = new ColorRamp('cracksColorRamp', this.notifyRelayCallback, [
      new ColorRampStep(0x2e221b, 0, true),
      new ColorRampStep(0xad5a11, 0.55),
      new ColorRampStep(0xe6962e, 0.8),
      new ColorRampStep(0xffdc73, 1, true),
    ]);

    this._biomesEnabled = true;
    this._biomesTemperatureMode = GradientMode.REALISTIC;
    this._biomesTemperatureNoise = new NoiseParameters(
      'biomesTemperatureNoise',
      this.notifyRelayCallback,
      2.5,
      1.25,
      2.4,
      6,
    );
    this._biomesHumidityMode = GradientMode.FULLNOISE;
    this._biomesHumidityNoise = new NoiseParameters('biomesHumidityNoise', this.notifyRelayCallback, 3, 0.63, 2.53, 6);
    this._biomesParams = [
      new BiomeParameters(
        'biomesParams[element]',
        this.notifyRelayCallback,
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
        'biomesParams[element]',
        this.notifyRelayCallback,
        {
          temperatureMin: 0.8,
          temperatureMax: 1,
          humidityMin: 0,
          humidityMax: 1,
        },
        new Color(0xbaa345),
        0.25,
      ),
      new BiomeParameters(
        'biomesParams[element]',
        this.notifyRelayCallback,
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

    // Clouds
    this._cloudsEnabled = true;
    this._cloudsRotation = 0;
    this._cloudsHeight = 1.005;
    this._cloudsShowWarping = false;
    this._cloudsShowDisplacement = false;
    this._cloudsDisplacement = new DisplacementParameters('cloudsDisplacement', this.notifyRelayCallback, 2, 0.2, 2, 6);
    this._cloudsNoise = new NoiseParameters('cloudsNoise', this.notifyRelayCallback, 4, 0.6, 1.75, 6);
    this._cloudsColor = new Color(0xffffff);
    this._cloudsColorRamp = new ColorRamp('cloudsColorRamp', this.notifyRelayCallback, [
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
  // |               Load/reset/update                |
  // --------------------------------------------------

  public loadData(data: PrefixedWith<this, '_'>) {
    this.planetName = data._planetName?.replaceAll('_', ' ') ?? this._defaultPlanetName;

    // Lighting
    this.lensFlareEnabled = data._lensFlareEnabled ?? true;
    this.lensFlarePointsIntensity = data._lensFlarePointsIntensity ?? 0.25;
    this.lensFlareGlareIntensity = data._lensFlareGlareIntensity ?? 0.4;
    this.sunLightAngle = data._sunLightAngle ?? -30;
    this.sunLightColor.set(data._sunLightColor ?? 0xfff6e8);
    this.sunLightIntensity = data._sunLightIntensity ?? 10;
    this.ambLightColor.set(data._ambLightColor ?? 0xffffff);
    this.ambLightIntensity = data._ambLightIntensity ?? 0.02;

    // Planet & Rendering
    this.planetType = data._planetType ?? PlanetType.PLANET;
    this.planetClass = data._planetClass ?? PlanetClass.PLANET_TELLURIC;
    this.planetRadius = data._planetRadius ?? 1;
    this.planetAxialTilt = data._planetAxialTilt ?? 15;
    this.planetRotation = data._planetRotation ?? 0;
    this.planetWaterRoughness = data._planetWaterRoughness ?? 0.55;
    this.planetWaterMetalness = data._planetWaterMetalness ?? 0.5;
    this.planetGroundRoughness = data._planetGroundRoughness ?? 0.8;
    this.planetGroundMetalness = data._planetGroundMetalness ?? 0.1;
    this.planetWaterLevel = data._planetWaterLevel ?? 0.5;
    this.planetShowEmissive = data._planetShowEmissive ?? false;
    this.planetWaterEmissiveIntensity = data._planetWaterEmissiveIntensity ?? 2;
    this.planetGroundEmissiveIntensity = data._planetGroundEmissiveIntensity ?? 0;

    // Surface
    this.planetSurfaceShowBumps = data._planetSurfaceShowBumps ?? true;
    this.planetSurfaceBumpStrength = data._planetSurfaceBumpStrength ?? 0.0875;
    this.planetSurfaceShowWarping = data._planetSurfaceShowWarping ?? false;
    this.planetSurfaceShowDisplacement = data._planetSurfaceShowDisplacement ?? false;
    this.planetSurfaceDisplacement.loadData(data._planetSurfaceDisplacement);
    this.planetSurfaceNoise.loadData(data._planetSurfaceNoise);
    this.planetSurfaceColorRamp.loadFromSteps(
      data._planetSurfaceColorRamp
        ? data._planetSurfaceColorRamp._steps
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
    this.biomesEnabled = data._biomesEnabled ?? true;
    this.biomesTemperatureMode = data._biomesTemperatureMode ?? GradientMode.REALISTIC;
    this.biomesTemperatureNoise.loadData(data._biomesTemperatureNoise);
    this.biomesHumidityMode = data._biomesHumidityMode ?? GradientMode.REALISTIC;
    this.biomesHumidityNoise.loadData(data._biomesHumidityNoise);
    this.biomesParams.splice(0);
    this.biomesParams.push(
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(data._biomesParams ?? []).map((params: any) => {
        const b = new BiomeParameters(
          'biomesParams[element]',
          this.notifyRelayCallback,
          {
            temperatureMin: params._tempMin ?? 0,
            temperatureMax: params._tempMax ?? 0.5,
            humidityMin: params._humiMin ?? 0,
            humidityMax: params._humiMax ?? 1,
          },
          new Color(params._color),
          params._smoothness ?? 0.25,
          params._emissiveOverride ?? false,
          params._emissiveIntensity ?? 0,
          params._id,
        );
        b.parentEmissiveIntensity = this._planetGroundEmissiveIntensity
        return b
      }),
    );

    // Clouds
    this.cloudsEnabled = data._cloudsEnabled ?? true;
    this.cloudsRotation = data._cloudsRotation ?? 0;
    this.cloudsShowWarping = data._cloudsShowWarping ?? false;
    this.cloudsShowDisplacement = data._cloudsShowDisplacement ?? false;
    this.cloudsDisplacement.loadData(data._cloudsDisplacement);
    this.cloudsNoise.loadData(data._cloudsNoise);
    this.cloudsColor.set(data._cloudsColor ?? 0xffffff);
    this.cloudsColorRamp.loadFromSteps(
      data._cloudsColorRamp
        ? data._cloudsColorRamp._steps
        : [
            new ColorRampStep(0x000000, 0, true),
            new ColorRampStep(0x000000, 0.6),
            new ColorRampStep(0xffffff, 1, true),
          ],
    );

    // Atmosphere
    this.atmosphereEnabled = data._atmosphereEnabled ?? true;
    this.atmosphereHeight = data._atmosphereHeight ?? 0.01;
    this.atmosphereDensityScale = data._atmosphereDensityScale ?? 7.5;
    this.atmosphereIntensity = data._atmosphereIntensity ?? 1.35;
    this.atmosphereColorMode = data._atmosphereColorMode ?? ColorMode.REALISTIC;
    this.atmosphereHue = data._atmosphereHue ?? 0;
    this.atmosphereTint.set(data._atmosphereTint ?? 0xffffff);
    this.atmosphereMieScatteringConstant = data._atmosphereMieScatteringConstant ?? -0.78;
    this.atmosphereRayleighDensityRatio = data._atmosphereRayleighDensityRatio ?? 0.05;
    this.atmosphereMieDensityRatio = data._atmosphereMieDensityRatio ?? 0.02;
    this.atmosphereOpticalDensityRatio = data._atmosphereOpticalDensityRatio ?? 0.25;

    // Ring
    this.ringsEnabled = data._ringsEnabled ?? false;
    this.ringsParams.splice(0);
    this.ringsParams.push(
      // prettier-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(data._ringsParams ?? []).map((params: any) =>
          new RingParameters(
            'ringsParams[element]',
            this.notifyRelayCallback,
            params._innerRadius ?? 1.25,
            params._outerRadius ?? 1.5,
            params._colorRamp?._steps,
            params._id,
          ),
      ),
    );

    // Compatibility & conversion calls
    convertLegacyRingStorage(this, data);
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    // Lighting
    this._lensFlareEnabled = randomBoolean();
    this._lensFlarePointsIntensity = clampedPRNG(0, 1);
    this._lensFlareGlareIntensity = clampedPRNG(0, 1);
    this._sunLightAngle = clampedPRNG(-90, 90);
    this._sunLightColor.set(clampedPRNG(0.5, 1) * 0xffffff);
    this._sunLightIntensity = clampedPRNG(10, 35);
    this._ambLightColor.set(clampedPRNG(0.5, 1) * 0xffffff);
    this._ambLightIntensity = clampedPRNG(0, 0.25);

    // Planet & Rendering
    this._planetType = Math.round(clampedPRNG(0, 2)) as PlanetType;
    const availablePlanetClasses = this.getPlanetClassesFromType(this._planetType);
    this._planetClass = availablePlanetClasses[Math.round(clampedPRNG(0, availablePlanetClasses.length - 1))];
    this._planetRadius = clampedPRNG(0.5, 1);
    this._planetAxialTilt = clampedPRNG(-180, 180);
    this._planetRotation = clampedPRNG(0, 360);
    this._planetWaterRoughness = clampedPRNG(0, 1);
    this._planetWaterMetalness = clampedPRNG(0, 1);
    this._planetWaterEmissiveIntensity = clampedPRNG(0, 10);
    this._planetGroundRoughness = clampedPRNG(0, 1);
    this._planetGroundMetalness = clampedPRNG(0, 1);
    this._planetGroundEmissiveIntensity = clampedPRNG(0, 10);
    this._planetWaterLevel = clampedPRNG(0, 1);
    this._planetShowEmissive = randomBoolean();

    // Surface
    this._planetSurfaceShowBumps = randomBoolean();
    this._planetSurfaceBumpStrength = clampedPRNG(0, 0.2);
    this._planetSurfaceShowWarping = randomBoolean();
    this._planetSurfaceShowDisplacement = randomBoolean();
    this._planetSurfaceDisplacement.randomize();
    this._planetSurfaceNoise.randomize();
    this._planetSurfaceColorRamp.randomize(8);

    // Biomes
    this._biomesEnabled = randomBoolean();
    this._biomesTemperatureMode = Math.round(clampedPRNG(0, 2)) as GradientMode;
    this._biomesTemperatureNoise.randomize();
    this._biomesHumidityMode = Math.round(clampedPRNG(0, 2)) as GradientMode;
    this._biomesHumidityNoise.randomize();
    this._biomesParams.splice(0);
    for (let i = 0; i < Math.round(clampedPRNG(0, 8)); i++) {
      const b = BiomeParameters.createRandom('biomesParams[element]', this.notifyRelayCallback);
      b.parentEmissiveIntensity = this._planetGroundEmissiveIntensity;
      this._biomesParams.push(b);
    }

    // Clouds
    this._cloudsEnabled = randomBoolean();
    this._cloudsRotation = clampedPRNG(0, 360);
    this._cloudsShowWarping = randomBoolean();
    this._cloudsShowDisplacement = randomBoolean();
    this._cloudsDisplacement.randomize();
    this._cloudsNoise.randomize();
    this._cloudsColor.set(clampedPRNG(0, 1) * 0xffffff);
    this._cloudsColorRamp.loadFromSteps([
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(randomColor(true), clampedPRNG(0.05, 0.95)),
      new ColorRampStep(randomColor(true), 1, true),
    ]);

    // Atmosphere
    this._atmosphereEnabled = randomBoolean();
    this._atmosphereHeight = clampedPRNG(0.0075, 0.025);
    this._atmosphereDensityScale = clampedPRNG(0.25, 10);
    this._atmosphereIntensity = clampedPRNG(0.25, 2.5);
    this._atmosphereColorMode = Math.round(clampedPRNG(0, 2)) as ColorMode;
    this._atmosphereHue = clampedPRNG(0, 2);
    this._atmosphereTint.set(clampedPRNG(0, 1) * 0xffffff);
    this._atmosphereMieScatteringConstant = clampedPRNG(-0.999, -0.5);
    this._atmosphereRayleighDensityRatio = clampedPRNG(0.05, 0.95);
    this._atmosphereMieDensityRatio = clampedPRNG(0.05, 0.95);
    this._atmosphereOpticalDensityRatio = clampedPRNG(0.05, 0.95);

    // Ring
    this._ringsEnabled = randomBoolean();
    this._ringsParams.splice(0);
    const ringIntervals = randomIntervals(1.25, 4.75, 2 * Math.round(clampedPRNG(2, 16) / 2));
    for (const interval of ringIntervals) {
      const newRing = RingParameters.createRandom('ringsParams[element]', this.notifyRelayCallback);
      newRing.innerRadius = interval[0];
      newRing.outerRadius = interval[1];
      this._ringsParams.push(newRing);
    }
    this.notify({ type: 'global' });
  }

  public reset() {
    const observers = this.observers;
    Object.assign(this, new PlanetData());
    this.observers = observers;
    this._planetSurfaceDisplacement.reset(2, 0.05, 2, 6, 0.001, 2, 0.05);
    this._planetSurfaceNoise.reset(3.75, 0.48, 2.45, 6, 1, 1);
    this._biomesTemperatureNoise.reset(2.5, 1.25, 2.4, 6);
    this._biomesHumidityNoise.reset(35, 0.63, 2.53, 6);
    this._cloudsDisplacement.reset(2, 0.05, 2, 6, 0.001, 2, 0.05);
    this._cloudsNoise.reset(4, 0.6, 1.75, 6, 1, 1);
    this.notify({ type: 'global' });
  }

  // --------------------------------------------------
  // |            Data handling functions             |
  // --------------------------------------------------

  public addBiome(): BiomeParameters {
    const newBiome = new BiomeParameters(
      'biomesParams[element]',
      this.notifyRelayCallback,
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
    this.notify({ key: 'biomesParams[element]', action: ObservableEventAction.ADD, data: { biome: newBiome } });
    return newBiome;
  }

  public moveBiome(id: string, increment: -1 | 1) {
    const biome = this.findBiomeById(id);
    const biomeIdx = this.findBiomeIndexById(id);
    if (!biome || biomeIdx < 0) {
      throw new Error(`Cannot move non-existent biome of ID: ${id}`);
    }
    this._biomesParams.splice(biomeIdx, 1);
    this._biomesParams.splice(biomeIdx + increment, 0, biome);
    this.notify({
      key: 'biomesParams[element]',
      action: increment === -1 ? ObservableEventAction.SORT_UP : ObservableEventAction.SORT_DOWN,
      data: { biome },
    });
  }

  public removeBiome(id: string) {
    const biome = this.findBiomeById(id);
    const biomeIdx = this.findBiomeIndexById(id);
    if (biomeIdx < 0) {
      throw new Error(`Cannot delete non-existent biome of ID: ${id}`);
    }
    this._biomesParams.splice(biomeIdx, 1);
    this.notify({ key: 'biomesParams[element]', action: ObservableEventAction.DELETE, data: { biome, biomeIdx } });
  }

  public addRing(): RingParameters {
    const newRing = new RingParameters('ringsParams[element]', this.notifyRelayCallback, 1.5, 1.75);
    this._ringsParams.push(newRing);
    this.notify({ key: 'ringsParams[element]', action: ObservableEventAction.ADD, data: { ring: newRing } });
    return newRing;
  }

  public removeRing(id: string): string {
    const ring = this.findRingById(id);
    const ringParamsIdx = this.findRingIndexById(id);
    if (!ring || ringParamsIdx < 0) {
      throw new Error(`Cannot delete non-existent ring of ID: ${id}`);
    }
    this._ringsParams.splice(ringParamsIdx, 1);
    this.notify({ key: 'ringsParams[element]', action: ObservableEventAction.DELETE, data: { ring } });
    return id;
  }

  // --------------------------------------------------
  // |               Utility functions                |
  // --------------------------------------------------

  public findBiomeById(id: string) {
    return this._biomesParams.find((b) => b.id === id);
  }
  public findBiomeIndexById(id: string) {
    return this._biomesParams.findIndex((b) => b.id === id);
  }

  public findRingById(id: string) {
    return this._ringsParams.find((b) => b.id === id);
  }
  public findRingIndexById(id: string) {
    return this._ringsParams.findIndex((b) => b.id === id);
  }

  public findOutermostRingRadius() {
    return Math.max(...this._ringsParams.map((r) => r.outerRadius));
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
    planetData.loadData(data);
    return planetData;
  }
}
