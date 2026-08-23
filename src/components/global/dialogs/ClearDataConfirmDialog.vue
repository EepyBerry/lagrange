<template>
  <LgvDialog
    id="dialog-clear-data-confirm"
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_clear_data')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.confirm_clear_data.$title') }}
    </template>
    <template #content>
      <div class="clear-data-text">
        <p>{{ $t('dialog.confirm_clear_data.message') }}</p>
        <p>
          <strong>{{ $t('dialog.confirm_clear_data.warning') }}</strong>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="close(false)">
        {{ $t('dialog.confirm_clear_data.$action_cancel') }}
      </LgvButton>
      <LgvButton class="warn" icon="mingcute:delete-2-line" @click="close(true)">
        {{ $t('dialog.confirm_clear_data.$action_confirm') }}
      </LgvButton>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { ClearDataConfirmDialogExposes } from '@components/global/dialogs/ClearDataConfirmDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDialog from '@lib/components/custom/LgvDialog.vue';
import { useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
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
