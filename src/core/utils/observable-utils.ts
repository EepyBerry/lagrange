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
  public disconnect(observer: Observer): void {
    const idx = this.observers.findIndex((o) => o === observer);
    if (idx < 0) return;
    this.observers.splice(idx, 1);
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

  constructor(keyPrefix: string, notifyFunc: ObservableNotifyFunction) {
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
  public abstract onEvent(event: ObservableEvent): void;
}

// ----------------------------------------------------------------------------

export enum ObservableEventAction {
  ADD,
  EDIT,
  DELETE,
  SORT_UP,
  SORT_DOWN,
}
export type ObservableEventType = 'keyed' | 'global';

export type ObservableEventOptions = {
  type?: ObservableEventType;
  source?: ObservableSource;
  key?: string;
  data?: Record<string, unknown>;
  action?: ObservableEventAction;
};

export class ObservableEvent {
  public readonly type?: ObservableEventType;
  public readonly source?: ObservableSource;
  public readonly key?: string = '';
  public readonly data?: Record<string, unknown> = {};
  public readonly action?: ObservableEventAction = ObservableEventAction.EDIT;

  constructor(opts: ObservableEventOptions) {
    this.type = opts.type ?? 'keyed';
    this.source = opts.source ?? undefined;
    this.key = opts.key;
    this.action = opts.action ?? ObservableEventAction.EDIT;
    this.data = opts.data ?? {};
  }
}
