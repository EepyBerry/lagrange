import type { TextureWorkerOperation } from '@core/editor/workers/texture.worker.ts';
import type {
  SerializedBiomeParameters,
  SerializedColorRampStep,
} from '@core/editor/workers/worker-serializer.types.ts';
import type { ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import type { BiomeParameters } from '@core/models/planet/features/biome-parameters.model.ts';

export function serializeTextureWorkerData(
  data: unknown,
  operation: TextureWorkerOperation,
): SerializedColorRampStep[] | SerializedBiomeParameters[] | undefined {
  if (operation === 'color-ramp') {
    return (<ColorRampStep[]>data).map(
      (step: ColorRampStep): SerializedColorRampStep => ({
        id: step.id,
        color: { r: step.color.r, g: step.color.g, b: step.color.b },
        isBound: step.isBound,
        alpha: step.alpha,
        factor: step.factor,
      }),
    );
  }
  if (operation === 'biomes' || operation === 'biomes-emissive') {
    return (<BiomeParameters[]>data).map(
      (biome: BiomeParameters): SerializedBiomeParameters => ({
        id: biome.id,
        tempMin: biome.tempMin,
        tempMax: biome.tempMax,
        humiMin: biome.humiMin,
        humiMax: biome.humiMax,
        color: { r: biome.color.r, g: biome.color.g, b: biome.color.b },
        smoothness: biome.smoothness,
        emissiveOverride: biome.emissiveOverride,
        emissiveIntensity: biome.emissiveIntensity,
        parentEmissiveIntensity: biome.parentEmissiveIntensity,
      }),
    );
  }
}
