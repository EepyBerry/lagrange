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

export type CellularNoiseData = {
  scale: number;
  jitter: number;
  strength: number;
  lacunarity: number;
};
