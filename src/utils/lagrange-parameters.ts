import ColorRampStep from './color-ramp-step'

export default class LagrangeParameters {
  initCamDistance: number = 4
  initCamAngle: number = -45
  initPlanetSize: number = 12

  planetSurfaceColorRamp: ColorRampStep[] = Array(16).fill(ColorRampStep.EMPTY)
}