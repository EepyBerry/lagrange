import { ColorRampStep } from './color-ramp.model'
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

  // -------------------------------------------------

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
  
  // -------------------------------------------------

  public get planetGeometryType() {
    return this._planetGeometryType
  }
  public set planetGeometryType(gtype: GeometryType) {
    this._planetGeometryType = gtype
  }
  public get planetMeshQuality() {
    return this._planetMeshQuality
  }
  public set planetMeshQuality(x: number) {
    this._planetMeshQuality = isNumeric(x) ? clamp(x, 0, 16) : 16
  }

  public get planetAxialTilt() {
    return this._planetAxialTilt
  }
  public set planetAxialTilt(x: number) {
    this._planetAxialTilt = isNumeric(x) ? epsilonClamp(x, -360, 360) : 0
  }

  public get planetRotation() {
    return this._planetRotation
  }
  public set planetRotation(x: number) {
    this._planetRotation = isNumeric(x) ? epsilonClamp(x, -360, 360) : 0
  }

  // --------------------------------------------------
  // |                Surface settings                |
  // --------------------------------------------------

  private _planetSurfaceColorRamp: ColorRampStep[] = []
  private _planetSurfaceColorRampSize: number = 0

  // -------------------------------------------------

  public get planetSurfaceColorRamp() {
    return this._planetSurfaceColorRamp
  }
  public set planetSurfaceColorRamp(steps: ColorRampStep[]) {
    this._planetSurfaceColorRamp = Array(16)
      .fill(ColorRampStep.EMPTY)
      .map((step, i) => i < steps.length ? ({color: steps[i].color, factor: steps[i].factor}) : step)
    this._planetSurfaceColorRampSize = steps.length
  }
  
  public get planetSurfaceColorRampSize() {
    return this._planetSurfaceColorRampSize
  }

  // --------------------------------------------------
  // |                  Constructor                   |
  // --------------------------------------------------

  constructor() {
    this.planetSurfaceColorRamp = [
      { color: new Color(0x101b38), factor: 0 },
      { color: new Color(0x182852), factor: 0.4 },
      { color: new Color(0x2a3b80), factor: 0.495 },
      { color: new Color(0x757515), factor: 0.5 },
      { color: new Color(0x446611), factor: 0.505 },
      { color: new Color(0x223b05), factor: 0.65 },
      { color: new Color(0x223b05), factor: 1 },
    ]
  }
}
