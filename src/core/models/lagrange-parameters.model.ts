import { ColorRamp, ColorRampStep } from './color-ramp.model'
import { GeometryType, NoiseType } from '@core/types'
import { clamp, epsilonClamp, isNumeric } from '@/utils/math-utils'
import { Color } from 'three'
import { NoiseParameters } from './noise-parameters.model'
import { ChangeTracker } from './change-tracker.model'
import { numberToHex } from '@/utils/utils'
import { generateUUID } from 'three/src/math/MathUtils.js'

export default class LagrangeParameters extends ChangeTracker {

  // --------------------------------------------------
  // |                      Init                      |
  // --------------------------------------------------

  private _id: string
  private _planetName: string

  private _initCamDistance: number = 4
  private _initCamAngle: number = -45
  private _initPlanetRadius: number = 1

  // --------------------------------------------------

  public get id() {
    return this._id
  }

  public get planetName(): string {
    return this._planetName
  }
  public set planetName(value: string) {
    this._planetName = value ?? 'New Planet'
  }

  public get initCamDistance() {
    return this._initCamDistance
  }
  public get initCamAngle() {
    return this._initCamAngle
  }
  public get initPlanetRadius() {
    return this._initPlanetRadius
  }

  
  // --------------------------------------------------
  // |               Lighting settings                |
  // --------------------------------------------------

  private _sunLightColor: Color
  private _sunLightIntensity: number
  private _ambLightColor: Color
  private _ambLightIntensity: number

  public get sunLightColor(): Color {
    return this._sunLightColor
  }
  public set sunLightColor(value: Color) {
    this._sunLightColor = value
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
    this._ambLightColor = value
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
  private _planetAxialTilt: number
  private _planetRotation: number
  
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

  public get planetAxialTilt() {
    return this._planetAxialTilt
  }
  public set planetAxialTilt(tilt: number) {
    this._planetAxialTilt = isNumeric(tilt) ? epsilonClamp(tilt, -360, 360) : 0
    this.markForChange('_planetAxialTilt')
  }

  public get planetRotation() {
    return this._planetRotation
  }
  public set planetRotation(rot: number) {
    this._planetRotation = isNumeric(rot) ? epsilonClamp(rot, -360, 360) : 0
    this.markForChange('_planetRotation')
  }


  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceShowBumps: boolean
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
  // |                Clouds settings                 |
  // --------------------------------------------------

  private _cloudsEnabled: boolean
  private _cloudsAxialTilt: number
  private _cloudsRotation: number
  private _cloudsHeight: number
  private _cloudsNoise: NoiseParameters
  private _cloudsColor: Color = new Color(0xffffff)
  private _cloudsColorRamp: ColorRamp

  // --------------------------------------------------

  public get cloudsEnabled(): boolean {
    return this._cloudsEnabled
  }
  public set cloudsEnabled(value: boolean) {
    this._cloudsEnabled = value
    this.markForChange('_cloudsEnabled')
  }

  public get cloudsAxialTilt() {
    return this._cloudsAxialTilt
  }
  public set cloudsAxialTilt(tilt: number) {
    this._cloudsAxialTilt = isNumeric(tilt) ? epsilonClamp(tilt, -360, 360) : 0
    this.markForChange('_cloudsAxialTilt')
  }

  public get cloudsRotation() {
    return this._cloudsRotation
  }
  public set cloudsRotation(rot: number) {
    this._cloudsRotation = isNumeric(rot) ? epsilonClamp(rot, -360, 360) : 0
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
    this._cloudsColor = value
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
  private _atmosphereDaylightHue: number

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
    this._atmosphereHeight = value
    this.markForChange('_atmosphereHeight')
  }

  public get atmosphereDaylightHue(): number {
    return this._atmosphereDaylightHue
  }
  public set atmosphereDaylightHue(value: number) {
    this._atmosphereDaylightHue = value
    this.markForChange('_atmosphereDaylightHue')
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
  public markAllForChange(props: string[]) {
    this._changedProps.push(...props)
  }
  public clearChangedProps() {
    this._changedProps.splice(0)
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor() {
    super()
    this._id = generateUUID()
    this._planetName = 'New Planet'
    this._sunLightColor = new Color(0xfff6e8)
    this._sunLightIntensity = 6
    this._ambLightColor = new Color(0xffffff)
    this._ambLightIntensity = 0.05

    this._planetGeometryType = GeometryType.SPHERE
    this._planetMeshQuality = 48
    this._planetAxialTilt = 0
    this._planetRotation = 0

    this._planetSurfaceShowBumps = true
    this._planetSurfaceNoise = new NoiseParameters(
      this._changedProps, '_planetSurfaceNoise', NoiseType.FBM
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

    this._cloudsEnabled = true
    this._cloudsAxialTilt = 0
    this._cloudsRotation = 0
    this._cloudsHeight = 1
    this._cloudsNoise = new NoiseParameters(
      this._changedProps, '_cloudsNoise', NoiseType.FBM, 4.0, 0.6, 1.75
    )
    this._cloudsColor = new Color(0xffffff)
    this._cloudsColorRamp = new ColorRamp(this._changedProps, '_cloudsColorRamp', [
      new ColorRampStep(0x000000, 0, true),
      new ColorRampStep(0x000000, 0.6),
      new ColorRampStep(0xbbbbbb, 1, true),
    ])

    this._atmosphereEnabled = true
    this._atmosphereHeight = 3
    this._atmosphereDaylightHue = 0.0
  }

  public loadData(data: any) {
    if (!data._id) {
      this._id = generateUUID()
    }
    this._planetName = data._planetName.replaceAll('_', ' ')

    this._sunLightColor.set(numberToHex(data._sunLightColor))
    this._sunLightIntensity = data._sunLightIntensity
    this._ambLightColor.set(numberToHex(data._ambLightColor))
    this._ambLightIntensity = data._ambLightIntensity

    this._planetAxialTilt = data._planetAxialTilt
    this._planetRotation = data._planetRotation

    this._planetSurfaceShowBumps = data._planetSurfaceShowBumps
    this._planetSurfaceNoise.amplitude = data._planetSurfaceNoise._amplitude
    this._planetSurfaceNoise.frequency = data._planetSurfaceNoise._frequency
    this._planetSurfaceNoise.lacunarity = data._planetSurfaceNoise._lacunarity
    this._planetSurfaceColorRamp.load(data._planetSurfaceColorRamp)

    this._cloudsEnabled = true
    this._cloudsAxialTilt = data._cloudsAxialTilt
    this._cloudsRotation = data._cloudsRotation
    this._cloudsNoise.amplitude = data._cloudsNoise._amplitude
    this._cloudsNoise.frequency = data._cloudsNoise._frequency
    this._cloudsNoise.lacunarity = data._cloudsNoise._lacunarity
    this._cloudsColor.set(numberToHex(data._cloudsColor))
    this._cloudsColorRamp.load(data._cloudsColorRamp)

    this._atmosphereEnabled = data._atmosphereEnabled
  }
}