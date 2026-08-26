<template>
  <LgvDialog
    id="dialog-warn-save"
    ref="dialogRef"
    :is-warn="true"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_warn_save')"
  >
    <template #title>
      <iconify-icon class="warn" icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.confirm_warnsave.$title') }}
    </template>
    <template #content>
      <div class="warn-text">
        <p>{{ $t('dialog.confirm_warnsave.message') }}</p>
        <p>
          <b>{{ $t('dialog.confirm_warnsave.warning') }}</b>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="dialogRef?.close()">
        {{ $t('dialog.confirm_warnsave.$action_cancel') }}
      </LgvButton>
      <LgvButton class="success" icon="mingcute:save-2-line" @click="saveConfirmClose">
        {{ $t('dialog.confirm_warnsave.$action_saveconfirm') }}
      </LgvButton>
      <LgvButton class="warn" icon="mingcute:exit-line" @click="confirmAndClose">
        {{ $t('dialog.confirm_warnsave.$action_confirm') }}
      </LgvButton>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { WarnSaveDialogExposes } from '@components/editor/dialogs/WarnSaveDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/custom/LgvDialog.types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDialog from '@lib/components/custom/LgvDialog.vue';
import { useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
defineExpose<WarnSaveDialogExposes>({ open: () => dialogRef.value?.open() });
const $emit = defineEmits(['save-confirm', 'confirm']);

function saveConfirmClose() {
  $emit('save-confirm');
  dialogRef.value?.close();
}

function confirmAndClose() {
  $emit('confirm');
  dialogRef.value?.close();
}
</script>

<style scoped lang="scss">
#dialog-warn-save {
  min-width: 24rem;
  .warn-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media screen and (max-width: 567px) {
  #dialog-warn-save {
    width: 100%;
    min-width: 0;
  }
}
</style>
