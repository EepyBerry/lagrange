import { ref, type Ref } from 'vue'
import type { InfoLevel } from './types'

/**
 * Defines options to pass when registering a window event-listener:
 * - `autoEnable`: if the listener should also be added to the window (default: `true`)
 */
type WindowEventRegistryOptions = { autoEnable: boolean }
type ToastMessageEvent = { type: InfoLevel; translationKey: string; millis: number }

export class EventBus {
  public static clearEvent: Ref<string> = ref('')
  public static toastEvent: Ref<ToastMessageEvent | null> = ref(null)
  public static clickEvent: Ref<MouseEvent | null> = ref(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static windowEventRegistry: Map<keyof WindowEventMap, any> = new Map<keyof WindowEventMap, any>()

  public static sendDataClearEvent() {
    EventBus.clearEvent.value = new Date().toISOString()
  }

  public static sendToastEvent(type: InfoLevel, translationKey: string, millis: number) {
    EventBus.toastEvent.value = { type, translationKey, millis }
  }

  public static sendClickEvent(evt: MouseEvent) {
    EventBus.clickEvent.value = evt
  }

  // ----------------------------------------------------------------------------------------------

  /**
   * Registers a window event-listener
   * @param type event-listener type (e.g. `keydown`)
   * @param listener the listener to register
   * @param options registering options (see {@link WindowEventRegistryOptions})
   */
  public static registerWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: WindowEventRegistryOptions,
  ) {
    EventBus.windowEventRegistry.set(type, listener)
    if (!options || options.autoEnable) {
      window.addEventListener(type, listener)
    }
  }

  public static deregisterWindowEventListener<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
  ) {
    EventBus.windowEventRegistry.delete(type)
    window.removeEventListener(type, listener)
  }

  /**
   * Adds the event-listener to the window context using the internal listener ref saved beforehand
   * @param type event-listener type (e.g. `keydown`)
   */
  public static enableWindowEventListener<K extends keyof WindowEventMap>(type: K) {
    const event = EventBus.windowEventRegistry.get(type)
    window.addEventListener(type, event)
  }

  /**
   * Removes the event-listener from the window context, but keeps the listener reference
   * @param type event-listener type (e.g. `keydown`)
   */
  public static disableWindowEventListener<K extends keyof WindowEventMap>(type: K) {
    const event = EventBus.windowEventRegistry.get(type)
    window.removeEventListener(type, event)
  }
}
