<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-delete-confirm"
    :showTitle="true"
    :showActions="true"
    :aria-label="$t('a11y.dialog_delete')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.delete.$title', { planet }) }}
    </template>
    <template v-slot:content>
      <div class="delete-text">
        <p>{{ $t('dialog.delete.message') }}</p>
        <p>
          <strong>{{ $t('dialog.delete.warning') }}</strong>
        </p>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="cancelAndClose" autofocus>
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
const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)

const $emit = defineEmits(['confirm'])
defineExpose({ open: (p: string) => {
  planet.value = p
  dialogRef.value?.open()
}})

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
  }
}
</style>
