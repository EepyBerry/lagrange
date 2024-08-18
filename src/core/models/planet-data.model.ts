import { ColorRamp, ColorRampStep } from './color-ramp.model'
import { ColorMode, GeometryType, NoiseType } from '@core/types'
import { clamp, isNumeric } from '@/utils/math-utils'
import { Color } from 'three'
import { NoiseParameters } from './noise-parameters.model'
import { ChangeTracker } from './change-tracker.model'
import { BiomeParameters } from './biome-parameters.model'

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

  private _planetGeometryType: GeometryType = GeometryType.SPHERE
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

  public get planetGeometryType() {
    return this._planetGeometryType
  }
  public set planetGeometryType(gtype: GeometryType) {
    this._planetGeometryType = gtype
    this.markForChange('_planetGeometryType')
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
    this._planetAxialTilt = isNumeric(tilt) ? clamp(tilt, 0, 180) : 0
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

  public get planetSurfaceNoise() {
    return this._planetSurfaceNoise
  }

  public get planetSurfaceColorRamp(): ColorRamp {
    return this._planetSurfaceColorRamp
  }
  public set planetSurfaceColorRamp(ramp: ColorRamp) {
    this._planetSurfaceColorRamp.steps = ramp.steps
    this.markForChange('_planetSurfaceColorRamp')
  }
  public get planetSurfaceColorRampSize() {
    return this._planetSurfaceColorRamp.definedSteps.length
  }

  // --------------------------------------------------
  // |                 Biome settings                 |
  // --------------------------------------------------

  private _biomesEnabled: boolean
  private _biomesTemperatureResolution: number
  private _biomesTemperatureNoise: NoiseParameters
  private _biomesParams: BiomeParameters[]

  // --------------------------------------------------

  public get biomesEnabled(): boolean {
    return this._biomesEnabled
  }
  public set biomesEnabled(value: boolean) {
    this._biomesEnabled = value
    this.markForChange('_biomesEnabled')
  }
  public get biomesTemperatureResolution(): number {
    return this._biomesTemperatureResolution
  }
  public set biomesTemperatureResolution(value: number) {
    this._biomesTemperatureResolution = value
    this.markForChange('_biomesTemperatureResolution')
  }
  
  public get biomesTemperatureNoise(): NoiseParameters {
    return this._biomesTemperatureNoise
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
    return this._cloudsColorRamp.definedSteps.length
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
    this._atmosphereHeight = clamp(value, 1.0, 8.0)
    this.markForChange('_atmosphereHeight')
  }
  public get atmosphereDensityScale(): number {
    return this._atmosphereDensityScale
  }
  public set atmosphereDensityScale(value: number) {
    this._atmosphereDensityScale = clamp(value, 1.0, 10.0)
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
  // |                  Utils & misc                  |
  // --------------------------------------------------

  public get changedProps() {
    return this._changedProps
  }
  public markForChange(prop: string) {
    this._changedProps.push(prop)
  }
  public markAllForChange() {
    this._changedProps.push(...Object.keys(this))
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

    this._lensFlareEnabled = true
    this._lensFlarePointsIntensity = 0.25
    this._lensFlareGlareIntensity = 0.4
    this._sunLightAngle = -15.0
    this._sunLightColor = new Color(0xfff6e8)
    this._sunLightIntensity = 10.0
    this._ambLightColor = new Color(0xffffff)
    this._ambLightIntensity = 0.02

    this._planetGeometryType = GeometryType.SPHERE
    this._planetMeshQuality = 48.0
    this._planetRadius = 1.0
    this._planetAxialTilt = 15.0
    this._planetRotation = 0.0
    this._planetWaterRoughness = 0.55
    this._planetWaterMetalness = 0.5
    this._planetGroundRoughness = 0.8
    this._planetGroundMetalness = 0.1
    this._planetWaterLevel = 0.5

    this._planetSurfaceShowBumps = true
    this._planetSurfaceBumpStrength = 0.0875
    this._planetSurfaceNoise = new NoiseParameters(
      this._changedProps,
      '_planetSurfaceNoise',
      NoiseType.FBM,
      3.41,
      0.5,
      2.16,
      6
    )
    this._planetSurfaceColorRamp = new ColorRamp(this._changedProps, '_planetSurfaceColorRamp', [
      new ColorRampStep(0x061c3f, 0, true),
      new ColorRampStep(0x0f2851, 0.4),
      new ColorRampStep(0x1f4178, 0.495),
      new ColorRampStep(0x2f2e10, 0.5),
      new ColorRampStep(0x446611, 0.505),
      new ColorRampStep(0x223b05, 0.65),
      new ColorRampStep(0x223b05, 1, true),
    ])

    this._biomesEnabled = true
    this._biomesTemperatureResolution = 256
    this._biomesTemperatureNoise = new NoiseParameters(
      this._changedProps,
      '_biomesTemperatureNoise',
      NoiseType.FBM,
      2.5,
      1.5,
      2.5,
      2
    )
    this._biomesParams = [
      new BiomeParameters(
        this._changedProps,
        '_biomesParams',
        0.0,
        0.15,
        new ColorRamp(this._changedProps, '_cloudsColorRamp', [
          new ColorRampStep(0x000000, 0.0, true),
          new ColorRampStep(0x000000, 0.6),
          new ColorRampStep(0xbbbbbb, 1.0, true),
        ], 3, true),
        new Color(0xffffff)
      )
    ]

    this._cloudsEnabled = true
    this._cloudsRotation = 0.0
    this._cloudsHeight = 1.0
    this._cloudsNoise = new NoiseParameters(
      this._changedProps,
      '_cloudsNoise', 
      NoiseType.FBM,
      4.0,
      0.6,
      1.75,
      4
    )
    this._cloudsColor = new Color(0xffffff)
    this._cloudsColorRamp = new ColorRamp(this._changedProps, '_cloudsColorRamp', [
      new ColorRampStep(0x000000, 0.0, true),
      new ColorRampStep(0x000000, 0.6),
      new ColorRampStep(0xbbbbbb, 1.0, true),
    ])

    this._atmosphereEnabled = true
    this._atmosphereHeight = 8.0
    this._atmosphereDensityScale = 2.5
    this._atmosphereIntensity = 1.15
    this._atmosphereColorMode = ColorMode.REALISTIC
    this._atmosphereHue = 0.0
    this._atmosphereTint = new Color(0xffffff)
  }

  public reset() {
    this._planetName = this._defaultPlanetName

    this._lensFlareEnabled = true
    this._lensFlarePointsIntensity = 0.25
    this._lensFlareGlareIntensity = 0.4
    this._sunLightAngle = -15.0
    this._sunLightColor.set(0xfff6e8)
    this._sunLightIntensity = 10.0
    this._ambLightColor.set(0xffffff)
    this._ambLightIntensity = 0.02

    this._planetGeometryType = GeometryType.SPHERE
    this._planetMeshQuality = 48.0
    this._planetRadius = 1.0
    this._planetAxialTilt = 15.0
    this._planetRotation = 0.0
    this._planetWaterRoughness = 0.55
    this._planetWaterMetalness = 0.5
    this._planetGroundRoughness = 0.8
    this._planetGroundMetalness = 0.1
    this._planetWaterLevel = 0.5

    this._planetSurfaceShowBumps = true
    this._planetSurfaceBumpStrength = 0.0875
    this._planetSurfaceNoise.frequency = 3.41
    this._planetSurfaceNoise.amplitude = 0.5
    this._planetSurfaceNoise.lacunarity = 2.16
    this._planetSurfaceColorRamp.loadFromSteps([
      new ColorRampStep(0x061c3f, 0, true),
      new ColorRampStep(0x0f2851, 0.4),
      new ColorRampStep(0x1f4178, 0.495),
      new ColorRampStep(0x2f2e10, 0.5),
      new ColorRampStep(0x446611, 0.505),
      new ColorRampStep(0x223b05, 0.65),
      new ColorRampStep(0x223b05, 1, true),
    ])

    this._biomesEnabled = true
    this._biomesTemperatureResolution = 256

    this._cloudsEnabled = true
    this._cloudsRotation = 0.0
    this._cloudsHeight = 1.0
    this._cloudsColor.set(0xffffff)
    this._cloudsNoise.frequency = 4.0
    this._cloudsNoise.amplitude = 0.6
    this._cloudsNoise.lacunarity = 1.75
    this._cloudsColorRamp.loadFromSteps([
      new ColorRampStep(0x000000, 0.0, true),
      new ColorRampStep(0x000000, 0.6),
      new ColorRampStep(0xbbbbbb, 1.0, true),
    ])

    this._atmosphereEnabled = true
    this._atmosphereHeight = 8.0
    this._atmosphereDensityScale = 2.5
    this._atmosphereIntensity = 1.15
    this._atmosphereColorMode = ColorMode.REALISTIC
    this._atmosphereHue = 0
    this._atmosphereTint = new Color(0xffffff)

    this.markAllForChange()
  }

  public loadData(data: any) {
    this._planetName = data._planetName?.replaceAll('_', ' ') ?? this._defaultPlanetName

    this._lensFlareEnabled = data._lensFlareEnabled ?? true
    this._lensFlarePointsIntensity = data._lensFlarePointsIntensity ?? 0.25
    this._lensFlareGlareIntensity = data._lensFlareGlareIntensity ?? 0.4
    this._sunLightAngle = data._sunLightAngle ?? -15.0
    this._sunLightColor.set(data._sunLightColor ?? 0xfff6e8)
    this._sunLightIntensity = data._sunLightIntensity ?? 10.0
    this._ambLightColor.set(data._ambLightColor ?? 0xffffff)
    this._ambLightIntensity = data._ambLightIntensity ?? 0.02

    this._planetRadius = data._planetRadius ?? 1.0
    this._planetAxialTilt = data._planetAxialTilt ?? 15.0
    this._planetRotation = data._planetRotation ?? 0.0
    this._planetWaterRoughness = data._planetWaterRoughness ?? 0.55
    this._planetWaterMetalness = data._planetWaterMetalness ?? 0.5
    this._planetGroundRoughness = data._planetGroundRoughness ?? 0.8
    this._planetGroundMetalness = data._planetGroundMetalness ?? 0.1
    this._planetWaterLevel = data._planetWaterLevel ?? 0.5

    this._planetSurfaceShowBumps = data._planetSurfaceShowBumps ?? true
    this._planetSurfaceBumpStrength = data._planetSurfaceBumpStrength ?? 0.0875
    this._planetSurfaceNoise.amplitude = data._planetSurfaceNoise._amplitude ?? 3.41
    this._planetSurfaceNoise.frequency = data._planetSurfaceNoise._frequency ?? 0.5
    this._planetSurfaceNoise.lacunarity = data._planetSurfaceNoise._lacunarity ?? 2.16
    this._planetSurfaceColorRamp.loadFromSteps(
      data._planetSurfaceColorRamp
        ? data._planetSurfaceColorRamp._steps
        : [
            new ColorRampStep(0x061c3f, 0, true),
            new ColorRampStep(0x0f2851, 0.4),
            new ColorRampStep(0x1f4178, 0.495),
            new ColorRampStep(0x2f2e10, 0.5),
            new ColorRampStep(0x446611, 0.505),
            new ColorRampStep(0x223b05, 0.65),
            new ColorRampStep(0x223b05, 1, true),
          ],
    )

    this._biomesEnabled = data._biomesEnabled ?? true
    this._biomesTemperatureResolution = data._biomesTemperatureResolution ?? 256

    this._cloudsEnabled = data._cloudsEnabled ?? true
    this._cloudsRotation = data._cloudsRotation ?? 0.0
    this._cloudsNoise.amplitude = data._cloudsNoise._amplitude ?? 4.0
    this._cloudsNoise.frequency = data._cloudsNoise._frequency ?? 0.6
    this._cloudsNoise.lacunarity = data._cloudsNoise._lacunarity ?? 1.75
    this._cloudsColor.set(data._cloudsColor ?? 0xffffff)
    this._cloudsColorRamp.loadFromSteps(
      data._cloudsColorRamp
        ? data._cloudsColorRamp._steps
        : [
            new ColorRampStep(0x000000, 0.0, true),
            new ColorRampStep(0x000000, 0.6),
            new ColorRampStep(0xbbbbbb, 1.0, true),
          ],
    )

    this._atmosphereEnabled = data._atmosphereEnabled ?? true
    this._atmosphereHeight = data._atmosphereHeight ?? 8.0
    this._atmosphereDensityScale = data._atmosphereDensityScale ?? 2.5
    this._atmosphereIntensity = data._atmosphereIntensity ?? 1.15
    this._atmosphereColorMode = data._atmosphereColorMode ?? ColorMode.REALISTIC
    this._atmosphereHue = data._atmosphereHue ?? 0.0
    this._atmosphereTint.set(data._atmosphereTint ?? 0xffffff)
    this.markAllForChange()
  }

  public static createFrom(data: any) {
    const planetData = new PlanetData()
    planetData.loadData(data)
    return planetData
  }
}
