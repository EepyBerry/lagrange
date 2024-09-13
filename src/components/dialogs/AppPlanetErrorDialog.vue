<template>
  <DialogElement
    ref="dialogRef"
    id="dialog-error"
    :show-title="true"
    :prevent-click-close="true"
    :aria-label="$t('a11y.dialog_planet_error')"
    @close="$emit('close')"
  >
    <template v-slot:title>
      <iconify-icon icon="mingcute:warning-line" width="2rem" aria-hidden="true" />
      <span>{{ $t('dialog.planeterror.$title') }}</span>
    </template>
    <template v-slot:content>
      <div class="error-info">
        <p>{{ $t('dialog.planeterror.brief') }}</p>
        <p>
          <b>{{ $t('dialog.planeterror.reporting') }}</b>
        </p>
      </div>
      <hr class="error-divider" />
      <p class="error-container">{{ _error }}</p>
      <CollapsibleSection v-show="false" class="warn">
        <template v-slot:title>Stacktrace</template>
        <template v-slot:content>
          <p class="stack-line" v-for="(line, i) of _stack" :key="i">{{ line }}</p>
        </template>
      </CollapsibleSection>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import { ref, type Ref } from 'vue'
import DialogElement from '../elements/DialogElement.vue'
import CollapsibleSection from '../elements/CollapsibleSection.vue'
const dialogRef: Ref<{ open: Function; close: Function } | null> = ref(null)

const _error: Ref<string> = ref('')
const _stack: Ref<string[]> = ref([])

function openWithError(error: string, stack: string) {
  _error.value = error
  if (stack) {
    _stack.value.push(...stack.replaceAll('\n', ' ').split(' '))
  }
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
    padding: 1rem;
  }
  .stack-line {
    margin-bottom: 4px;
  }
}
</style>
