<template>
  <DialogElement ref="dialogRef"
    id="dialog-reset-confirm"
    :showTitle="true"
    :showActions="true"
    :aria-label="$t('a11y.dialog_reset')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" />
      {{ $t('dialog.reset.$title') }}
    </template>
    <template v-slot:content>
      <div class="reset-text">
        <p>{{ $t('dialog.reset.message') }}</p>
        <p><b>{{ $t('dialog.reset.warning') }}</b></p>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="dialogRef?.close()" autofocus>
        <iconify-icon icon="mingcute:close-line" width="1.25rem" />
        {{ $t('dialog.reset.$action_cancel') }}
      </button>
      <button class="lg warn" @click="$emit('confirm'); dialogRef?.close()">
        <iconify-icon icon="mingcute:delete-line" width="1.25rem" />
        {{ $t('dialog.reset.$action_confirm') }}
      </button>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '../elements/DialogElement.vue';
import { ref, type Ref } from 'vue';

const dialogRef: Ref<{ open: Function, close: Function }|null> = ref(null)
const $emit = defineEmits(['confirm'])
defineExpose({ open: () => dialogRef.value?.open() })
</script>

<style scoped lang="scss">
#dialog-reset-confirm {
  min-width: 24rem;
  .reset-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media 
screen and (max-width: 567px) {
  #dialog-reset-confirm {
    width: 100%;
  }
}
</style>