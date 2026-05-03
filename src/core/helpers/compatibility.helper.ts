import type { ColorRamp } from '@core/models/planet/color-ramp.model.ts'
import type PlanetData from '@core/models/planet/planet-data.model.ts'
import type { PrefixedWith } from '@core/models/planet/planet-data.model.ts'
import { RingParameters } from '@core/models/planet/ring-parameters.model.ts'

type LegacyRingPlanetData = PrefixedWith<PlanetData, "_"> & {
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
export function convertLegacyRingStorage(self: PlanetData, legacyData: PrefixedWith<PlanetData, "_">): void {
  const typedLegacyData = legacyData as LegacyRingPlanetData;
  if (typedLegacyData._ringInnerRadius) {
    self.ringsEnabled = typedLegacyData._ringEnabled ?? false
    const convertedParams = new RingParameters(
      '_ringsParams',
      self.notifyRelayCallback,
      typedLegacyData._ringInnerRadius ?? 1.25,
      typedLegacyData._ringOuterRadius ?? 1.5,
      typedLegacyData._ringColorRamp?._steps,
    )
    convertedParams.id = typedLegacyData._id ? typedLegacyData._id : convertedParams.id
    self.ringsParams.push(convertedParams)
  }
}
