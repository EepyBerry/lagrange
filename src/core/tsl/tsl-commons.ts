import type { VoronoiMode } from '@core/models/planet/noise/voronoi-noise-parameters.model.ts';
import type { Vector3 } from 'three/webgpu';

export type WarpingData = {
  layers: number;
  warpFactor: Vector3;
};

export type DisplacementData = {
  factor: number;
  epsilon: number;
  multiplier: number;
};

export type FbmNoiseData = {
  frequency: number;
  amplitude: number;
  lacunarity: number;
  octaves: number;
};

export type VoronoiNoiseData = {
  scale: number;
  jitter: number;
  mode: VoronoiMode;
};
