<template>
  <dialog ref="dialog" @abort="close" :class="{ warn: isWarn }">
    <span class="deco" aria-hidden="true" />
    <span class="deco" aria-hidden="true" />
    <span class="deco" aria-hidden="true" />
    <span class="deco-text" aria-hidden="true">
      ▏▎█ ██ ███ {{ isWarn ? 'W A R N I N G' : 'I N F O R M A T I O N' }} ▏▎████
    </span>
    <div>
      <header class="dialog-header">
        <h2 v-if="showTitle" class="dialog-title">
          <slot name="title">DIALOG_TITLE</slot>
        </h2>
        <span v-else class="filler" />
        <LgvButton
          v-if="closeable"
          tabindex="0"
          variant="icon"
          class="dialog-close"
          icon="material-symbols:close"
          icon-width="1.75rem"
          :a11y-label="$t('a11y.action_close_dialog')"
          @click="close"
        />
      </header>
      <div ref="dialogActions" class="dialog-content" tabindex="-1">
        <slot name="content">DIALOG_CONTENT</slot>
      </div>
      <footer v-if="showActions" class="dialog-actions">
        <slot name="actions">DIALOG_ACTIONS</slot>
      </footer>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import { UIEventBus } from '@core/ui-event-bus.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const dialog = useTemplateRef('dialog');
const dialogActions = useTemplateRef('dialogActions');

const ignoresNativeEvents = ref(false);
const handleCancel = (evt: Event) => {
  evt.preventDefault();
  if (ignoresNativeEvents.value) {
    return;
  }
  close();
};
const handleClick = (evt: Event) => {
  if (!$props.preventClickClose && evt.target === dialog.value) {
    close();
  }
};

const $emit = defineEmits(['open', 'close']);
defineExpose<LgvDialogExposes>({ open, close, ignoreNativeEvents, isOpen: dialog.value?.open ?? false });

const $props = defineProps<{
  showTitle?: boolean;
  showActions?: boolean;
  closeable?: boolean;
  preventClickClose?: boolean;
  isWarn?: boolean;
}>();
onMounted(() => {
  dialog.value?.addEventListener('click', handleClick);
  dialog.value?.addEventListener('cancel', handleCancel);
});
onBeforeUnmount(() => {
  dialog.value?.removeEventListener('click', handleClick);
  dialog.value?.removeEventListener('cancel', handleCancel);
});

function open() {
  UIEventBus.disableWindowEventListener('keydown');
  dialog.value?.showModal();
  dialogActions.value?.focus();
  $emit('open');
}
function close() {
  UIEventBus.enableWindowEventListener('keydown');
  dialog.value?.close();
  $emit('close');
}

function ignoreNativeEvents(enabled: boolean) {
  ignoresNativeEvents.value = enabled;
}
</script>

<style scoped lang="scss">
dialog[open]:host {
  scroll-behavior: unset;
}
dialog[open] {
  position: fixed;
  overflow: hidden;
  border: none;
  padding: 5px 1px 1px;
  margin: auto;

  color: var(--lg-text);
  background: var(--lg-accent);
  clip-path: polygon(0 18px, 18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%);

  .deco {
    background: var(--lg-accent);
  }
  & > div {
    height: 100%;
    background: var(--lg-primary-static);
    clip-path: polygon(0 18px, 18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%);

    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;

    .dialog-header {
      padding: 1rem 1rem 0.5rem;
      margin: 1px 1px 0;
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
      button.dialog-close:hover,
      button.dialog-close:focus {
        iconify-icon {
          transform: scale(1.125);
        }
      }
    }

    .dialog-content {
      padding: 0.5rem 1rem;
      margin: 0 1px 1px;
      flex: 1;
      overflow-y: auto;

      background: var(--lg-primary);
      font-size: 0.875rem;
    }
    .dialog-actions {
      padding: 0.5rem 1rem 1rem;
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      & > * {
        flex-grow: 1;
      }
      & > *:last-child {
        clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
      }
    }
  }
}

dialog[open]::backdrop {
  background: rgb(0 0 0 / 50%);
}

dialog[open].warn {
  background: var(--lg-warn);
  .deco {
    background: var(--lg-warn);
  }
  .deco-text {
    color: var(--lg-warn);
  }
  & > div {
    background: var(--lg-warn-panel);
    .dialog-header,
    .dialog-content,
    .dialog-actions {
      background: var(--lg-warn-panel);
      scrollbar-color: var(--lg-warn) var(--code-background);
    }
  }
}

.deco {
  z-index: 1;
  $height: 7px;
  position: absolute;
  top: 4px;
  left: 0;
  height: $height;
  width: 2.5rem;

  &:first-child {
    left: 0;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - $height), calc(100% - $height) 100%, 0 100%);
  }
  &:nth-child(2) {
    left: 3.5rem;
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - $height),
      calc(100% - $height) 100%,
      $height 100%,
      0 calc(100% - $height)
    );
  }
  &:nth-child(3) {
    left: 7rem;
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - $height),
      calc(100% - $height) 100%,
      $height 100%,
      0 calc(100% - $height)
    );
  }
}
.deco-text {
  z-index: 1;
  position: absolute;
  top: 4px;
  right: 0;
  font-size: 6px;
  font-family:
    JetBrains Mono,
    monospace;
  font-weight: 800;
  color: var(--lg-accent);
  user-select: none;
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
