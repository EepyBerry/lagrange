<template>
  <dialog ref="dialog" class="lg" @abort="close">
    <CornerDeco class="tl" :class="{ 'warn': isWarn }" />
    <CornerDeco class="br" :class="{ 'warn': isWarn }" />
    <header class="dialog-header">
      <h2 v-if="showTitle" class="dialog-title">
        <slot name="title"></slot>
      </h2>
      <button
        v-if="closeable"
        class="lg icon-button dialog-close"
        :aria-label="$t('a11y.action_close_dialog')"
        @click="close"
      >
        <iconify-icon icon="mingcute:close-line" width="1.5rem" aria-hidden="true" />
      </button>
    </header>
    <div class="dialog-content">
      <slot name="content"></slot>
    </div>
    <div v-if="showActions" class="dialog-actions">
      <slot name="actions"></slot>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { EventBus } from '@core/event-bus'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import CornerDeco from '../decoration/CornerDeco.vue'

const dialog: Ref<HTMLDialogElement | null> = ref(null)
const ignoresNativeEvents = ref(false)
const handleCancel = (evt: Event) => {
  evt.preventDefault()
  if (ignoresNativeEvents.value) {
    return
  }
  close()
}
const handleClick = (evt: Event) => {
  if (!$props.preventClickClose && evt.target === dialog.value) {
    close()
  }
}

const $props = defineProps<{
  showTitle?: boolean
  showActions?: boolean
  closeable?: boolean
  preventClickClose?: boolean,
  isWarn?: boolean
}>()
onMounted(() => {
  dialog.value?.addEventListener('click', handleClick)
  dialog.value?.addEventListener('cancel', handleCancel)
})
onBeforeUnmount(() => {
  dialog.value?.removeEventListener('click', handleClick)
  dialog.value?.removeEventListener('cancel', handleCancel)
})

function open() {
  EventBus.disableWindowEventListener('keydown')
  dialog.value?.showModal()
}
function close() {
  EventBus.enableWindowEventListener('keydown')
  dialog.value?.close()
}

function ignoreNativeEvents(enabled: boolean) {
  ignoresNativeEvents.value = enabled
}

defineExpose({ open, close, ignoreNativeEvents, isOpen: dialog.value?.open })
</script>

<style scoped lang="scss">
dialog[open].lg {
  &:host { scroll-behavior: none; }
  position: fixed;
  padding: 0;

  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 2px;
  box-shadow: 0 0 32px 16px var(--black);
  margin: auto;
  color: var(--lg-text);
  clip-path: polygon(0 24px, 24px 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%);

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  .dialog-header {
    padding: 1rem;

    .dialog-title {
      font-weight: 600;
    }

    button.dialog-close {
      z-index: 1;
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }
  .dialog-content {
    padding: 0 1rem 1rem;
    font-size: 0.875rem;
    overflow-y: auto;
  }
  .dialog-actions {
    padding: 0 1rem 1rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    & > * {
      flex-grow: 1;
    }
    & > *:last-child {
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
    }
  }
}
dialog[open].lg::backdrop {
  background: rgb(0 0 0 / 40%);
}
dialog.lg.warn {
  background: var(--lg-warn-panel);
  border: 1px solid var(--lg-warn);
}

@media screen and (max-width: 767px) {
  dialog[open].lg {
    max-width: calc(100% - 1rem);
    padding: 0.75rem;
  }
}
@media screen and (max-width: 567px) {
  dialog[open].lg {
    width: 100%;
    min-width: 0;

    .dialog-actions {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>
