import type { Vector3 } from 'three';
import type PlanetData from '../planet-data.model';
import { ModelConverter } from './model-converter';
import type { AtmosphereUniformsData } from '@/core/tsl/materials/atmosphere.tslmat';

export class AtmosphereDataConverter extends ModelConverter<PlanetData, AtmosphereUniformsData> {
  private _sunPosition: Vector3;

  constructor(data: PlanetData, sunPosition: Vector3) {
    super(data);
    this._sunPosition = sunPosition;
  }

  public convert(): AtmosphereUniformsData {
    return {
      sunlight: {
        position: this._sunPosition,
        intensity: this._data.sunLightIntensity,
      },
      transform: {
        radius: this._data.planetRadius + this._data.atmosphereHeight,
        surfaceRadius: this._data.planetRadius,
      },
      render: {
        density: this._data.atmosphereDensityScale,
        intensity: this._data.atmosphereIntensity,
        colorMode: this._data.atmosphereColorMode,
        hue: this._data.atmosphereHue,
        tint: this._data.atmosphereTint,
        advanced: {
          mieScatteringConstant: this._data.atmosphereMieScatteringConstant,
          rayleighDensityRatio: this._data.atmosphereRayleighDensityRatio,
          mieDensityRatio: this._data.atmosphereMieDensityRatio,
          opticalDensityRatio: this._data.atmosphereOpticalDensityRatio,
        },
      },
    };
  }
}
