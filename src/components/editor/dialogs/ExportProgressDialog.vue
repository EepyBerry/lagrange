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
        <CollapsibleSection id="export-log" class="code" :class="_progressError ? 'warn' : ''">
          <template #title>{{ $t('dialog.export_progress.log') }}</template>
          <template #content>
            <div id="export-log-block" class="code-block">
              <pre v-for="(line, i) of _progressStepLog" :key="i">{{ line }}</pre>
            </div>
          </template>
        </CollapsibleSection>
      </div>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { ExportProgressDialogExposes } from '@components/editor/dialogs/ExportProgressDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
import CollapsibleSection from '@components/global/elements/CollapsibleSection.vue';
import LgvDialog from '@lib/components/base/LgvDialog.vue';
import { ref, type Ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
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
  _progressStepLog.value.push(
    i18n.t('dialog.export_progress.log_step', { curstep: _progressStep.value, maxstep: bakingSteps }),
  );
  if (value >= bakingSteps) {
    setDone();
  }
}

function updateProgressLog(i18nTranslationKey: string, params: Record<string, string | number>) {
  _progressStepLog.value.push(i18n.t(i18nTranslationKey, params));
}

function setDone() {
  if (_progressError.value) return;
  _progressStep.value = bakingSteps;
  _progressStepLog.value.push(i18n.t('dialog.export_progress.log_complete'));
}

function setError(value: Error | string | unknown) {
  if (value instanceof Error) {
    _progressError.value = value + '\n';
    if (value.stack) {
      _progressStepLog.value.push(
        ...value.stack
          .replaceAll('\n', '¤')
          .split('¤')
          .filter((d) => d.length > 0),
      );
    }
  } else if (typeof value === 'string') {
    _progressError.value = value;
    _progressStepLog.value.push(value);
  } else {
    _progressError.value = value;
    _progressStepLog.value.push(value + '');
  }
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
