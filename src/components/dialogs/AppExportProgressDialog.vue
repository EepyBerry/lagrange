<template>
  <DialogElement
    id="dialog-exportprogress" 
    ref="dialogRef"
    :show-title="true"
    :closeable="!!_progressError"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_export_progress')"
    :class="{ failure: !!_progressError }"
  >
    <template #title>
      <iconify-icon icon="mingcute:sandglass-line" width="2rem" aria-hidden="true" />
      <span>{{ $t('dialog.export_progress.$title') }}</span>
    </template>
    <template #content>
      <div class="progress-text">
        <p>{{ $t('dialog.export_progress.step_' + _progressStep) }}</p>
        <p v-if="!!_progressError">{{ $t('dialog.export_progress.step_failed') }}</p>
        <p v-else>{{ _progressStep }}/{{ bakingSteps }}</p>
      </div>
      <div class="progress-bar">
        <span class="progress" :style="{ width: `${(_progressStep * 100) / bakingSteps}%` }"></span>
      </div>
      <div v-if="_progressError" class="progress-error">
        <p>{{ _progressError }}</p>
      </div>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DialogElement from '../elements/DialogElement.vue'
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null)

const bakingSteps = 8
const _progressStep: Ref<number> = ref(1)
const _progressError: Ref<unknown> = ref(undefined)

function open() {
  dialogRef.value?.open()
}
function setProgress(value: number) {
  _progressStep.value = value
  if (value === bakingSteps) {
    setTimeout(dialogRef.value!.close, 1000)
  }
}
function setError(value: unknown) {
  if (value instanceof Error) {
    _progressError.value = value + '\n'
  } else {
    _progressError.value = value
  }
}

defineEmits(['close'])
defineExpose({ open, setProgress, setError })
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
#dialog-exportprogress.failure {
  border: 1px solid var(--lg-warn);
  background: var(--lg-warn-panel);
  .progress-bar {
    border: 1px solid var(--lg-warn-active);
    border-radius: 4px;
    .progress {
      background: var(--lg-warn);
    }
  }
}
</style>
