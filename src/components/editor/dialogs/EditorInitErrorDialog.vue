<template>
  <DialogElement
    id="dialog-editorerror"
    ref="dialogRef"
    class="warn"
    show-title
    :show-actions="allowRendererFallback"
    closeable
    prevent-click-close
    is-warn
    :aria-label="$t('a11y.dialog_editor_error')"
    @close="$emit('close', _wantsFallback)"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="2rem" aria-hidden="true" />
      <span>{{ $t('dialog.editorerror.$title') }}</span>
    </template>
    <template #content>
      <div class="error-info">
        <p>{{ $t('dialog.editorerror.brief') }}</p>
        <p>
          <b>{{ $t('dialog.editorerror.reporting') }}</b>
        </p>
      </div>
      <hr class="error-divider" />
      <p class="error-container">{{ _error }}</p>
      <CollapsibleSection v-show="_stack.length > 0" class="warn code">
        <template #title>{{ $t('main.error.stacktrace') }}</template>
        <template #content>
          <div class="code-block">
            <pre v-for="(line, i) of _stack" :key="i">{{ line }}</pre>
          </div>
        </template>
      </CollapsibleSection>
    </template>
    <template #actions>
      <LgvButton v-if="allowRendererFallback" class="warn" icon="tabler:reload" @click="closeWithFallback">
        {{ $t('dialog.editorerror.$action_reload_fallback_renderer') }}
      </LgvButton>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import CollapsibleSection from '@components/global/elements/CollapsibleSection.vue';
import DialogElement from '@components/global/elements/DialogElement.vue';
import { ref, type Ref, useTemplateRef } from 'vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import type { DialogElementExposes } from "@components/global/elements/DialogElement.types.ts";
import type { EditorInitErrorDialogExposes } from "@components/editor/dialogs/EditorInitErrorDialog.types.ts";

const dialogRef = useTemplateRef<DialogElementExposes>('dialogRef')
defineExpose<EditorInitErrorDialogExposes>({ open: openWithError });

const _error: Ref<string> = ref('');
const _stack: Ref<string[]> = ref([]);
const _wantsFallback: Ref<boolean> = ref(false);
const allowRendererFallback: Ref<boolean> = ref(false);

function openWithError(error: string, stack?: string, isWebGPUError: boolean = false) {
  _error.value = error;
  allowRendererFallback.value = isWebGPUError;
  if (stack) {
    _stack.value.push(
      ...stack
        .replaceAll('\n', '¤')
        .split('¤')
        .filter((d) => d.length > 0),
    );
  }
  dialogRef.value?.open();
}

async function closeWithFallback() {
  _wantsFallback.value = true;
  dialogRef.value!.close();
}

</script>
<style scoped lang="scss">
#dialog-editorerror {
  z-index: 10;
  max-width: 48rem;

  hr.error-divider {
    border: 1px solid var(--lg-text);
    margin-top: 1rem;
    opacity: 0.5;
  }
  .error-info {
    text-align: center;
  }
  .error-container {
    min-height: 2rem;
    text-align: center;
    font-family: monospace;
    padding: 1rem;
  }
}
</style>
