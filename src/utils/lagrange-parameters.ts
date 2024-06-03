import ColorRampStep from './color-ramp-step'

export default class LagrangeParameters {
  initCamDistance: number = 4
  initCamAngle: number = -45

  planetMeshQuality: number = 12
  planetRadius: number = 1
  planetAxialTilt: number = 0
  planetRotation: number = 0

  planetSurfaceColorRamp: ColorRampStep[] = Array(16).fill(ColorRampStep.EMPTY)
}