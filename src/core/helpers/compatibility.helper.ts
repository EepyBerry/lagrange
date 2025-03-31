import type { ColorRamp } from '../models/color-ramp.model'
import type PlanetData from '../models/planet-data.model'
import { RingParameters } from '../models/ring-parameters.model'

type LegacyRingPlanetData = PlanetData & {
  _id: string
  _ringEnabled: boolean
  _ringInnerRadius: number
  _ringOuterRadius: number
  _ringColorRamp: ColorRamp
}

/**
 * Converts legacy singular ring storage to multi-ring format
 * @since v0.4.3
 * @param self target PlanetData object
 * @param legacyData legacy data object
 */
export function convertLegacyRingStorage(self: PlanetData, legacyData: LegacyRingPlanetData): void {
  if (legacyData._ringInnerRadius) {
    self.ringsEnabled = legacyData._ringEnabled ?? false
    const convertedParams = new RingParameters(
      self.changedProps,
      '_ringsParameters',
      legacyData._ringInnerRadius ?? 1.25,
      legacyData._ringOuterRadius ?? 1.5,
      legacyData._ringColorRamp?._steps,
    )
    convertedParams.id = legacyData._id ? legacyData._id : convertedParams.id
    self.ringsParams.push(convertedParams)
  }
}
