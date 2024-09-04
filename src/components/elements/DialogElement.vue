<template>
  <dialog ref="dialog" class="lg" @abort="close">
    <section>
      <header class="dialog-header">
        <h2 v-if="showTitle" class="dialog-title">
          <slot name="title"></slot>
        </h2>
        <button @click="close" class="lg icon-button dialog-close" :aria-label="$t('a11y.action_close_dialog')">
          <iconify-icon icon="mingcute:close-line" width="1.5rem" aria-hidden="true" />
        </button>
      </header>
      <div class="dialog-content">
        <slot name="content"></slot>
      </div>
      <div v-if="showActions" class="dialog-actions">
        <slot name="actions"></slot>
      </div>
    </section>
  </dialog>
</template>

<script setup lang="ts">
import { EventBus } from '@core/event-bus'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

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

const $props = defineProps<{ showTitle?: boolean; showActions?: boolean; preventClickClose?: boolean }>()
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
  position: fixed;
  scrollbar-color: var(--lg-accent) transparent;
  scrollbar-width: thin;

  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  padding: 1rem;
  margin: auto;
  color: var(--lg-text);

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .dialog-title {
      font-weight: 600;
      padding-bottom: 1rem;
      padding-right: 2rem;
    }

    button.dialog-close {
      z-index: 1;
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }
  .dialog-content {
    font-size: 0.875rem;
  }
  .dialog-actions {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    & > * {
      flex-grow: 1;
    }
  }
}
dialog[open].lg::backdrop {
  background: rgb(0 0 0 / 37.5%);
}

@media screen and (max-width: 767px) {
  dialog[open].lg {
    box-shadow: 0 0 1rem #000;
    max-width: calc(100% - 1rem);
    padding: 0.75rem;
  }
}
@media screen and (max-width: 567px) {
  dialog[open].lg {
    width: 100%;
  }
}
</style>
