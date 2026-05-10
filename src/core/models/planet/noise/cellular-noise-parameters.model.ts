import { ObservableRelay } from '@core/utils/observable-utils.ts';

export class CellularNoiseParameters extends ObservableRelay {
  private _scale: number = 3;
  private _lacunarity: number = 2;
}
