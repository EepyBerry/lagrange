import type { Texture } from 'three';
import type PlanetData from '../planet-data.model';
import type { CloudsUniformData } from '@core/tsl/materials/clouds.tslmat';
import { ModelConverter } from './model-converter';

export class CloudsDataConverter extends ModelConverter<PlanetData, CloudsUniformData> {
  private _opacityTexture: Texture;

  constructor(data: PlanetData, tex: Texture) {
    super(data);
    this._opacityTexture = tex;
  }

  public convert(): CloudsUniformData {
    return {
      flags: {
        showWarping: this._data.cloudsShowWarping,
        showDisplacement: this._data.cloudsShowDisplacement,
      },
      color: this._data.cloudsColor,
      noise: this._data.cloudsNoise,
      warping: {
        layers: this._data.cloudsNoise.layers,
        warpFactor: this._data.cloudsNoise.warpFactor,
      },
      displacement: {
        params: {
          factor: this._data.cloudsDisplacement.factor,
          epsilon: this._data.cloudsDisplacement.epsilon,
          multiplier: this._data.cloudsDisplacement.multiplier,
        },
        noise: {
          frequency: this._data.cloudsDisplacement.frequency,
          amplitude: this._data.cloudsDisplacement.amplitude,
          lacunarity: this._data.cloudsDisplacement.lacunarity,
          octaves: this._data.cloudsDisplacement.octaves,
        },
      },
      texture: this._opacityTexture,
    };
  }
}
