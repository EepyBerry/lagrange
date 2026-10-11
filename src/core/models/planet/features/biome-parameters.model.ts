import type { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import type { DataEventEmitOptions, DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import { clampedPRNG } from '@core/utils/math-utils.ts';
import { nanoid } from 'nanoid';
import { Color } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';

export class BiomeDimensions {
  temperatureMin: number = 0;
  temperatureMax: number = 1;
  humidityMin: number = 0;
  humidityMax: number = 1;

  constructor(temperatureMin: number, temperatureMax: number, humidityMin: number, humidityMax: number) {
    this.temperatureMin = temperatureMin;
    this.temperatureMax = temperatureMax;
    this.humidityMin = humidityMin;
    this.humidityMax = humidityMax;
  }
}
export class BiomeParameters {
  private _id: string;
  private readonly _eventEmitOpts: DataEventEmitOptions;

  private _tempMin: number = 0;
  private _tempMax: number = 1;
  private _humiMin: number = 0;
  private _humiMax: number = 1;

  private _color: Color;
  private _smoothness: number = 0.2;
  private _emissiveIntensity: number = 0;

  constructor(
    eventEmitOpts: DataEventEmitOptions,
    dims: BiomeDimensions,
    color: Color,
    smoothness: number,
    emissiveIntensity?: number,
    oldId?: string,
  ) {
    this._id = oldId ?? nanoid();
    this._eventEmitOpts = eventEmitOpts;
    this._tempMin = dims.temperatureMin;
    this._tempMax = dims.temperatureMax;
    this._humiMin = dims.humidityMin;
    this._humiMax = dims.humidityMax;
    this._color = new Color(color);
    this._smoothness = smoothness;
    this._emissiveIntensity = emissiveIntensity ?? 0;
  }

  public get id(): string {
    return this._id;
  }
  public set id(id: string) {
    this._id = id;
  }

  public get tempMin(): number {
    return this._tempMin;
  }
  public set tempMin(value: number) {
    this._tempMin = clamp(value, 0, 1);
    this._tempMax = clamp(this._tempMax, this._tempMin, 1);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }
  public get tempMax(): number {
    return this._tempMax;
  }
  public set tempMax(value: number) {
    this._tempMax = clamp(value, 0, 1);
    this._tempMin = clamp(this._tempMin, 0, this._tempMax);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }

  public get humiMin(): number {
    return this._humiMin;
  }
  public set humiMin(value: number) {
    this._humiMin = clamp(value, 0, 1);
    this._humiMax = clamp(this._humiMax, this._humiMin, 1);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }
  public get humiMax(): number {
    return this._humiMax;
  }
  public set humiMax(value: number) {
    this._humiMax = clamp(value, 0, 1);
    this._humiMin = clamp(this._humiMin, 0, this._humiMax);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }

  public get color(): Color {
    return this._color;
  }
  public set color(value: Color) {
    this._color.set(value);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }
  public get smoothness(): number {
    return this._smoothness;
  }
  public set smoothness(value: number) {
    this._smoothness = clamp(value, 0, 1);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }

  public get emissiveIntensity(): number {
    return this._emissiveIntensity;
  }
  public set emissiveIntensity(value: number) {
    this._emissiveIntensity = clamp(value, 0, 10);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }

  public randomize() {
    const minTemp = clampedPRNG(0, 1),
      minHumi = clampedPRNG(0, 1);
    this._tempMin = minTemp;
    this._tempMax = clampedPRNG(minTemp, 1);
    this._humiMin = minHumi;
    this._humiMax = clampedPRNG(minHumi, 1);
    this._color.set(clampedPRNG(0, 1) * 0xffffff);
    this._smoothness = clampedPRNG(0, 1);
    this._emissiveIntensity = clampedPRNG(0, 10);
    this._eventEmitOpts.endpointRef.emit('biomeParametersUpdate', {
      value: null,
    });
  }

  public static createRandom(
    parentDataEventEndpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>,
  ): BiomeParameters {
    const minTemp = clampedPRNG(0, 1),
      minHumi = clampedPRNG(0, 1);
    return new BiomeParameters(
      { endpointRef: parentDataEventEndpointRef, context: 'biomes' },
      {
        temperatureMin: minTemp,
        temperatureMax: clampedPRNG(minTemp, 1),
        humidityMin: minHumi,
        humidityMax: clampedPRNG(minHumi, 1),
      },
      new Color(clampedPRNG(0, 1) * 0xffffff),
      clampedPRNG(0, 1),
      clampedPRNG(0, 10),
    );
  }
}
