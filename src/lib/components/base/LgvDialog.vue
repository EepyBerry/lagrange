<template>
  <dialog ref="dialog" @abort="close" :class="{ warn: isWarn }">
    <span class="deco" aria-hidden="true" />
    <span class="deco" aria-hidden="true" />
    <span class="deco" aria-hidden="true" />
    <div>
      <section class="dialog-header">
        <h2 v-if="showTitle" class="dialog-title">
          <slot name="title">DIALOG_TITLE</slot>
        </h2>
        <span v-else class="filler" />
        <div v-if="closeable" class="dialog-close-anchor">
          <LgvButton
            tabindex="0"
            variant="icon"
            class="dialog-close"
            icon="material-symbols:close"
            icon-width="1.75rem"
            :a11y-label="$t('a11y.action_close_dialog')"
            @click="close"
          />
        </div>
      </section>
      <section ref="dialogActions" class="dialog-content" tabindex="-1">
        <div class="dialog-content__layout">
          <span class="dialog-content__spacing" v-if="showSpacing" />
          <div class="dialog-content__main" :style="{ gridColumn: showSpacing ? '2' : 'span 2' }">
            <slot name="content">DIALOG_CONTENT</slot>
          </div>
        </div>
      </section>
      <section v-if="showActions" class="dialog-actions">
        <slot name="actions">DIALOG_ACTIONS</slot>
      </section>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
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
  showSpacing?: boolean;
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
  $outer-corner-length: 18px;
  $inner-corner-length: 21px;
  position: fixed;
  overflow: hidden;
  padding: var(--lg-var-border-width);
  margin: auto;

  border: none;
  color: var(--lg-text);
  background: var(--lg-accent);
  clip-path: polygon(
    0 $outer-corner-length,
    $outer-corner-length 0,
    100% 0,
    100% calc(100% - $outer-corner-length),
    calc(100% - $outer-corner-length) 100%,
    0 100%
  );

  display: flex;
  flex-direction: column;

  .deco {
    background: var(--lg-accent);
  }

  .dialog-close-anchor {
    z-index: 1;
    position: absolute;
    inset: 0 0 auto auto;

    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 4rem;
    background: var(--lg-accent);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 2rem 100%);

    button.dialog-close {
      min-width: 0;
      min-height: 0;
      width: 2rem;
      height: 2rem;
      filter: drop-shadow(0 1px 1px var(--lg-accent));
    }
    button.dialog-close:hover,
    button.dialog-close:focus {
      iconify-icon {
        transform: scale(1.125);
      }
    }
  }

  & > div {
    height: 100%;
    background: var(--lg-primary);
    clip-path: polygon(
      0 $inner-corner-length,
      $inner-corner-length 0,
      100% 0,
      100% calc(100% - $outer-corner-length),
      calc(100% - $outer-corner-length) 100%,
      0 100%
    );

    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;

    .dialog-header {
      padding: 1rem 4rem 1rem 1rem;
      display: flex;

      .dialog-title {
        color: var(--lg-text);
        font-weight: 600;
      }
    }

    .dialog-content {
      flex: 1;
      overflow-y: auto;

      background: var(--lg-primary);
      font-size: 0.875rem;

      display: flex;
      flex-direction: column;

      & > .dialog-content__layout {
        overflow: hidden;
        border-top: var(--lg-var-border-width) solid var(--lg-accent);

        display: grid;
        grid-template-columns: auto 1fr;

        & > .dialog-content__spacing {
          width: 20px;
          border-right: var(--lg-var-border-width) solid var(--lg-accent);
        }

        & > .dialog-content__main {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
      }
    }

    .dialog-actions {
      padding: 4px;
      border-top: var(--lg-var-border-width) solid var(--lg-accent);

      display: flex;
      justify-content: center;
      gap: 4px;
      & > * {
        flex-grow: 1;
      }
      & > *:last-child {
        clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);
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
  .dialog-close-anchor {
    background: var(--lg-warn);
    button.dialog-close {
      filter: drop-shadow(0 1px 1px var(--lg-warn-panel));
    }
  }
  & > div {
    background: var(--lg-warn-panel);
    .dialog-header,
    .dialog-content,
    .dialog-actions {
      background: var(--lg-warn-panel);
      scrollbar-color: var(--lg-warn) var(--code-background);
      border-color: var(--lg-warn);
    }
    .dialog-content > .dialog-content__layout {
      border-top: var(--lg-var-border-width) solid var(--lg-warn);
      & > .dialog-content__spacing {
        border-color: var(--lg-warn);
      }
    }
  }
}

dialog[open] > .deco {
  z-index: 1;
  $height: 4px;
  position: absolute;
  top: 1px;
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
