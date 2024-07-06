<template>
  <DialogElement ref="dialogRef" id="dialog-reset-confirm" :showTitle="true" :showActions="true">
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" /> Confirm reset
    </template>
    <template v-slot:content>
      <div class="reset-text">
        <p>Discard the current planet?</p>
        <p><b>All unsaved data will be lost!</b></p>
      </div>
    </template>
    <template v-slot:actions>
      <button class="lg" @click="dialogRef?.close()" autofocus>
        Cancel
      </button>
      <button class="lg warn" @click="$emit('confirm'); dialogRef?.close()">
        Confirm
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