import type { Vector3 } from 'three/webgpu';
import { struct } from 'three/tsl';

export type WarpingData = {
  layers: number;
  warpFactor: Vector3;
};
export const WarpingStruct = struct({
  layers: 'float',
  warpFactor: 'vec3',
});

export type DisplacementData = {
  factor: number;
  epsilon: number;
  multiplier: number;
};
export const DisplacementStruct = struct({
  factor: 'float',
  epsilon: 'float',
  multiplier: 'float',
});

export type NoiseData = {
  frequency: number;
  amplitude: number;
  lacunarity: number;
  octaves: number;
};
export const NoiseStruct = struct({
  frequency: 'float',
  amplitude: 'float',
  lacunarity: 'float',
  octaves: 'float',
});
