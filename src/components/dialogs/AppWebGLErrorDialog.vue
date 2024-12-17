<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-error"
    :show-title="true"
    :closeable="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_webgl_error')"
    @close="$emit('close')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="2rem" aria-hidden="true" />
      <span>{{ $t('dialog.webglerror.$title') }}</span>
    </template>
    <template v-slot:content>
      <div class="error-info">
        <p>{{ $t('dialog.webglerror.brief') }}</p>
      </div>
      <hr class="error-divider" />
      <div ref="errorContainerRef" class="error-container"></div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DialogElement from '../elements/DialogElement.vue'
const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)
const errorContainerRef: Ref<any | null> = ref(null)

function openWithError(error: any) {
  if (error.stack) {
    error += error.stack
  }
  errorContainerRef.value?.appendChild(error)
  dialogRef.value?.open()
}

defineEmits(['close'])
defineExpose({ openWithError })
</script>
<style scoped lang="scss">
#dialog-error {
  z-index: 100;
  border: 1px solid var(--lg-warn);
  background: var(--lg-warn-panel);

  hr.error-divider {
    border: 1px solid var(--lg-text);
    margin-top: 1rem;
    opacity: 0.5;
  }
  .error-container {
    min-height: 2rem;
  }
}
:deep(.error-container > div#webglmessage) {
  font-family: unset;
  font-size: 0.875rem;
  background: transparent;
  a {
    color: var(--lg-link-error);
  }
}
</style>
