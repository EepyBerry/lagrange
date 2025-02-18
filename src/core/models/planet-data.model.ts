import { ColorRamp, ColorRampStep } from './color-ramp.model'
import { ColorMode, GradientMode, PlanetType } from '@core/types'
import { clampedPRNG, isNumeric } from '@/utils/math-utils'
import { Color } from 'three'
import { NoiseParameters } from './noise-parameters.model'
import { ChangeTracker } from './change-tracker.model'
import { BiomeParameters } from './biome-parameters.model'
import { clamp } from 'three/src/math/MathUtils.js'
import { DisplacementParameters } from './displacement-parameters.model'

export default class PlanetData extends ChangeTracker {
  // --------------------------------------------------
  // |                      Init                      |
  // --------------------------------------------------

  private _defaultPlanetName: string
  private _planetName: string

  private _initCamDistance: number = 4
  private _initCamAngle: number = -60

  // --------------------------------------------------

  public get planetName(): string {
    return this._planetName
  }
  public set planetName(value: string) {
    this._planetName = value
    this.markForChange('_planetName')
  }

  public get initCamDistance() {
    return this._initCamDistance
  }
  public get initCamAngle() {
    return this._initCamAngle
  }

  // --------------------------------------------------
  // |               Lighting settings                |
  // --------------------------------------------------

  private _lensFlareEnabled: boolean
  private _lensFlarePointsIntensity: number
  private _lensFlareGlareIntensity: number
  private _sunLightAngle: number
  private _sunLightColor: Color
  private _sunLightIntensity: number
  private _ambLightColor: Color
  private _ambLightIntensity: number

  // --------------------------------------------------

  public get lensFlareEnabled(): boolean {
    return this._lensFlareEnabled
  }
  public set lensFlareEnabled(value: boolean) {
    this._lensFlareEnabled = value
    this.markForChange('_lensFlareEnabled')
  }
  public get lensFlarePointsIntensity(): number {
    return this._lensFlarePointsIntensity
  }
  public set lensFlarePointsIntensity(value: number) {
    this._lensFlarePointsIntensity = clamp(value, 0, 1)
    this.markForChange('_lensFlarePointsIntensity')
  }
  public get lensFlareGlareIntensity(): number {
    return this._lensFlareGlareIntensity
  }
  public set lensFlareGlareIntensity(value: number) {
    this._lensFlareGlareIntensity = clamp(value, 0, 1)
    this.markForChange('_lensFlareGlareIntensity')
  }

  public get sunLightAngle(): number {
    return this._sunLightAngle
  }
  public set sunLightAngle(value: number) {
    this._sunLightAngle = clamp(value, -180, 180)
    this.markForChange('_sunLightAngle')
  }
  public get sunLightColor(): Color {
    return this._sunLightColor
  }
  public set sunLightColor(value: Color) {
    this._sunLightColor.set(value)
    this.markForChange('_sunLightColor')
  }
  public get sunLightIntensity(): number {
    return this._sunLightIntensity
  }
  public set sunLightIntensity(value: number) {
    this._sunLightIntensity = value
    this.markForChange('_sunLightIntensity')
  }

  public get ambLightColor(): Color {
    return this._ambLightColor
  }
  public set ambLightColor(value: Color) {
    this._ambLightColor.set(value)
    this.markForChange('_ambLightColor')
  }
  public get ambLightIntensity(): number {
    return this._ambLightIntensity
  }
  public set ambLightIntensity(value: number) {
    this._ambLightIntensity = value
    this.markForChange('_ambLightIntensity')
  }

  // --------------------------------------------------
  // |                Planet settings                 |
  // --------------------------------------------------

  private _planetType: PlanetType = PlanetType.PLANET
  private _planetMeshQuality: number

  private _planetRadius: number
  private _planetAxialTilt: number
  private _planetRotation: number
  private _planetWaterRoughness: number
  private _planetWaterMetalness: number
  private _planetGroundRoughness: number
  private _planetGroundMetalness: number
  private _planetWaterLevel: number

  // --------------------------------------------------

  public get planetType() {
    return this._planetType
  }
  public set planetType(ptype: PlanetType) {
    this._planetType = ptype
    this.markForChange('_planetType')
  }
  public get planetMeshQuality() {
    return this._planetMeshQuality
  }
  public set planetMeshQuality(quality: number) {
    this._planetMeshQuality = isNumeric(quality) ? clamp(quality, 0, 48) : 48
    this.markForChange('_planetMeshQuality')
  }

  public get planetRadius() {
    return this._planetRadius
  }
  public set planetRadius(radius: number) {
    this._planetRadius = radius
    this.markForChange('_planetRadius')
  }
  public get planetAxialTilt() {
    return this._planetAxialTilt
  }
  public set planetAxialTilt(tilt: number) {
    this._planetAxialTilt = isNumeric(tilt) ? clamp(tilt, -180, 180) : 0
    this.markForChange('_planetAxialTilt')
  }

  public get planetRotation() {
    return this._planetRotation
  }
  public set planetRotation(rot: number) {
    this._planetRotation = isNumeric(rot) ? clamp(rot, 0, 360) : 0
    this.markForChange('_planetRotation')
  }

  public get planetWaterMetalness(): number {
    return this._planetWaterMetalness
  }
  public set planetWaterMetalness(value: number) {
    this._planetWaterMetalness = clamp(value, 0, 1)
    this.markForChange('_planetWaterMetalness')
  }
  public get planetWaterRoughness(): number {
    return this._planetWaterRoughness
  }
  public set planetWaterRoughness(value: number) {
    this._planetWaterRoughness = clamp(value, 0, 1)
    this.markForChange('_planetWaterRoughness')
  }

  public get planetGroundMetalness(): number {
    return this._planetGroundMetalness
  }
  public set planetGroundMetalness(value: number) {
    this._planetGroundMetalness = clamp(value, 0, 1)
    this.markForChange('_planetGroundMetalness')
  }
  public get planetGroundRoughness(): number {
    return this._planetGroundRoughness
  }
  public set planetGroundRoughness(value: number) {
    this._planetGroundRoughness = clamp(value, 0, 1)
    this.markForChange('_planetGroundRoughness')
  }

  public get planetWaterLevel(): number {
    return this._planetWaterLevel
  }
  public set planetWaterLevel(value: number) {
    this._planetWaterLevel = clamp(value, 0, 1)
    this.markForChange('_planetWaterLevel')
  }

  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceShowBumps: boolean
  private _planetSurfaceBumpStrength: number
  private _planetSurfaceShowWarping: boolean
  private _planetSurfaceShowDisplacement: boolean
  private _planetSurfaceDisplacement: DisplacementParameters
  private _planetSurfaceNoise: NoiseParameters
  private _planetSurfaceColorRamp: ColorRamp

  // --------------------------------------------------

  public get planetSurfaceShowBumps(): boolean {
    return this._planetSurfaceShowBumps
  }
  public set planetSurfaceShowBumps(value: boolean) {
    this._planetSurfaceShowBumps = value
    this.markForChange('_planetSurfaceShowBumps')
  }
  public get planetSurfaceBumpStrength(): number {
    return this._planetSurfaceBumpStrength
  }
  public set planetSurfaceBumpStrength(value: number) {
    this._planetSurfaceBumpStrength = value
    this.markForChange('_planetSurfaceBumpStrength')
  }

  public get planetSurfaceShowWarping(): boolean {
    return this._planetSurfaceShowWarping
  }
  public set planetSurfaceShowWarping(value: boolean) {
    this._planetSurfaceShowWarping = value
    this.markForChange('_planetSurfaceShowWarping')
  }
  public get planetSurfaceShowDisplacement(): boolean {
    return this._planetSurfaceShowDisplacement
  }
  public set planetSurfaceShowDisplacement(value: boolean) {
    this._planetSurfaceShowDisplacement = value
    this.markForChange('_planetSurfaceShowDisplacement')
  }

  public get planetSurfaceDisplacement(): DisplacementParameters {
    return this._planetSurfaceDisplacement
  }

  public get planetSurfaceNoise(): NoiseParameters {
    return this._planetSurfaceNoise
  }

  public get planetSurfaceColorRamp(): ColorRamp {
    return this._planetSurfaceColorRamp
  }
  public get planetSurfaceColorRampSize() {
    return this._planetSurfaceColorRamp.steps.length
  }

  // --------------------------------------------------
  // |                 Biome settings                 |
  // --------------------------------------------------

  private _biomesEnabled: boolean
  private _biomesTemperatureMode: GradientMode
  private _biomesTemperatureNoise: NoiseParameters
  private _biomesHumidityMode: GradientMode
  private _biomesHumidityNoise: NoiseParameters
  private _biomesParams: BiomeParameters[]

  // --------------------------------------------------

  public get biomesEnabled(): boolean {
    return this._biomesEnabled
  }
  public set biomesEnabled(value: boolean) {
    this._biomesEnabled = value
    this.markForChange('_biomesEnabled')
  }

  public get biomesTemperatureMode(): GradientMode {
    return this._biomesTemperatureMode
  }
  public set biomesTemperatureMode(value: GradientMode) {
    this._biomesTemperatureMode = value
    this.markForChange('_biomesTemperatureMode')
  }
  public get biomesTemperatureNoise(): NoiseParameters {
    return this._biomesTemperatureNoise
  }

  public get biomesHumidityMode(): GradientMode {
    return this._biomesHumidityMode
  }
  public set biomesHumidityMode(value: GradientMode) {
    this._biomesHumidityMode = value
    this.markForChange('_biomesHumidityMode')
  }
  public get biomesHumidityNoise(): NoiseParameters {
    return this._biomesHumidityNoise
  }

  public get biomesParams(): BiomeParameters[] {
    return this._biomesParams
  }
  public set biomesParams(value: BiomeParameters[]) {
    this._biomesParams.splice(0)
    this._biomesParams.push(...value)
    this.markForChange('_biomesParams')
  }

  // --------------------------------------------------
  // |                Clouds settings                 |
  // --------------------------------------------------

  private _cloudsEnabled: boolean
  private _cloudsRotation: number
  private _cloudsHeight: number
  private _cloudsShowWarping: boolean
  private _cloudsShowDisplacement: boolean
  private _cloudsDisplacement: DisplacementParameters
  private _cloudsNoise: NoiseParameters
  private _cloudsColor: Color
  private _cloudsColorRamp: ColorRamp

  // --------------------------------------------------

  public get cloudsEnabled(): boolean {
    return this._cloudsEnabled
  }
  public set cloudsEnabled(value: boolean) {
    this._cloudsEnabled = value
    this.markForChange('_cloudsEnabled')
  }

  public get cloudsRotation() {
    return this._cloudsRotation
  }
  public set cloudsRotation(rot: number) {
    this._cloudsRotation = isNumeric(rot) ? clamp(rot, 0, 360) : 0
    this.markForChange('_cloudsRotation')
  }

  public get cloudsHeight() {
    return this._cloudsHeight
  }
  public set cloudsHeight(height: number) {
    this._cloudsHeight = clamp(height, 0, 10)
    this.markForChange('_cloudsHeight')
  }

  public get cloudsShowWarping(): boolean {
    return this._cloudsShowWarping
  }
  public set cloudsShowWarping(value: boolean) {
    this._cloudsShowWarping = value
    this.markForChange('_cloudsShowWarping')
  }

  public get cloudsShowDisplacement(): boolean {
    return this._cloudsShowDisplacement
  }
  public set cloudsShowDisplacement(value: boolean) {
    this._cloudsShowDisplacement = value
    this.markForChange('_cloudsShowDisplacement')
  }
  public get cloudsDisplacement(): DisplacementParameters {
    return this._cloudsDisplacement
  }
  public set cloudsDisplacement(value: DisplacementParameters) {
    this._cloudsDisplacement = value
    this.markForChange('_cloudsDisplacement')
  }

  public get cloudsNoise(): NoiseParameters {
    return this._cloudsNoise
  }

  public get cloudsColor(): Color {
    return this._cloudsColor
  }
  public set cloudsColor(value: Color) {
    this._cloudsColor.set(value)
    this.markForChange('_cloudsColor')
  }

  public set cloudsColorRamp(ramp: ColorRamp) {
    Object.assign(this._cloudsColorRamp, ramp)
    this.markForChange('_cloudsColorRamp')
  }
  public get cloudsColorRamp(): ColorRamp {
    return this._cloudsColorRamp
  }
  public get cloudsColorRampSize(): number {
    return this._cloudsColorRamp.steps.length
  }

  // --------------------------------------------------
  // |               Atmosphere settings              |
  // --------------------------------------------------

  private _atmosphereEnabled: boolean
  private _atmosphereHeight: number
  private _atmosphereDensityScale: number
  private _atmosphereIntensity: number
  private _atmosphereColorMode: number
  private _atmosphereHue: number
  private _atmosphereTint: Color

  // --------------------------------------------------

  public get atmosphereEnabled(): boolean {
    return this._atmosphereEnabled
  }
  public set atmosphereEnabled(value: boolean) {
    this._atmosphereEnabled = value
    this.markForChange('_atmosphereEnabled')
  }

  public get atmosphereHeight(): number {
    return this._atmosphereHeight
  }
  public set atmosphereHeight(value: number) {
    this._atmosphereHeight = clamp(value, 0.25, 8.0)
    this.markForChange('_atmosphereHeight')
  }
  public get atmosphereDensityScale(): number {
    return this._atmosphereDensityScale
  }
  public set atmosphereDensityScale(value: number) {
    this._atmosphereDensityScale = clamp(value, 0.25, 10.0)
    this.markForChange('_atmosphereDensityScale')
  }

  public get atmosphereIntensity(): number {
    return this._atmosphereIntensity
  }
  public set atmosphereIntensity(value: number) {
    this._atmosphereIntensity = value
    this.markForChange('_atmosphereIntensity')
  }
  public get atmosphereColorMode(): number {
    return this._atmosphereColorMode
  }
  public set atmosphereColorMode(value: number) {
    this._atmosphereColorMode = value
    this.markForChange('_atmosphereColorMode')
  }
  public get atmosphereHue(): number {
    return this._atmosphereHue
  }
  public set atmosphereHue(value: number) {
    this._atmosphereHue = clamp(value, 0.0, 2.0)
    this.markForChange('_atmosphereHue')
  }
  public get atmosphereTint(): Color {
    return this._atmosphereTint
  }
  public set atmosphereTint(value: Color) {
    this._atmosphereTint.set(value)
    this.markForChange('_atmosphereTint')
  }

  // --------------------------------------------------
  // |                 Ring settings                  |
  // --------------------------------------------------

  private _ringEnabled: boolean
  private _ringAxialTilt: number
  private _ringRotation: number
  private _ringInnerRadius: number
  private _ringOuterRadius: number
  private _ringColorRamp: ColorRamp

  // --------------------------------------------------

  public get ringEnabled(): boolean {
    return this._ringEnabled
  }
  public set ringEnabled(value: boolean) {
    this._ringEnabled = value
    this.markForChange('_ringEnabled')
  }

  public get ringAxialTilt() {
    return this._ringAxialTilt
  }
  public set ringAxialTilt(tilt: number) {
    this._ringAxialTilt = isNumeric(tilt) ? clamp(tilt, -180, 180) : 0
    this.markForChange('_ringAxialTilt')
  }

  public get ringRotation() {
    return this._ringRotation
  }
  public set ringRotation(rot: number) {
    this._ringRotation = isNumeric(rot) ? clamp(rot, 0, 360) : 0
    this.markForChange('_ringRotation')
  }

  public get ringInnerRadius(): number {
    return this._ringInnerRadius
  }
  public set ringInnerRadius(value: number) {
    this._ringInnerRadius = clamp(value, 1.0, 5.0)
    this._ringOuterRadius = clamp(this._ringOuterRadius, this._ringInnerRadius, 10)
    this.markForChange('_ringInnerRadius')
    this.markForChange('_ringOuterRadius')
  }

  public get ringOuterRadius(): number {
    return this._ringOuterRadius
  }
  public set ringOuterRadius(value: number) {
    this._ringOuterRadius = clamp(value, 1.0, 5.0)
    this._ringInnerRadius = clamp(this._ringInnerRadius, 1.0, this._ringOuterRadius)
    this.markForChange('_ringOuterRadius')
    this.markForChange('_ringInnerRadius')
  }

  public get ringColorRamp(): ColorRamp {
    return this._ringColorRamp
  }
  public get ringColorRampSize() {
    return this._ringColorRamp.steps.length
  }

  // --------------------------------------------------
  // |                  Utils & misc                  |
  // --------------------------------------------------

  public get changedProps() {
    return this._changedProps
  }
  public markAllForChange() {
    this._changedProps.push(...Object.keys(this).map((o) => ({ prop: o })))
  }
  public clearChangedProps() {
    this._changedProps.splice(0)
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor(defaultName?: string) {
    super()
    this._defaultPlanetName = defaultName ?? 'New planet'
    this._planetName = this._defaultPlanetName

    // Lighting
    this._lensFlareEnabled = true
    this._lensFlarePointsIntensity = 0.25
    this._lensFlareGlareIntensity = 0.4
    this._sunLightAngle = -15.0
    this._sunLightColor = new Color(0xfff6e8)
    this._sunLightIntensity = 10.0
    this._ambLightColor = new Color(0xffffff)
    this._ambLightIntensity = 0.02

    // Planet & Rendering
    this._planetType = PlanetType.PLANET
    this._planetMeshQuality = 64.0
    this._planetRadius = 1.0
    this._planetAxialTilt = -15.0
    this._planetRotation = 0.0
    this._planetWaterRoughness = 0.55
    this._planetWaterMetalness = 0.1
    this._planetGroundRoughness = 0.8
    this._planetGroundMetalness = 0.1
    this._planetWaterLevel = 0.5

    // Surface
    this._planetSurfaceShowBumps = true
    this._planetSurfaceBumpStrength = 0.12
    this._planetSurfaceShowWarping = false
    this._planetSurfaceShowDisplacement = false
    this._planetSurfaceDisplacement = new DisplacementParameters(
      this._changedProps,
      '_planetSurfaceDisplacement',
      2.0,
      0.2,
      2.0,
      6,
    )
    this._planetSurfaceNoise = new NoiseParameters(this._changedProps, '_planetSurfaceNoise', 3.75, 0.48, 2.45, 6)
    this._planetSurfaceColorRamp = new ColorRamp(this._changedProps, '_planetSurfaceColorRamp', [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x0b1931, 0.4),
      new ColorRampStep(0x2d4265, 0.495),
      new ColorRampStep(0x766f17, 0.5),
      new ColorRampStep(0x446611, 0.505),
      new ColorRampStep(0x223b05, 0.65),
      new ColorRampStep(0x223b05, 1, true),
    ])

    // Biomes
    this._biomesEnabled = true
    this._biomesTemperatureMode = GradientMode.REALISTIC
    this._biomesTemperatureNoise = new NoiseParameters(this._changedProps, '_biomesTemperatureNoise', 2.5, 1.25, 2.4, 6)
    this._biomesHumidityMode = GradientMode.FULLNOISE
    this._biomesHumidityNoise = new NoiseParameters(this._changedProps, '_biomesHumidityNoise', 3.0, 0.63, 2.53, 6)
    this._biomesParams = [
      new BiomeParameters(
        this._changedProps,
        '_biomesParameters',
        {
          temperatureMin: 0.0,
          temperatureMax: 0.1,
          humidityMin: 0.35,
          humidityMax: 1.0,
        },
        new Color(0xffffff),
        0.25,
      ),
      new BiomeParameters(
        this._changedProps,
        '_biomesParameters',
        {
          temperatureMin: 0.8,
          temperatureMax: 1.0,
          humidityMin: 0.0,
          humidityMax: 1.0,
        },
        new Color(0xbaa345),
        0.25,
      ),
      new BiomeParameters(
        this._changedProps,
        '_biomesParameters',
        {
          temperatureMin: 0.0,
          temperatureMax: 1.0,
          humidityMin: 0.0,
          humidityMax: 0.685,
        },
        new Color(0x132e06),
        0.25,
      ),
    ]

    // Clouds
    this._cloudsEnabled = true
    this._cloudsRotation = 0.0
    this._cloudsHeight = 1.0
    this._cloudsShowWarping = false
    this._cloudsShowDisplacement = false
    this._cloudsDisplacement = new DisplacementParameters(
      this._changedProps,
      '_cloudsDisplacement',
      2.0,
      0.2,
      2.0,
      6,
    )
    this._cloudsNoise = new NoiseParameters(this._changedProps, '_cloudsNoise', 4.0, 0.6, 1.75, 4)
    this._cloudsColor = new Color(0xffffff)
    this._cloudsColorRamp = new ColorRamp(this._changedProps, '_cloudsColorRamp', [
      new ColorRampStep(0x000000, 0.0, true),
      new ColorRampStep(0x000000, 0.6),
      new ColorRampStep(0xbbbbbb, 1.0, true),
    ])

    // Atmosphere
    this._atmosphereEnabled = true
    this._atmosphereHeight = 8.0
    this._atmosphereDensityScale = 3.0
    this._atmosphereIntensity = 1.35
    this._atmosphereColorMode = ColorMode.REALISTIC
    this._atmosphereHue = 0.0
    this._atmosphereTint = new Color(0xffffff)

    // Ring
    this._ringEnabled = false
    this._ringAxialTilt = 90.0
    this._ringRotation = 0.0
    this._ringInnerRadius = 1.25
    this._ringOuterRadius = 1.5
    this._ringColorRamp = new ColorRamp(this._changedProps, '_ringColorRamp', [
      new ColorRampStep(0x856f4e, 0.0, true),
      new ColorRampStep(0x000000, 0.5),
      new ColorRampStep(0xbf9a5e, 1.0, true),
    ])
  }

  // --------------------------------------------------
  // |                  Load/reset                    |
  // --------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public loadData(data: any) {
    this.planetName = data._planetName?.replaceAll('_', ' ') ?? this._defaultPlanetName

    // Lighting
    this.lensFlareEnabled = data._lensFlareEnabled ?? true
    this.lensFlarePointsIntensity = data._lensFlarePointsIntensity ?? 0.25
    this.lensFlareGlareIntensity = data._lensFlareGlareIntensity ?? 0.4
    this.sunLightAngle = data._sunLightAngle ?? -15.0
    this.sunLightColor.set(data._sunLightColor ?? 0xfff6e8)
    this.sunLightIntensity = data._sunLightIntensity ?? 10.0
    this.ambLightColor.set(data._ambLightColor ?? 0xffffff)
    this.ambLightIntensity = data._ambLightIntensity ?? 0.02

    // Planet & Rendering
    this.planetType = data._planetType ?? PlanetType.PLANET
    this.planetRadius = data._planetRadius ?? 1.0
    this.planetAxialTilt = data._planetAxialTilt ?? 15.0
    this.planetRotation = data._planetRotation ?? 0.0
    this.planetWaterRoughness = data._planetWaterRoughness ?? 0.55
    this.planetWaterMetalness = data._planetWaterMetalness ?? 0.5
    this.planetGroundRoughness = data._planetGroundRoughness ?? 0.8
    this.planetGroundMetalness = data._planetGroundMetalness ?? 0.1
    this.planetWaterLevel = data._planetWaterLevel ?? 0.5

    // Surface
    this.planetSurfaceShowBumps = data._planetSurfaceShowBumps ?? true
    this.planetSurfaceBumpStrength = data._planetSurfaceBumpStrength ?? 0.0875
    this.planetSurfaceShowWarping = data._planetSurfaceShowWarping ?? false
    this.planetSurfaceShowDisplacement = data._planetSurfaceShowDisplacement ?? false
    this.planetSurfaceDisplacement.loadData(data._planetSurfaceDisplacement)
    this.planetSurfaceNoise.loadData(data._planetSurfaceNoise)
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
    )

    // Biomes
    this.biomesEnabled = data._biomesEnabled ?? true
    this.biomesTemperatureMode = data._biomesTemperatureMode ?? GradientMode.REALISTIC
    this.biomesTemperatureNoise.loadData(data._biomesTemperatureNoise)
    this.biomesHumidityMode = data._biomesHumidityMode ?? GradientMode.REALISTIC
    this.biomesHumidityNoise.loadData(data._biomesHumidityNoise)
    this.biomesParams.splice(0)
    this.biomesParams.push(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(data._biomesParams ?? []).map((rbp: any) => {
        const nbp = new BiomeParameters(
          this.changedProps,
          '_biomesParameters',
          {
            temperatureMin: rbp._tempMin ?? 0.0,
            temperatureMax: rbp._tempMax ?? 0.5,
            humidityMin: rbp._humiMin ?? 0.0,
            humidityMax: rbp._humiMax ?? 1.0,
          },
          new Color(rbp._color),
          rbp._smoothness ?? 0.25,
        )
        nbp.id = rbp._id ? rbp._id : nbp.id
        return nbp
      }),
    )

    // Clouds
    this.cloudsEnabled = data._cloudsEnabled ?? true
    this.cloudsRotation = data._cloudsRotation ?? 0.0
    this.cloudsShowWarping = data._cloudsShowWarping ?? false
    this.cloudsShowDisplacement = data._cloudsShowDisplacement ?? false
    this.cloudsDisplacement.loadData(data._cloudsDisplacement)
    this.cloudsNoise.loadData(data._cloudsNoise)
    this.cloudsColor.set(data._cloudsColor ?? 0xffffff)
    this.cloudsColorRamp.loadFromSteps(
      data._cloudsColorRamp
        ? data._cloudsColorRamp._steps
        : [
            new ColorRampStep(0x000000, 0.0, true),
            new ColorRampStep(0x000000, 0.6),
            new ColorRampStep(0xbbbbbb, 1.0, true),
          ],
    )

    // Atmosphere
    this.atmosphereEnabled = data._atmosphereEnabled ?? true
    this.atmosphereHeight = data._atmosphereHeight ?? 8.0
    this.atmosphereDensityScale = data._atmosphereDensityScale ?? 3.0
    this.atmosphereIntensity = data._atmosphereIntensity ?? 1.35
    this.atmosphereColorMode = data._atmosphereColorMode ?? ColorMode.REALISTIC
    this.atmosphereHue = data._atmosphereHue ?? 0.0
    this.atmosphereTint.set(data._atmosphereTint ?? 0xffffff)

    // Ring
    this.ringEnabled = data._ringEnabled ?? false
    this.ringAxialTilt = data._ringAxialTilt ?? 90.0
    this.ringRotation = data._ringRotation ?? 0.0
    this.ringInnerRadius = data._ringInnerRadius ?? 1.25
    this.ringOuterRadius = data._ringOuterRadius ?? 1.5
    this.ringColorRamp.loadFromSteps(
      data._ringColorRamp
        ? data._ringColorRamp._steps
        : [
            new ColorRampStep(0x856f4e, 0.0, true),
            new ColorRampStep(0x000000, 0.5),
            new ColorRampStep(0xbf9a5e, 1.0, true),
          ],
    )
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    // Lighting
    this.lensFlareEnabled = Boolean(Math.round(clampedPRNG(0, 1)))
    this.lensFlarePointsIntensity = clampedPRNG(0, 1)
    this.lensFlareGlareIntensity = clampedPRNG(0, 1)
    this.sunLightAngle = clampedPRNG(-90, 90)
    this.sunLightColor.set(clampedPRNG(0.5, 1) * 0xffffff)
    this.sunLightIntensity = clampedPRNG(10, 35)
    this.ambLightColor.set(clampedPRNG(0.5, 1) * 0xffffff)
    this.ambLightIntensity = clampedPRNG(0, 1)

    // Planet & Rendering
    this.planetType = Math.round(clampedPRNG(0, 1)) as PlanetType
    this.planetRadius = clampedPRNG(0.5, 1)
    this.planetAxialTilt = clampedPRNG(-180, 180)
    this.planetRotation = clampedPRNG(0, 360)
    this.planetWaterRoughness = clampedPRNG(0, 1)
    this.planetWaterMetalness = clampedPRNG(0, 1)
    this.planetGroundRoughness = clampedPRNG(0, 1)
    this.planetGroundMetalness = clampedPRNG(0, 1)
    this.planetWaterLevel = clampedPRNG(0, 1)

    // Surface
    this.planetSurfaceShowBumps = Boolean(Math.round(clampedPRNG(0, 1)))
    this.planetSurfaceBumpStrength =  clampedPRNG(0, 0.2)
    this.planetSurfaceShowWarping = Boolean(Math.round(clampedPRNG(0, 1)))
    this.planetSurfaceShowDisplacement = Boolean(Math.round(clampedPRNG(0, 1)))
    this.planetSurfaceDisplacement.randomize()
    this.planetSurfaceNoise.randomize()
    this.planetSurfaceColorRamp.randomize(8)

    // Biomes
    this.biomesEnabled = Boolean(Math.round(clampedPRNG(0, 1)))
    this.biomesTemperatureMode = Math.round(clampedPRNG(0, 2)) as GradientMode
    this.biomesTemperatureNoise.randomize()
    this.biomesHumidityMode = Math.round(clampedPRNG(0, 2)) as GradientMode
    this.biomesHumidityNoise.randomize()
    this.biomesParams.splice(0)
    for (let i = 0; i < Math.round(clampedPRNG(0, 8)); i++) {
      this.biomesParams.push(BiomeParameters.createRandom(this.changedProps))
    }
    
    // Clouds
    this.cloudsEnabled = Boolean(Math.round(clampedPRNG(0, 1)))
    this.cloudsRotation = clampedPRNG(0, 360)
    this.cloudsShowWarping = Boolean(Math.round(clampedPRNG(0, 1)))
    this.cloudsShowDisplacement = Boolean(Math.round(clampedPRNG(0, 1)))
    this.cloudsDisplacement.randomize()
    this.cloudsNoise.randomize()
    this.cloudsColor.set(clampedPRNG(0, 1) * 0xffffff)
    this.cloudsColorRamp.loadFromSteps(
      [
        new ColorRampStep(0x000000, 0.0, true),
        new ColorRampStep(clampedPRNG(0, 1) * 0xffffff, clampedPRNG(0, 1)),
        new ColorRampStep(clampedPRNG(0, 1) * 0xffffff, 1.0, true),
      ],
    )

    // Atmosphere
    this.atmosphereEnabled = Boolean(Math.round(clampedPRNG(0, 1)))
    this.atmosphereHeight = clampedPRNG(0.25, 8)
    this.atmosphereDensityScale = clampedPRNG(0.25, 10)
    this.atmosphereIntensity = clampedPRNG(0, 2)
    this.atmosphereColorMode = Math.round(clampedPRNG(0, 2)) as ColorMode
    this.atmosphereHue = clampedPRNG(0, 2)
    this.atmosphereTint.set(clampedPRNG(0, 1) * 0xffffff)

    // Ring
    this.ringEnabled = Boolean(Math.round(clampedPRNG(0, 1)))
    this.ringAxialTilt = 90.0
    this.ringRotation = 0.0
    this.ringInnerRadius = clampedPRNG(1.5, 5)
    this.ringOuterRadius = clampedPRNG(this.ringInnerRadius, 5)
    this.ringColorRamp.randomize(5)
  }

  public reset() {
    Object.assign(this, new PlanetData())
    this._planetSurfaceDisplacement.reset(2.0, 0.05, 2.0, 6, 0.001, 2.0, 0.05)
    this._planetSurfaceNoise.reset(3.75, 0.48, 2.45, 6, 1, 1.0)
    this._biomesTemperatureNoise.reset(2.5, 1.25, 2.4, 6)
    this._biomesHumidityNoise.reset(35, 0.63, 2.53, 6)
    this._cloudsDisplacement.reset(2.0, 0.05, 2.0, 6, 0.001, 2.0, 0.05)
    this._cloudsNoise.reset(4.0, 0.6, 1.75, 4, 1, 1.0)
    this.markAllForChange()
  }

  // --------------------------------------------------
  // |               Static functions                 |
  // --------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static createFrom(data: any) {
    const planetData = new PlanetData()
    planetData.loadData(data)
    return planetData
  }
}
