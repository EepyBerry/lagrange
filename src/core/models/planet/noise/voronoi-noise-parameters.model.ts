import { clampedPRNG } from '@core/utils/math-utils.ts';
import { type ObservableNotifyFunction, ObservableRelay } from '@core/utils/observable-utils.ts';
import { clamp } from 'three/src/math/MathUtils.js';

export type VoronoiMode = (typeof VoronoiMode)[keyof typeof VoronoiMode];
export const VoronoiMode: Record<string, number> = {
  F1: 0,
  DistanceToEdge: 1,
} as const;

export class VoronoiNoiseParameters extends ObservableRelay {
  private _scale: number = 3;
  private _jitter: number = 1;
  private _mode: VoronoiMode = VoronoiMode.DistanceToEdge;

  constructor(
    keyPrefix: string,
    notifyFunc: ObservableNotifyFunction,
    scale?: number,
    jitter?: number,
    mode?: VoronoiMode,
  ) {
    super(keyPrefix, notifyFunc);
    this._scale = clamp(scale ?? this._scale, 0, 10);
    this._jitter = clamp(jitter ?? this._jitter, 0, 1);
    this._mode = mode ?? VoronoiMode.DistanceToEdge;
  }

  get scale(): number {
    return this._scale;
  }
  set scale(value: number) {
    this._scale = value;
    this.relayNotify({ key: `${this.keyPrefix}.scale` });
  }

  get jitter(): number {
    return this._jitter;
  }
  set jitter(value: number) {
    this._jitter = value;
    this.relayNotify({ key: `${this.keyPrefix}.jitter` });
  }

  get mode(): VoronoiMode {
    return this._mode;
  }
  set mode(value: VoronoiMode) {
    this._mode = value;
    this.relayNotify({ key: `${this.keyPrefix}.mode` });
  }

  public loadData(data?: VoronoiNoiseParameters) {
    this.scale = clamp(data?._scale ?? this._scale, 0, 10);
    this.jitter = clamp(data?._jitter ?? this._jitter, 0, 1);
  }

  public reset(scale: number, jitter: number): void {
    this._scale = clamp(scale, 0, 10);
    this._jitter = clamp(jitter, 0, 1);
  }

  // Note: adjusted ranges to get more coherent data
  public randomize() {
    this._scale = clampedPRNG(2, 8);
    this._jitter = clampedPRNG(0.16, 1);
  }
}
