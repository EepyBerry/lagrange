<template>
  <div id="toast-bar">
    <ToastElement :visible="isToastShown" :type="toastType" @close="closeToast">
      {{ $t(toastMessageRaw) }}
    </ToastElement>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import ToastElement from '../elements/ToastElement.vue'
import { EventBus } from '@/core/services/event-bus'
import type { InfoLevel } from '@/core/types'

const toastType: Ref<InfoLevel> = ref('info')
const toastMessageRaw: Ref<string> = ref('main.test_message')
const isToastShown: Ref<boolean> = ref(false)

let timeoutId: NodeJS.Timeout | null = null

watch(EventBus.toastEvent, (evt) => {
  if (evt === null) return
  showToast(evt.type, evt.translationKey, evt.millis)
})

function showToast(type: InfoLevel, translationKey: string, millis: number) {
  if (timeoutId !== null) {
    // if a timeout is currently running, clear it
    clearTimeout(timeoutId)
    closeToast()
  }

  toastType.value = type
  toastMessageRaw.value = translationKey
  isToastShown.value = true
  timeoutId = setTimeout(closeToast, millis)
}

function closeToast() {
  isToastShown.value = false
  timeoutId = null
}
</script>

<style scoped lang="scss">
#toast-bar {
  z-index: 10;
  position: absolute;
  inset: auto 1rem 4.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
@media screen and (max-width: 1199px) {
  #toast-bar {
    inset: auto 0.5rem 3.75rem;
  }
}
</style>
