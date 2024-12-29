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
      <button class="lg" autofocus @click="cancelAndClose">
        <iconify-icon icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.clear_data.$action_cancel') }}
      </button>
      <button class="lg warn" @click="confirmAndClose">
        <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.clear_data.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '../elements/DialogElement.vue'
import { ref, type Ref } from 'vue'

const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)

const $emit = defineEmits(['confirm'])
defineExpose({
  open: () => {
    dialogRef.value?.open()
  },
})

function cancelAndClose() {
  dialogRef.value?.close()
}

function confirmAndClose() {
  $emit('confirm')
  dialogRef.value?.close()
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
