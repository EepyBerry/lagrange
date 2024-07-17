<template>
  <div id="planet-info">
    <div class="name-wrapper">
      <input v-if="editMode" class="lg" type="text" v-model="LG_PARAMETERS.planetName" />
      <p v-else>{{ LG_PARAMETERS.planetName }}</p>
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
          :title="$t('tooltips.topbar_rename_confirm')"
        />
        <iconify-icon
          v-else
          icon="mingcute:edit-2-line"
          width="1.25rem"
          aria-hidden="true"
          :title="$t('tooltips.topbar_rename')"
        />
      </button>
    </div>
    <hr />
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_reset')"
      :title="$t('tooltips.topbar_reset')"
      @click="resetDialog?.open()"
    >
      <iconify-icon icon="tabler:reload" width="1.5rem" aria-hidden="true" />
    </button>
    <hr />
    <input ref="fileInput" type="file" @change="importPlanetFile" hidden />
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_import')"
      :title="$t('tooltips.topbar_import')"
      @click="openFileDialog"
    >
      <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" />
    </button>
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_export')"
      :title="$t('tooltips.topbar_export')"
      @click="exportPlanetFile"
    >
      <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
    </button>
    <AppResetConfirmDialog ref="resetDialog" @confirm="resetPlanet" />
  </div>
</template>

<script setup lang="ts">
import AppResetConfirmDialog from '../dialogs/AppResetConfirmDialog.vue'
import { LG_PARAMETERS } from '@core/globals'
import pako from 'pako'
import { saveAs } from 'file-saver'
import { ref, type Ref } from 'vue'
import { EventBus } from '@core/window-event-bus'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()

const resetDialog: Ref<{ open: Function } | null> = ref(null)
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const editMode: Ref<boolean> = ref(false)
const $emit = defineEmits(['dataLoad'])

function toggleEditMode() {
  editMode.value = !editMode.value
  if (editMode.value) {
    EventBus.disableWindowEventListener('keydown')
  } else {
    EventBus.enableWindowEventListener('keydown')
  }
}

function openFileDialog() {
  fileInput.value?.click()
}

function importPlanetFile(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files?.length !== 1) {
    console.warn('only one file cane be loaded at a time!')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(pako.inflate(e.target?.result as ArrayBuffer, { to: 'string' }))
      LG_PARAMETERS.loadData(data)
      $emit('dataLoad')
    } catch (err) {
      console.error(err)
    }
  }
  reader.readAsArrayBuffer(files[0])
}

function exportPlanetFile() {
  const jsonParams = JSON.stringify(LG_PARAMETERS)
  const gzipParams = pako.deflate(jsonParams)
  const planetFilename = LG_PARAMETERS.planetName?.replace(/\s/g, '_') ?? 'Planet'
  saveAs(new Blob([gzipParams]), `${planetFilename}.lagrange`)
}

function resetPlanet() {
  LG_PARAMETERS.reset()
  LG_PARAMETERS.planetName = i18n.t('editor.default_planet_name')
  $emit('dataLoad')
}
</script>

<style scoped lang="scss">
#planet-info {
  pointer-events: all;
  position: absolute;
  inset: 0 0 auto;
  height: 2.875rem;
  margin-top: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  align-self: center;

  hr {
    height: 50%;
    border-color: var(--lg-accent);
  }
  .name-wrapper {
    background: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    height: 2.875rem;
    padding: 0 0.25rem 0 0.75rem;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 24ch;
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

@media screen and (max-width: 1199px) {
  #planet-info {
    margin-top: 0.5rem;
  }
}
@media screen and (max-width: 767px) {
  #planet-info {
    width: 100%;
    border-radius: 0;
    border-left: none;
    border-top: none;
    border-right: none;

    height: 2.875rem;
    padding: 0 0.25rem 0 0.5rem;
    margin-top: 0.5rem;

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
