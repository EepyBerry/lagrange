import { ref, type Ref } from 'vue';
import type { EditorMessageLevel } from './types';

type ToastMessageEvent = { type: EditorMessageLevel; translationKey: string; millis: number };

export class UIEventBus {
  public static clearEvent: Ref<string> = ref('');
  public static toastEvent: Ref<ToastMessageEvent | null> = ref(null);

  public static sendDataClearEvent() {
    UIEventBus.clearEvent.value = new Date().toISOString();
  }

  public static sendToastEvent(type: EditorMessageLevel, translationKey: string, millis: number) {
    UIEventBus.toastEvent.value = { type, translationKey, millis };
  }
}
