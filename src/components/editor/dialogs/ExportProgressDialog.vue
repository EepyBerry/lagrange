<template>
  <LgvDialog
    id="dialog-exportprogress"
    ref="dialogRef"
    :show-title="true"
    :closeable="!!_progressError || _progressStep === bakingSteps"
    :is-warn="!!_progressError"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_export_progress')"
    :class="{ warn: !!_progressError }"
  >
    <template #title>
      <iconify-icon
        :class="_progressError ? 'warn' : 'contrast'"
        icon="mingcute:sandglass-line"
        width="1.5rem"
        aria-hidden="true"
      />
      <span v-if="_dialogMode === 'textures'">{{ $t('dialog.export_progress.$title_textures') }}</span>
      <span v-else-if="_dialogMode === 'gltf'">{{ $t('dialog.export_progress.$title_gltf') }}</span>
    </template>
    <template #content>
      <div id="export-text">
        <section>
          <div id="progress-text">
            <p>{{ $t('dialog.export_progress.step_' + _progressStep) }}</p>
            <p v-if="!!_progressError">{{ $t('dialog.export_progress.step_failed') }}</p>
            <p v-else>{{ _progressStep }}/{{ bakingSteps }}</p>
          </div>
          <div id="progress-bar">
            <span id="progress" :style="{ width: `${(_progressStep * 100) / bakingSteps}%` }"></span>
          </div>
          <div v-if="_progressError" id="progress-error">
            <p>{{ _progressError }}</p>
          </div>
        </section>
        <LgvCollapsibleSection id="export-log" class="code" :class="{ warn: !!_progressError }">
          <template #title>{{ $t('dialog.export_progress.log') }}</template>
          <template #content>
            <LgvLogBlock ref="exportLogBlockRef" id="export-log-block" :class="{ warn: !!_progressError }" />
          </template>
        </LgvCollapsibleSection>
      </div>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { ExportProgressDialogExposes } from '@components/editor/dialogs/ExportProgressDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
import type { LgvLogBlockExposes, LogEventTypeMap, LogLevel } from '@lib/components/custom/LgvLogBlock.types.ts';
import { getLogMessage, LogMessage } from '@core/messages.ts';
import LgvDialog from '@lib/components/base/LgvDialog.vue';
import LgvLogBlock from '@lib/components/custom/LgvLogBlock.vue';
import LgvCollapsibleSection from '@lib/components/layout/LgvCollapsibleSection.vue';
import { ref, type Ref, useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
const exportLogBlockRef = useTemplateRef<LgvLogBlockExposes>('exportLogBlockRef');
defineExpose<ExportProgressDialogExposes>({ open, setProgress, updateProgressLog, setDone, setError });

const bakingSteps = 9;
const _dialogMode: Ref<'textures' | 'gltf'> = ref('textures');
const _progressStep: Ref<number> = ref(1);
const _progressStepLog: Ref<string[]> = ref([]);
const _progressError: Ref<unknown> = ref(undefined);

function open(mode: 'textures' | 'gltf') {
  dialogRef.value?.open();
  _dialogMode.value = mode;
  _progressError.value = undefined;
  _progressStepLog.value.splice(0);
  setProgress(1);
}

function setProgress(value: number) {
  if (_progressError.value) return;
  _progressStep.value = value;
  updateProgressLog('info', {
    message: getLogMessage(LogMessage.BakingStep, { curstep: _progressStep.value, maxstep: bakingSteps }),
  });
  if (value >= bakingSteps) {
    setDone();
  }
}

function updateProgressLog<L extends LogLevel>(level: L, params: LogEventTypeMap[L]) {
  exportLogBlockRef.value!.log(level, params);
}

function setDone() {
  if (_progressError.value) return;
  _progressStep.value = bakingSteps;
  updateProgressLog('success', { message: getLogMessage(LogMessage.BakingComplete) });
}

function setError(value: Error | string) {
  _progressError.value = value;
  updateProgressLog('error', { error: value });
}
</script>
<style scoped lang="scss">
#dialog-exportprogress {
  z-index: 100;
  width: 36rem;

  #export-text {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  #progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  #progress-bar {
    position: relative;
    width: 100%;
    height: 1rem;
    border: 1px solid var(--lg-accent);
    border-radius: 2px;

    #progress {
      position: absolute;
      left: 0;
      height: 100%;
      background: var(--lg-input-contrast-focus);
    }
  }
  #export-log {
    $clip-length: 0.75rem;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - $clip-length), calc(100% - $clip-length) 100%, 0 100%);

    #export-log-block {
      max-height: 300px;
      overflow-y: auto;
    }
  }
}
#dialog-exportprogress.warn {
  #progress-bar {
    border: 1px solid var(--lg-warn-active);
    border-radius: 2px;
    #progress {
      background: var(--lg-warn);
    }
  }
}
</style>
