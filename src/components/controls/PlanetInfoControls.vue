<template>
  <div id="planet-info" :class="{ compact: !!compactMode }">
    <div class="name-wrapper">
      <input
        v-if="editMode"
        ref="planetNameInput"
        class="lg"
        type="text"
        v-model="LG_PLANET_DATA.planetName"
        @keyup.enter="toggleEditMode"
      />
      <p v-else @click="toggleEditMode">{{ LG_PLANET_DATA.planetName }}</p>

      <button
        class="lg icon-button"
        :aria-label="$t(editMode ? 'a11y.topbar_rename_confirm' : 'a11y.topbar_rename')"
        @click="toggleEditMode"
      >
        <iconify-icon
          v-if="editMode"
          icon="mingcute:check-line"
          width="1.25rem"
          aria-hidden="true"
          :title="$t('tooltip.topbar_rename_confirm')"
        />
        <iconify-icon
          v-else
          icon="mingcute:edit-2-line"
          width="1.25rem"
          aria-hidden="true"
          :title="$t('tooltip.topbar_rename')"
        />
      </button>
    </div>
    <hr />
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_reset')"
      :title="$t('tooltip.topbar_reset')"
      @click="resetDialog?.open()"
    >
      <iconify-icon icon="tabler:reload" width="1.5rem" aria-hidden="true" />
    </button>
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_save')"
      :title="$t('tooltip.topbar_save')"
      @click="$emit('save')"
    >
      <iconify-icon icon="mingcute:save-2-line" width="1.5rem" aria-hidden="true" />
    </button>
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_gltf')"
      :title="$t('tooltip.topbar_gltf')"
      @click="$emit('gltf')"
    >
      <iconify-icon icon="simple-icons:gltf" width="1.5rem" aria-hidden="true" />
    </button>
    <AppResetConfirmDialog ref="resetDialog" @confirm="$emit('reset')" />
  </div>
</template>

<script setup lang="ts">
import AppResetConfirmDialog from '../dialogs/AppResetConfirmDialog.vue'
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import { ref, type Ref } from 'vue'
import { EventBus } from '@/core/event-bus'

const editMode: Ref<boolean> = ref(false)

const planetNameInput: Ref<HTMLInputElement | null> = ref(null)
const resetDialog: Ref<{ open: Function } | null> = ref(null)

defineProps<{ compactMode: boolean }>()
const $emit = defineEmits(['rename', 'reset', 'save', 'gltf'])

function toggleEditMode() {
  editMode.value = !editMode.value
  if (editMode.value) {
    EventBus.disableWindowEventListener('keydown')
    setTimeout(() => planetNameInput.value?.focus())
  } else {
    EventBus.enableWindowEventListener('keydown')
    $emit('rename')
  }
}
</script>

<style scoped lang="scss">
#planet-info {
  z-index: 10;
  pointer-events: all;
  height: 2.75rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  align-self: center;

  &.compact {
    justify-self: flex-end;
  }

  hr {
    height: 1.5rem;
    border-color: var(--lg-accent);
  }
  .name-wrapper {
    background: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    height: 2.75rem;
    padding: 0 0.25rem 0 0.75rem;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 24ch;
      height: 2rem;
      font-size: 0.875rem;
      font-family: Poppins, Inter;
    }
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 24ch;
    }
  }
}

@media screen and (max-width: 767px) {
  #planet-info {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-top: none;
    border-right: none;

    height: 2.5rem;
    flex: 1;

    .name-wrapper {
      flex: 1;
      font-size: 1em;
      justify-content: space-between;
      width: 100%;
      min-width: 0;
    }
    .name-wrapper > p {
      max-width: 100%;
    }
    .name-wrapper > input {
      width: 100%;
    }
  }
}
</style>
