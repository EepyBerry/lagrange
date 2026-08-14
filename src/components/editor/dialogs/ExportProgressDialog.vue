<template>
  <DialogElement
    id="dialog-exportprogress"
    ref="dialogRef"
    :show-title="true"
    :closeable="!!_progressError"
    :is-warn="!!_progressError"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_export_progress')"
    :class="{ warn: !!_progressError }"
  >
    <template #title>
      <iconify-icon icon="mingcute:sandglass-line" width="2rem" aria-hidden="true" />
      <span v-if="_dialogMode === 'textures'">{{ $t('dialog.export_progress.$title_textures') }}</span>
      <span v-else-if="_dialogMode === 'gltf'">{{ $t('dialog.export_progress.$title_gltf') }}</span>
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
import type { ExportProgressDialogExposes } from '@components/editor/dialogs/ExportProgressDialog.types.ts';
import type { DialogElementExposes } from '@components/global/elements/DialogElement.types.ts';
import DialogElement from '@components/global/elements/DialogElement.vue';
import { ref, type Ref, useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef');
defineExpose<ExportProgressDialogExposes>({ open, setProgress, setDone, setError });

const bakingSteps = 9;
const _dialogMode: Ref<'textures' | 'gltf'> = ref('textures');
const _progressStep: Ref<number> = ref(1);
const _progressError: Ref<unknown> = ref(undefined);

function open(mode: 'textures' | 'gltf') {
  dialogRef.value?.open();
  _dialogMode.value = mode;
  _progressError.value = undefined;
  setProgress(1);
}

function setProgress(value: number) {
  if (_progressError.value) return;
  _progressStep.value = value;
  if (value >= bakingSteps) {
    setDone();
  }
}

function setDone() {
  if (_progressError.value) return;
  _progressStep.value = bakingSteps;
  setTimeout(dialogRef.value!.close, 1000);
}

function setError(value: unknown) {
  if (value instanceof Error) {
    _progressError.value = value + '\n';
  } else {
    _progressError.value = value;
  }
}
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
    border-radius: 2px;

    .progress {
      position: absolute;
      left: 0;
      height: 100%;
      background: var(--lg-input-contrast-focus);
    }
  }
}
#dialog-exportprogress.warn {
  .progress-bar {
    border: 1px solid var(--lg-warn-active);
    border-radius: 2px;
    .progress {
      background: var(--lg-warn);
    }
  }
}
</style>
