import type { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import type { DataEventEmitOptions, DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import { ColorRamp, ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import { clampedPRNG } from '@core/utils/math-utils.ts';
import { nanoid } from 'nanoid';

export class RingParameters {
  private readonly _eventEmitOpts: DataEventEmitOptions;
  private _id: string;
  private _innerRadius: number;
  private _outerRadius: number;
  private readonly _colorRamp: ColorRamp;

  constructor(
    eventEmitOpts: DataEventEmitOptions,
    innerRadius: number,
    outerRadius: number,
    colorRampSteps?: ColorRampStep[],
    oldId?: string,
  ) {
    this._id = oldId ?? nanoid();
    this._eventEmitOpts = eventEmitOpts;
    this._innerRadius = innerRadius;
    this._outerRadius = outerRadius;
    this._colorRamp = new ColorRamp(
      { endpointRef: this._eventEmitOpts.endpointRef, instanceId: this._id, context: 'ring' },
      [new ColorRampStep(0x483c2a, 0, true), new ColorRampStep(0xbf9a5e, 1, true)],
    );
    if (colorRampSteps) {
      this._colorRamp.loadFromSteps(colorRampSteps);
    }
  }

  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  public get innerRadius(): number {
    return this._innerRadius;
  }
  public set innerRadius(value: number) {
    this._innerRadius = value;
    if (this.outerRadius < this._innerRadius) {
      this.outerRadius = value; // Call setter to trigger change
    }
    this._eventEmitOpts.endpointRef.emit('ringParametersUpdate', { instanceId: this.id, value: this });
  }

  public get outerRadius(): number {
    return this._outerRadius;
  }
  public set outerRadius(value: number) {
    this._outerRadius = value;
    if (this.innerRadius > this._outerRadius) {
      this.innerRadius = value; // Call setter to trigger change
    }
    this._eventEmitOpts.endpointRef.emit('ringParametersUpdate', { instanceId: this.id, value: this });
  }

  public get colorRamp(): ColorRamp {
    return this._colorRamp;
  }

  public randomize() {
    this._colorRamp.randomize(3);
    this._eventEmitOpts.endpointRef.emit('ringParametersUpdate', { instanceId: this.id, value: this });
  }

  public static createRandom(parentEventEmitterRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>): RingParameters {
    const innerRadius = clampedPRNG(1.25, 4.75);
    const params = new RingParameters({ endpointRef: parentEventEmitterRef }, innerRadius, clampedPRNG(innerRadius, 5));
    params._colorRamp.randomize(3);
    return params;
  }
}
