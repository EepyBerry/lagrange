<template>
  <DialogElement
    id="dialog-reset-confirm"
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_reset')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.reset.$title') }}
    </template>
    <template #content>
      <div class="reset-text">
        <p>{{ $t('dialog.reset.message') }}</p>
        <p>
          <b>{{ $t('dialog.reset.warning') }}</b>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="dialogRef?.close()">
        {{ $t('dialog.reset.$action_cancel') }}
      </LgvButton>
      <LgvButton class="warn" icon="tabler:reload" @click="confirmAndClose">
        {{ $t('dialog.reset.$action_confirm') }}
      </LgvButton>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '@components/global/elements/DialogElement.vue';
import { useTemplateRef } from 'vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import type { DialogElementExposes } from "@components/global/elements/DialogElement.types.ts";
import type { ResetConfirmDialogExposes } from "@components/editor/dialogs/ResetConfirmDialog.types.ts";

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef');
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
