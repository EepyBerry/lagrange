<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-clear-data-confirm"
    :showTitle="true"
    :showActions="true"
    :aria-label="$t('a11y.dialog_clear_data')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.clear_data.$title') }}
    </template>
    <template v-slot:content>
      <div class="clear-data-text">
        <p>{{ $t('dialog.clear_data.message') }}</p>
        <p>
          <strong>{{ $t('dialog.clear_data.warning') }}</strong>
        </p>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="cancelAndClose" autofocus>
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

const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)

const $emit = defineEmits(['confirm'])
defineExpose({ open: () => {
  dialogRef.value?.open()
}})

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
  }
}
</style>
