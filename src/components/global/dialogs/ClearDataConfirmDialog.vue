<template>
  <DialogElement
    id="dialog-clear-data-confirm"
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_clear_data')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.clear_data.$title') }}
    </template>
    <template #content>
      <div class="clear-data-text">
        <p>{{ $t('dialog.clear_data.message') }}</p>
        <p>
          <strong>{{ $t('dialog.clear_data.warning') }}</strong>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="close(false)">
        {{ $t('dialog.clear_data.$action_cancel') }}
      </LgvButton>
      <LgvButton class="warn" icon="mingcute:delete-2-line" @click="close(true)">
        {{ $t('dialog.clear_data.$action_confirm') }}
      </LgvButton>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import type { ClearDataConfirmDialogExposes } from '@components/global/dialogs/ClearDataConfirmDialog.types.ts';
import type { DialogElementExposes } from '@components/global/elements/DialogElement.types.ts';
import DialogElement from '@components/global/elements/DialogElement.vue';
import { useTemplateRef } from 'vue';
import LgvButton from '@/_lib/components/LgvButton.vue';

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef');
defineExpose<ClearDataConfirmDialogExposes>({ open: () => dialogRef.value?.open() });

const $emit = defineEmits(['confirm']);

function close(confirm: boolean) {
  if (confirm) {
    $emit('confirm');
  }
  dialogRef.value?.close();
}
</script>

<style scoped lang="scss">
#dialog-clear-data-confirm {
  z-index: 20;
  min-width: 24rem;
  .clear-data-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media screen and (max-width: 567px) {
  #dialog-clear-data-confirm {
    width: 100%;
    min-width: 0;
  }
}
</style>
