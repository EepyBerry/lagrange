/**
 * Defines options to pass when registering a window event-listener:
 * - `autoEnable`: if the listener should also be added to the window (default: `true`)
 */
type WindowEventRegistryOptions = { autoEnable: boolean }

export class WindowEventBus {
  private static windowEventRegistry: Map<keyof WindowEventMap, any> = new Map<keyof WindowEventMap, any>()

  /**
   * Registers a window event-listener
   * @param type event-listener type (e.g. `keydown`)
   * @param listener the listener to register
   * @param options registering options (see {@link WindowEventRegistryOptions})
   */
  public static registerWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: WindowEventRegistryOptions,
  ) {
    WindowEventBus.windowEventRegistry.set(type, listener)
    if (!options || options.autoEnable) {
      window.addEventListener(type, listener)
    }
  }

  public static deregisterWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
  ) {
    WindowEventBus.windowEventRegistry.delete(type)
    window.removeEventListener(type, listener)
  }

  /**
   * Adds the event-listener to the window context using the internal listener ref saved beforehand
   * @param type event-listener type (e.g. `keydown`)
   */
  public static enableWindowEventListener<K extends keyof WindowEventMap>(type: K) {
    const event = WindowEventBus.windowEventRegistry.get(type)
    window.addEventListener(type, event)
  }

  /**
   * Removes the event-listener from the window context, but keeps the listener reference
   * @param type event-listener type (e.g. `keydown`)
   */
  public static disableWindowEventListener<K extends keyof WindowEventMap>(type: K) {
    const event = WindowEventBus.windowEventRegistry.get(type)
    window.removeEventListener(type, event)
  }
}
