/**
 * Utility type for events
 */
export type ObservableSource = Observable | ObservableRelay;
export type ObservableNotifyFunction = (eventOpts?: ObservableEventOptions) => void;

/**
 * Simple implementation of the `Observable` pattern.
 */
export abstract class Observable {
  protected observers: Observer[] = [];

  /**
   * Utility callback for ObservableRelay children to call their parent's `notify` function.
   */
  public readonly notifyRelayCallback = (eventOpts?: ObservableEventOptions) => this.notify(eventOpts);

  public connect(observer: Observer): void {
    this.observers.push(observer);
  }
  public disconnectAll(): void {
    this.observers.splice(0);
  }

  public notify(eventOpts?: Omit<ObservableEventOptions, 'source'>): void {
    this.observers.forEach((observer) => observer.onEvent(new ObservableEvent({ ...eventOpts, source: this })));
  }
}

/**
 * Used for children of observables to relay events to the parent's subscribers.
 */
export abstract class ObservableRelay {
  public readonly keyPrefix: string;
  protected relayNotify: ObservableNotifyFunction;

  protected constructor(keyPrefix: string, notifyFunc: ObservableNotifyFunction) {
    this.keyPrefix = keyPrefix;
    this.relayNotify = notifyFunc;
  }
}

/**
 * Designates classes that can subscribe to {@link Observable Observables}.
 *
 * These have a special handler function `onEvent` called when an event is sent by the `Observable`.
 */
export abstract class Observer {
  protected readonly eventHandlerMap: Map<string, ObservableEventHandler> = new Map<string, ObservableEventHandler>();

  protected registerEventHandler(key: string, handler: ObservableEventHandler) {
    this.eventHandlerMap.set(key, handler);
  }

  public unhookEventHandlers() {
    this.eventHandlerMap.clear();
  }

  public onEvent(event: ObservableEvent): void {
    this.eventHandlerMap.get(event.key!)?.handle(event);
  }
}
export type ObservableEventOperation = (event: ObservableEvent) => void;
export type ObservableEventHandler = { type?: ObservableEventType; handle: ObservableEventOperation };
export type ObservableEventHandlerCtor = (operation: ObservableEventOperation) => ObservableEventHandler;

// ----------------------------------------------------------------------------

export type TObservableEventAction = (typeof ObservableEventAction)[keyof typeof ObservableEventAction];
export const ObservableEventAction = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete',
  SORT_UP: 'sort-up',
  SORT_DOWN: 'sort-down',
} as const;
export type ObservableEventType = 'keyed' | 'global';

export type ObservableEventOptions = {
  type?: ObservableEventType;
  source?: ObservableSource;
  key?: string;
  data?: Record<string, unknown>;
  action?: TObservableEventAction;
};

export class ObservableEvent {
  public readonly type?: ObservableEventType;
  public readonly source?: ObservableSource;
  public readonly key?: string = '';
  public readonly data?: Record<string, unknown> = {};
  public readonly action?: TObservableEventAction = ObservableEventAction.EDIT;

  constructor(opts: ObservableEventOptions) {
    this.type = opts.type ?? 'keyed';
    this.source = opts.source ?? undefined;
    this.key = opts.key;
    this.action = opts.action ?? ObservableEventAction.EDIT;
    this.data = opts.data ?? {};
  }
}
