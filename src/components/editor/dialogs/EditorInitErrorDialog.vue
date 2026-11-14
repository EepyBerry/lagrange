<template>
  <LgvDialog
    id="dialog-editorerror"
    ref="dialogRef"
    :is-warn="true"
    :closeable="true"
    :prevent-click-close="true"
    :show-title="true"
    :show-actions="allowRendererFallback"
    :aria-label="$t('a11y.dialog_editor_error')"
    @close="$emit('close', _wantsFallback)"
  >
    <template #title>
      <iconify-icon class="warn" icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      <span>{{ $t('dialog.editor_error.$title') }}</span>
    </template>
    <template #content>
      <div id="editor-error-message">
        <div class="error-info">
          <p>{{ $t('dialog.editor_error.brief') }}</p>
          <p>
            <b>{{ $t('dialog.editor_error.reporting') }}</b>
          </p>
        </div>
        <hr class="error-divider" />
        <p class="error-container">{{ _error }}</p>
      </div>
      <LgvCollapsibleSection v-show="!!_error" class="warn">
        <template #title>{{ $t('common.error.stacktrace') }}</template>
        <template #content>
          <LgvLogBlock ref="errorLogBlockRef" id="error-log-block" class="warn" :show-glyphs="false" />
        </template>
      </LgvCollapsibleSection>
    </template>
    <template #actions>
      <LgvButton v-if="allowRendererFallback" class="warn" icon="tabler:reload" @click="closeWithFallback">
        {{ $t('dialog.editor_error.$action_reload_fallback_renderer') }}
      </LgvButton>
    </template>
  </LgvDialog>
</template>
<script setup lang="ts">
import type { EditorInitErrorDialogExposes } from '@components/editor/dialogs/EditorInitErrorDialog.types.ts';
import type { LgvDialogExposes } from '@lib/components/base/LgvDialog.types.ts';
import type { LgvLogBlockExposes } from '@lib/components/custom/LgvLogBlock.types.ts';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvDialog from '@lib/components/base/LgvDialog.vue';
import LgvLogBlock from '@lib/components/custom/LgvLogBlock.vue';
import LgvCollapsibleSection from '@lib/components/layout/LgvCollapsibleSection.vue';
import { ref, type Ref, useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<LgvDialogExposes>('dialogRef');
const errorLogBlockRef = useTemplateRef<LgvLogBlockExposes>('errorLogBlockRef');
const $emit = defineEmits(['close']);
defineExpose<EditorInitErrorDialogExposes>({ open: openWithError });

const _error: Ref<string> = ref('');
const _wantsFallback: Ref<boolean> = ref(false);
const allowRendererFallback: Ref<boolean> = ref(false);

function openWithError(error: Error | string, isWebGPUError: boolean = false) {
  _error.value = error instanceof Error ? error.message : error;
  allowRendererFallback.value = isWebGPUError;
  errorLogBlockRef.value!.log('error', { error });
  dialogRef.value?.open();
}

async function closeWithFallback() {
  _wantsFallback.value = true;
  dialogRef.value!.close();
}

function onClose() {
  $emit('close', _wantsFallback);
}
</script>
<style scoped lang="scss">
#dialog-editorerror {
  z-index: 10;
  max-width: 48rem;

  #editor-error-message {
    padding: 1rem 0.5rem;
  }
  hr.error-divider {
    border: 1px solid var(--lg-warn);
    margin: 1rem 0;
  }
  .error-info {
    text-align: center;
  }
  .error-container {
    text-align: center;
    font-family: monospace;
  }
}
</style>
