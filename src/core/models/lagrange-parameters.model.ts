import { ColorRamp, ColorRampStep } from './color-ramp.model'
import { GeometryType } from '@core/types'
import { clamp, epsilonClamp, isNumeric } from '@/utils/math-utils'
import { Color } from 'three'

export default class LagrangeParameters {

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

  private _planetGeometryType: GeometryType = GeometryType.ICOSPHERE
  private _planetMeshQuality: number = 16
  private _planetAxialTilt: number = 0
  private _planetRotation: number = 0
  
  // --------------------------------------------------

  public get planetGeometryType() {
    return this._planetGeometryType
  }
  public set planetGeometryType(gtype: GeometryType) {
    this._planetGeometryType = gtype
  }
  public get planetMeshQuality() {
    return this._planetMeshQuality
  }
  public set planetMeshQuality(quality: number) {
    this._planetMeshQuality = isNumeric(quality) ? clamp(quality, 0, 16) : 16
  }

  public get planetAxialTilt() {
    return this._planetAxialTilt
  }
  public set planetAxialTilt(tilt: number) {
    this._planetAxialTilt = isNumeric(tilt) ? epsilonClamp(tilt, -360, 360) : 0
  }

  public get planetRotation() {
    return this._planetRotation
  }
  public set planetRotation(rot: number) {
    this._planetRotation = isNumeric(rot) ? epsilonClamp(rot, -360, 360) : 0
  }

  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceColorRamp: ColorRamp = ColorRamp.EMPTY

  // --------------------------------------------------

  public get planetSurfaceColorRamp() {
    return this._planetSurfaceColorRamp
  }
  public set planetSurfaceColorRamp(ramp: ColorRamp) {
    this._planetSurfaceColorRamp = ramp
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
  private _cloudsColorRamp: ColorRamp = ColorRamp.EMPTY

  // --------------------------------------------------

  public get cloudsAxialTilt() {
    return this._cloudsAxialTilt
  }
  public set cloudsAxialTilt(tilt: number) {
    this._cloudsAxialTilt = isNumeric(tilt) ? epsilonClamp(tilt, -360, 360) : 0
  }

  public get cloudsRotation() {
    return this._cloudsRotation
  }
  public set cloudsRotation(rot: number) {
    this._cloudsRotation = isNumeric(rot) ? epsilonClamp(rot, -360, 360) : 0
  }

  public get cloudsHeight() {
    return this._cloudsHeight
  }
  public set cloudsHeight(height: number) {
    this._cloudsHeight = clamp(height, 1, 10)
  }

  public set cloudsColorRamp(ramp: ColorRamp) {
    this._cloudsColorRamp = ramp
  }
  public get cloudsColorRamp() {
    return this._cloudsColorRamp
  }
  public get cloudsColorRampSize() {
    return this._cloudsColorRamp.definedSize
  }
  
  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor() {
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
