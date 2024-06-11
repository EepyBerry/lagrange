import { ColorRamp } from './color-ramp.model'
import { GeometryType, NoiseType } from '@core/types'
import { clamp, epsilonClamp, isNumeric } from '@/utils/math-utils'
import { Color } from 'three'
import { NoiseParameters } from './noise-parameters.model'
import { ChangeTracker } from './change-tracker.model'

export default class LagrangeParameters extends ChangeTracker {

  // --------------------------------------------------
  // |                      Init                      |
  // --------------------------------------------------

  private _initCamDistance: number = 4
  private _initCamAngle: number = -45
  private _initPlanetRadius: number = 1

  // --------------------------------------------------

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
  // |                Planet settings                 |
  // --------------------------------------------------

  private _planetGeometryType: GeometryType = GeometryType.SPHERE
  private _planetMeshQuality: number = 64
  private _planetAxialTilt: number = 0
  private _planetRotation: number = 0
  
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
    this._planetMeshQuality = isNumeric(quality) ? clamp(quality, 0, 16) : 16
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

  private _planetSurfaceNoise: NoiseParameters = new NoiseParameters(
    this._changedProps, '_planetSurfaceNoise', NoiseType.FBM
  )
  private _planetSurfaceColorRamp: ColorRamp = ColorRamp.EMPTY

  // --------------------------------------------------

  public get planetSurfaceNoise() {
    return this._planetSurfaceNoise
  }

  public get planetSurfaceColorRamp() {
    return this._planetSurfaceColorRamp
  }
  public set planetSurfaceColorRamp(ramp: ColorRamp) {
    this._planetSurfaceColorRamp = ramp
    this.markForChange('_planetSurfaceColorRamp')
  }
  public get planetSurfaceColorRampSize() {
    return this._planetSurfaceColorRamp.definedSize
  }

  // --------------------------------------------------
  // |                Clouds settings                 |
  // --------------------------------------------------

  private _cloudsAxialTilt: number = 0
  private _cloudsRotation: number = 0
  private _cloudsHeight: number = 2
  private _cloudsNoise: NoiseParameters = new NoiseParameters(
    this._changedProps, '_cloudsNoise', NoiseType.FBM, 4.0, 0.55, 2.5
  )
  private _cloudsColorRamp: ColorRamp = ColorRamp.EMPTY

  // --------------------------------------------------

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
    this._cloudsHeight = clamp(height, 1, 10)
    this.markForChange('_cloudsHeight')
  }
  
  public get cloudsNoise() {
    return this._cloudsNoise
  }

  public set cloudsColorRamp(ramp: ColorRamp) {
    this._cloudsColorRamp = ramp
    this.markForChange('_cloudsColorRamp')
  }
  public get cloudsColorRamp() {
    return this._cloudsColorRamp
  }
  public get cloudsColorRampSize() {
    return this._cloudsColorRamp.definedSize
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
  public clearChangedProps() {
    this._changedProps.splice(0)
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor() {
    super()
    this.planetSurfaceColorRamp = new ColorRamp([
      { color: new Color(0x101b38), factor: 0 },
      { color: new Color(0x182852), factor: 0.4 },
      { color: new Color(0x2a3b80), factor: 0.495 },
      { color: new Color(0x757515), factor: 0.5 },
      { color: new Color(0x446611), factor: 0.505 },
      { color: new Color(0x223b05), factor: 0.65 },
      { color: new Color(0x223b05), factor: 1 },
    ])
    this.cloudsColorRamp = new ColorRamp([
      { color: new Color(0x000000), factor: 0 },
      { color: new Color(0x000000), factor: 0.5 },
      { color: new Color(0xbbbbbb), factor: 1 },
    ])
  }
}
