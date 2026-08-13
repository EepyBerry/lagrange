import type { DataEventContext } from '@core/editor/event/data-event.types.ts';

/**
 * The core event type, fired from {@link DataEventEndpoint}s
 * @property key - generic-typed event key; must be a key within {@link DataEventPayloadTypeMap}
 * @property context - optional context if fired from a child object
 * @property value - current value
 */
export type DataEventPayload<TValue> = {
  instanceId?: string;
  context?: DataEventContext;
  value: TValue;
};
