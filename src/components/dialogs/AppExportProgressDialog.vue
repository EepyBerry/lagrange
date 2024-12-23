<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-exportprogress"
    :show-title="true"
    :closeable="false"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_export_progress')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:sandglass-line" width="2rem" aria-hidden="true" />
      <span>{{ $t('dialog.export_progress.$title') }}</span>
    </template>
    <template v-slot:content>
      <div class="progress-text">
        <p>{{ $t('dialog.export_progress.step_'+_progressStep) }}</p>
        <p>{{ _progressStep }}/{{ bakingSteps }}</p>
      </div>
      <div class="progress-bar">
        <span class="progress" :style="{ width: `${(_progressStep*100)/bakingSteps}%` }"></span>
      </div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DialogElement from '../elements/DialogElement.vue'
const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)

const bakingSteps = 8
const _progressStep: Ref<number> = ref(1)

function open() { 
  dialogRef.value?.open()
}
function setProgress(value: number) {
  _progressStep.value = value
  if (value === bakingSteps) {
    setTimeout(dialogRef.value!.close, 1000)
  }
}

defineEmits(['close'])
defineExpose({ open, setProgress })
</script>
<style scoped lang="scss">
#dialog-exportprogress {
  z-index: 100;
  min-width: 24rem;

  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .progress-bar {
    position: relative;
    width: 100%;
    height: 1rem;
    border: 1px solid var(--lg-accent);
    border-radius: 4px;

    .progress {
      position: absolute;
      left: 0;
      height: 100%;
      background: var(--lg-contrast-focus);
    }
  }
}
</style>
