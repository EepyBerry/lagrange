<template>
  <LgvDialog
    id="dialog-reset-confirm"
    ref="dialogRef"
    :is-warn="true"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_reset')"
  >
    <template #title>
      <iconify-icon class="warn" icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.confirm_reset.$title') }}
    </template>
    <template #content>
      <div class="reset-text">
        <p>{{ $t('dialog.confirm_reset.message') }}</p>
        <p>
          <b>{{ $t('dialog.confirm_reset.warning') }}</b>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="dialogRef?.close()">
        {{ $t('dialog.confirm_reset.$action_cancel') }}
      </LgvButton>
      <LgvButton class="warn" icon="tabler:reload" @click="confirmAndClose">
        {{ $t('dialog.confirm_reset.$action_confirm') }}
      </LgvButton>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { ResetConfirmDialogExposes } from '@components/editor/dialogs/ResetConfirmDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDialog from '@lib/components/custom/LgvDialog.vue';
import { useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
defineExpose<ResetConfirmDialogExposes>({ open: () => dialogRef.value?.open() });
const $emit = defineEmits(['confirm']);

function confirmAndClose() {
  $emit('confirm');
  dialogRef.value?.close();
}
</script>

<style scoped lang="scss">
#dialog-reset-confirm {
  min-width: 24rem;
  .reset-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media screen and (max-width: 567px) {
  #dialog-reset-confirm {
    width: 100%;
    min-width: 0;
  }
}
</style>
