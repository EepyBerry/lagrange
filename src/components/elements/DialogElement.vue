<template>
  <dialog ref="dialog" class="lg" @abort="close">
    <section>
      <header class="dialog-header">
        <h2 v-if="showTitle" class="dialog-title">
          <slot name="title"></slot>
        </h2>
        <button @click="close" class="lg icon-button dialog-close" aria-label="Close dialog">
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
import { EventBus } from '@/core/window-event-bus';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';

const dialog: Ref<HTMLDialogElement|null> = ref(null)
const ignoresNativeEvents = ref(false)
const handleCancel = (evt: Event) => {
  if (ignoresNativeEvents.value) {
    evt.preventDefault()
  } else {
    evt.preventDefault()
    close()
  }
}

defineProps<{ showTitle?: boolean, showActions?: boolean }>()
onMounted(() => dialog.value!.addEventListener('cancel', handleCancel))
onUnmounted(() => dialog.value!.removeEventListener('cancel', handleCancel))

function open() {
  EventBus.disableWindowEventListener('keydown')
  dialog.value!.showModal()
}
function close() {
  EventBus.enableWindowEventListener('keydown')
  dialog.value!.close()
}

function ignoreNativeEvents(enabled: boolean) {
  ignoresNativeEvents.value = enabled
}

defineExpose({ open, close, ignoreNativeEvents, isOpen: dialog.value?.open })
</script>

<style scoped lang="scss">
dialog[open].lg {
  position: fixed;

  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  padding: 1rem;
  margin: auto;
  max-width: 90%;
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
    }

    button.dialog-close {
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

@media screen and (max-width:767px) {
  dialog[open].lg {
    max-width: calc(100% - 1rem);
    padding: 0.75rem;
  }
}
</style>