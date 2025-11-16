<template>
  <dialog ref="dialog" class="lg" @abort="close">
    <CornerDeco class="tl" :class="{ 'warn': isWarn }" />
    <CornerDeco class="br" :class="{ 'warn': isWarn }" />
    <header class="dialog-header">
      <h2 v-if="showTitle" class="dialog-title">
        <slot name="title"></slot>
      </h2>
      <span v-else class="filler" />
      <LgvButton
        v-if="closeable"
        tabindex="0"
        variant="icon"
        class="dialog-close"
        icon="mingcute:close-line"
        icon-width="1.75rem"
        :a11y-label="$t('a11y.action_close_dialog')"
        @click="close"
      />
    </header>
    <div ref="dialogInner" class="dialog-inner" tabindex="-1">
      <div class="dialog-content" role="group">
        <slot name="content"></slot>
      </div>
      <footer v-if="showActions" class="dialog-actions">
        <slot name="actions"></slot>
      </footer>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { EventBus } from '@core/event-bus'
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import CornerDeco from '../decoration/CornerDeco.vue'
import LgvButton from '@/_lib/components/LgvButton.vue'

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
dialog[open] {
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
    background: var(--lg-primary-static);
    display: flex;
    justify-content: space-between;

    .dialog-title {
      font-weight: 600;
    }

    button.dialog-close {
      z-index: 1;
      min-width: 1.75rem;
      min-height: 1.75rem;
    }
    button.dialog-close:hover, button.dialog-close:focus {
      iconify-icon { transform: scale(1.125); }
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
dialog[open]::backdrop {
  background: rgb(0 0 0 / 50%);
}
dialog[open].warn {
  background: var(--lg-warn-panel);
  border: 1px solid var(--lg-warn);
  .dialog-header,
  .dialog-inner {
    background: var(--lg-warn-panel);
    scrollbar-color: var(--lg-warn) var(--code-background);
  }
}

@media screen and (max-width: 567px) {
  dialog[open] {
    width: 100%;
    min-width: 0;

    .dialog-actions {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
</style>
