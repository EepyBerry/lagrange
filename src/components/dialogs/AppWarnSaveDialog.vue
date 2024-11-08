<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-warn-save"
    :showTitle="true"
    :showActions="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_warn_save')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.warnsave.$title') }}
    </template>
    <template v-slot:content>
      <div class="warn-text">
        <p>{{ $t('dialog.warnsave.message') }}</p>
        <p>
          <b>{{ $t('dialog.warnsave.warning') }}</b>
        </p>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="dialogRef?.close()" autofocus>
        <iconify-icon icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.warnsave.$action_cancel') }}
      </button>
      <button class="lg success" @click="saveConfirmClose" autofocus>
        <iconify-icon icon="mingcute:save-2-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.warnsave.$action_saveconfirm') }}
      </button>
      <button class="lg warn" @click="confirmAndClose">
        <iconify-icon icon="mingcute:exit-line" width="1.25rem" aria-hidden="true" />
        {{ $t('dialog.warnsave.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '../elements/DialogElement.vue'
import { ref, type Ref } from 'vue'

const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)
const $emit = defineEmits(['save-confirm', 'confirm'])
defineExpose({ open: () => dialogRef.value?.open() })

function saveConfirmClose() {
  $emit('save-confirm')
  dialogRef.value?.close()
}

function confirmAndClose() {
  $emit('confirm')
  dialogRef.value?.close()
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
