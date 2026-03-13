/**
 * Utility type for events
 */
export type ObservableType = Observable | ObservableRelay;
export type ObservableNotifyFunction = (eventOpts?: ObservableKeyedEventOptions) => void;

/**
 * Simple implementation of the `Observable` pattern.
 */
export abstract class Observable {
  protected observers: Observer[] = [];

  /**
   * Utility callback for ObservableRelay children to call their parent's `notify` function.
   */
  protected readonly notifyRelayCallback = (eventOpts?: ObservableKeyedEventOptions) => {
    console.log(this);
    this.notify(eventOpts);
  };

  public connect(observer: Observer): void {
    this.observers.push(observer);
  }
  public disconnect(observer: Observer): void {
    const idx = this.observers.findIndex((o) => o === observer);
    if (idx < 0) return;
    this.observers.splice(idx, 1);
  }

  public notify(eventOpts?: ObservableKeyedEventOptions): void {
    if (eventOpts?.key) {
      const event = new ObservableKeyedEvent({ ...eventOpts, source: this });
      this.observers.forEach((observer) => observer.onKeyedEvent(event));
      return;
    } else {
      this.observers.forEach((observer) => observer.onGlobalEvent(new ObservableGlobalEvent(this)));
    }
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
  public abstract onKeyedEvent(event: ObservableKeyedEvent<ObservableType>): void;
  public abstract onGlobalEvent(event: ObservableGlobalEvent<ObservableType>): void;
}

// ----------------------------------------------------------------------------

export enum ObservableEventAction {
  ADD,
  EDIT,
  DELETE,
  SORT_UP,
  SORT_DOWN,
}
export type ObservableKeyedEventOptions = {
  key: string;
  data?: Record<string, unknown>;
  action?: ObservableEventAction;
};
export abstract class ObservableEvent<O extends ObservableType> {
  public readonly source: O;

  constructor(source: O) {
    this.source = source;
  }
}
export class ObservableGlobalEvent<O extends ObservableType> extends ObservableEvent<O> {}
export class ObservableKeyedEvent<O extends ObservableType> extends ObservableEvent<O> {
  public readonly key: string;
  public readonly data: Record<string, unknown>;
  public readonly action: ObservableEventAction;

  constructor(opts: ObservableKeyedEventOptions & { source: O }) {
    super(opts.source);
    this.key = opts.key;
    this.action = opts.action ?? ObservableEventAction.EDIT;
    this.data = opts.data ?? {};
  }
}
