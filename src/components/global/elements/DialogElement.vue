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
        tabindex="0"
        class="lg icon-button dialog-close"
        :aria-label="$t('a11y.action_close_dialog')"
        @click="close"
      >
        <iconify-icon icon="mingcute:close-line" width="1.5rem" aria-hidden="true" />
      </button>
    </header>
    <div ref="dialogInner" class="dialog-inner" tabindex="-1">
      <div class="dialog-content">
        <slot name="content"></slot>
      </div>
      <div v-if="showActions" class="dialog-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { EventBus } from '@core/event-bus'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import CornerDeco from '../decoration/CornerDeco.vue'

const dialog: Ref<HTMLDialogElement | null> = ref(null)
const dialogInner: Ref<HTMLDivElement | null> = ref(null)

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
  dialogInner.value?.focus()
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
  overflow: hidden;

  background: var(--lg-accent);
  border: none;
  border-radius: 2px;
  margin: auto;
  color: var(--lg-text);
  clip-path: polygon(0 23px, 23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%);

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 0;

  .dialog-header {
    padding: 1rem;
    margin: 1px 1px 0;
    background: var(--lg-primary);

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

  .dialog-inner {
    height: 100%;
    margin: 0 1px 1px;
    overflow-y: auto;
    background: var(--lg-primary);
  }
  .dialog-content {
    padding: 0 1rem 1rem;
    font-size: 0.875rem;
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
  background: rgb(0 0 0 / 50%);
}
dialog[open].lg.warn {
  background: var(--lg-warn-panel);
  border: 1px solid var(--lg-warn);
  .dialog-header,
  .dialog-inner {
    background: var(--lg-warn-panel);
    scrollbar-color: var(--lg-warn) var(--code-background);
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
