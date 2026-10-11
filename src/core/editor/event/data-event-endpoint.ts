import type { DataEventPayloadTypeMap } from '@core/editor/event/data-event.types.ts';
import { nanoid } from 'nanoid';

/**
 * Data event endpoint; manages emission and reception for itself
 * @see DataEventPayload
 */
export class DataEventEndpoint<TKey extends keyof DataEventPayloadTypeMap> {
  public id: string;
  private readonly _listeners: DataEventEndpoint<keyof DataEventPayloadTypeMap>[] = [];
  public readonly eventHandlers: Map<TKey, (payload: DataEventPayloadTypeMap[TKey]) => void>;

  private _canProcess: (payload: DataEventPayloadTypeMap[TKey]) => boolean = () => true;

  constructor(id?: string) {
    this.id = id ?? nanoid();
    this.eventHandlers = new Map<TKey, (payload: DataEventPayloadTypeMap[TKey]) => void>();
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Linking

  public addListeners(endpoints: DataEventEndpoint<keyof DataEventPayloadTypeMap>[]) {
    for (const endpoint of endpoints) {
      if (!this._listeners.includes(endpoint)) {
        this._listeners.push(endpoint);
      }
    }
  }

  public disconnectListenerWithId(id: string) {
    const index = this._listeners.findIndex((listener) => listener.id === id);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    } else {
      console.warn(`Cannot disconnect DataEventEndpoint listener: element with id ${id} not found`);
    }
  }

  public dispose() {
    this._listeners.splice(0);
    this.eventHandlers.clear();
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Conditions

  public get canProcess() {
    return this._canProcess;
  }
  public set canProcess(predicate: (payload: DataEventPayloadTypeMap[TKey]) => boolean) {
    this._canProcess = predicate;
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Emission

  public emit<EKey extends TKey>(key: EKey, payload: DataEventPayloadTypeMap[EKey]): void {
    for (let i = 0; i < this._listeners.length; i++) {
      const listener = this._listeners[i];
      if (listener.canProcess(payload) && listener.eventHandlers.has(key)) {
        listener.processEvent(key, payload);
      }
    }
  }

  // ------------------------------------------------------------------------------------------------------------------
  // Reception

  public on<EKey extends TKey>(key: EKey, handle: (event: DataEventPayloadTypeMap[EKey]) => void): this {
    this.eventHandlers.set(key, handle as (event: DataEventPayloadTypeMap[TKey]) => void);
    return this;
  }

  public processEvent<EKey extends TKey>(key: EKey, payload: DataEventPayloadTypeMap[EKey]) {
    this.eventHandlers.get(key)?.(payload);
  }
}
