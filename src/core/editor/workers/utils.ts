import type { BakingWorkerOutput } from '@core/editor/workers/baking.worker.ts';
import type { TextureWorkerOutput } from '@core/editor/workers/texture.worker.ts';
import type PlanetData from '@core/models/planet/planet-data.model.ts';

// ----------------------------------------------------------------------------
// Common worker types

export const WorkerTextureDataType = {
  ColorRamp: 'color-ramp',
  Biomes: 'biomes',
  BiomesEmissive: 'biomes-emissive',
} as const;
export type WorkerTextureDataType = (typeof WorkerTextureDataType)[keyof typeof WorkerTextureDataType];

// ----------------------------------------------------------------------------
// Specialised buffer types

export type RawBufferTexture = {
  buffer: Uint8ClampedArray;
  width: number;
  height: number;
};
export const toBufferTexture = (data: TextureWorkerOutput): RawBufferTexture => {
  return {
    buffer: data.buffer,
    width: data.width,
    height: data.height,
  };
};

export type BakedData = {
  planetMap?: Uint8Array;
  planetMetallicRoughnessMap?: Uint8Array;
  planetEmissiveMap?: Uint8Array;
  planetNormalMap?: Uint8Array;
  clouds?: Uint8Array;
  rings?: Uint8Array[];
};
export const makeBakedData = (planetData: PlanetData): BakedData => {
  return {
    rings: Array(planetData.ringsEnabled ? planetData.ringsParams.length : 0).fill(null),
  };
};
export const mapOutputPartToBakedData = (bakedData: BakedData, data: BakingWorkerOutput<'part'>): void => {
  switch (data.target) {
    case 'map':
      bakedData.planetMap = data.buffer;
      break;
    case 'metallic-roughness-map':
      bakedData.planetMetallicRoughnessMap = data.buffer;
      break;
    case 'emissive-map':
      bakedData.planetEmissiveMap = data.buffer;
      break;
    case 'normal-map':
      bakedData.planetNormalMap = data.buffer;
      break;
    case 'clouds':
      bakedData.clouds = data.buffer;
      break;
    case 'rings':
      bakedData.rings![data.targetIndex!] = data.buffer;
      break;
  }
};
