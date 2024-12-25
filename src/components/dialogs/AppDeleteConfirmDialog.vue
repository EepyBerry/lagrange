<template>
  <DialogElement
    id="dialog-delete-confirm" 
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_delete')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.delete.$title', { planet }) }}
    </template>
    <template #content>
      <div class="delete-text">
        <p>{{ $t('dialog.delete.message') }}</p>
        <p>
          <strong>{{ $t('dialog.delete.warning') }}</strong>
        </p>
      </div>
    </template>
    <template #actions>
      <button class="lg" autofocus @click="cancelAndClose">
        <iconify-icon icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.delete.$action_cancel') }}
      </button>
      <button class="lg warn" @click="confirmAndClose">
        <iconify-icon icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.delete.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '../elements/DialogElement.vue'
import { ref, type Ref } from 'vue'

const planet = ref('')
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)

const $emit = defineEmits(['confirm'])
defineExpose({
  open: (p: string) => {
    planet.value = p
    dialogRef.value?.open()
  },
})

function cancelAndClose() {
  planet.value = ''
  dialogRef.value?.close()
}

function confirmAndClose() {
  $emit('confirm')
  planet.value = ''
  dialogRef.value?.close()
}
</script>

<style scoped lang="scss">
#dialog-delete-confirm {
  min-width: 24rem;
  .delete-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media screen and (max-width: 567px) {
  #dialog-delete-confirm {
    width: 100%;
    min-width: 0;
  }
}
</style>
