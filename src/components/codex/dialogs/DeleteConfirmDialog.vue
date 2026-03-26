<template>
  <DialogElement
    id="dialog-delete-confirm"
    ref="dialogRef"
    :show-title="true"
    :show-actions="true"
    :closeable="true"
    :aria-label="$t('a11y.dialog_delete')"
  >
    <template #title>
      <iconify-icon icon="mingcute:warning-line" width="1.5rem" aria-hidden="true" />
      {{ $t('dialog.delete.$title', { planet: planet?.data.planetName ?? 'PLANET_NAME' }) }}
    </template>
    <template #content>
      <div class="delete-text">
        <p>{{ $t('dialog.delete.message') }}</p>
        <p>
          <strong>{{ $t('dialog.delete.warning') }}</strong>
        </p>
      </div>
    </template>
    <template #actions>
      <LgvButton icon="mingcute:close-line" @click="cancelAndClose">
        {{ $t('dialog.delete.$action_cancel') }}
      </LgvButton>
      <LgvButton class="warn" icon="mingcute:delete-2-line" @click="confirmAndClose">
        {{ $t('dialog.delete.$action_confirm') }}
      </LgvButton>
    </template>
  </DialogElement>
</template>
<script setup lang="ts">
import DialogElement from '@components/global/elements/DialogElement.vue';
import { ref, type Ref } from 'vue';
import type { IDBPlanet } from '@/dexie.config';
import LgvButton from '@/_lib/components/LgvButton.vue';

const planet: Ref<IDBPlanet | null> = ref(null);
const dialogRef: Ref<{ open: () => void; close: () => void } | null> = ref(null);

const $emit = defineEmits(['confirm']);
defineExpose({
  open: (p: IDBPlanet) => {
    planet.value = p;
    dialogRef.value?.open();
  },
});

function cancelAndClose() {
  planet.value = null;
  dialogRef.value?.close();
}

function confirmAndClose() {
  $emit('confirm', planet.value!.id);
  planet.value = null;
  dialogRef.value?.close();
}
</script>

<style scoped lang="scss">
#dialog-delete-confirm {
  min-width: 24rem;
  .delete-text {
    text-align: center;
    font-size: 1rem;
  }
}
@media screen and (max-width: 567px) {
  #dialog-delete-confirm {
    width: 100%;
    min-width: 0;
  }
}
</style>
