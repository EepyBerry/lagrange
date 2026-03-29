<template>
  <DialogElement
    id="dialog-warn-save"
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_warn_save')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.warnsave.$title') }}
    </template>
    <template #content>
      <div class="warn-text">
        <p>{{ $t('dialog.warnsave.message') }}</p>
        <p>
          <b>{{ $t('dialog.warnsave.warning') }}</b>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="dialogRef?.close()">
        {{ $t('dialog.warnsave.$action_cancel') }}
      </LgvButton>
      <LgvButton class="success" icon="mingcute:save-2-line" @click="saveConfirmClose">
        {{ $t('dialog.warnsave.$action_saveconfirm') }}
      </LgvButton>
      <LgvButton class="warn" icon="mingcute:exit-line" @click="confirmAndClose">
        {{ $t('dialog.warnsave.$action_confirm') }}
      </LgvButton>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '@components/global/elements/DialogElement.vue';
import { useTemplateRef } from 'vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import type { DialogElementExposes } from "@components/global/elements/DialogElement.types.ts";
import type { WarnSaveDialogExposes } from "@components/editor/dialogs/WarnSaveDialog.types.ts";

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef');
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
