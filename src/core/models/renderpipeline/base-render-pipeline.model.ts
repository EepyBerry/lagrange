import type { DataEventEndpoint } from '@core/editor/event/data-event-endpoint.ts';
import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';

export type BaseRenderPipelineIdentifier = 'none' | 'pixelation' | 'retro';
export abstract class BaseRenderPipeline {
  protected readonly _id!: BaseRenderPipelineIdentifier;
  protected readonly _parentDataEventEndpointRef!: DataEventEndpoint<keyof DataEventPayloadTypeMap>;

  public get id(): BaseRenderPipelineIdentifier {
    return this._id;
  }

  protected constructor(parentDataEventEndpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>) {
    this._parentDataEventEndpointRef = parentDataEventEndpointRef;
  }
}

export class BaseRenderPipelineNone extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'none';
  constructor(parentDataEventEndpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>) {
    super(parentDataEventEndpointRef);
  }
}

export class BaseRenderPipelinePixelation extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'pixelation';

  private _pixelSize: number;
  private _normalEdgeIntensity: number;
  private _depthEdgeIntensity: number;

  public get pixelSize(): number {
    return this._pixelSize;
  }
  public set pixelSize(value: number) {
    this._pixelSize = value;
    this._parentDataEventEndpointRef.emit('renderPipelinePixelation', { value: this });
  }

  public get normalEdgeIntensity(): number {
    return this._normalEdgeIntensity;
  }
  public set normalEdgeIntensity(value: number) {
    this._normalEdgeIntensity = value;
    this._parentDataEventEndpointRef.emit('renderPipelinePixelation', { value: this });
  }

  public get depthEdgeIntensity(): number {
    return this._depthEdgeIntensity;
  }
  public set depthEdgeIntensity(value: number) {
    this._depthEdgeIntensity = value;
    this._parentDataEventEndpointRef.emit('renderPipelinePixelation', { value: this });
  }

  constructor(parentDataEventEndpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>) {
    super(parentDataEventEndpointRef);
    this._pixelSize = 4;
    this._normalEdgeIntensity = 0;
    this._depthEdgeIntensity = 0;
  }
}

export class BaseRenderPipelineRetro extends BaseRenderPipeline {
  protected readonly _id: BaseRenderPipelineIdentifier = 'retro';

  private _colorDepthSteps: number;
  private _colorBleeding: number;

  private _scanlineIntensity: number;
  private _scanlineDensity: number;
  private _scanlineSpeed: number;

  private _curvature: number;

  public get colorDepthSteps(): number {
    return this._colorDepthSteps;
  }
  public set colorDepthSteps(value: number) {
    this._colorDepthSteps = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  public get colorBleeding(): number {
    return this._colorBleeding;
  }
  public set colorBleeding(value: number) {
    this._colorBleeding = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  public get scanlineIntensity(): number {
    return this._scanlineIntensity;
  }
  public set scanlineIntensity(value: number) {
    this._scanlineIntensity = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  public get scanlineDensity(): number {
    return this._scanlineDensity;
  }
  public set scanlineDensity(value: number) {
    this._scanlineDensity = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  public get scanlineSpeed(): number {
    return this._scanlineSpeed;
  }
  public set scanlineSpeed(value: number) {
    this._scanlineSpeed = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  public get curvature(): number {
    return this._curvature;
  }
  public set curvature(value: number) {
    this._curvature = value;
    this._parentDataEventEndpointRef.emit('renderPipelineRetro', { value: this });
  }

  constructor(parentDataEventEndpointRef: DataEventEndpoint<keyof DataEventPayloadTypeMap>) {
    super(parentDataEventEndpointRef);
    this._colorDepthSteps = 32;
    this._colorBleeding = 0.001;

    this._scanlineIntensity = 0.3;
    this._scanlineDensity = 1;
    this._scanlineSpeed = 0;

    this._curvature = 0.02;
  }
}
