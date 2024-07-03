<template>
  <div id="planet-info">
    <div class="name-wrapper">
      <input v-if="editMode" class="lg" type="text" v-model="LG_PARAMETERS.planetName">
      <p v-else>{{ LG_PARAMETERS.planetName }}</p>
      <button class="lg icon-button" aria-label="Edit planet name">
        <iconify-icon v-if="editMode"
          icon="mingcute:check-line"
          width="1.25rem"
          aria-hidden="true"
          @click="toggleEditMode"
        />
        <iconify-icon v-else
          icon="mingcute:edit-2-line"
          width="1.25rem"
          aria-hidden="true"
          @click="toggleEditMode"
        />
      </button>
    </div>
    <hr>
    <button class="lg dark" aria-label="Reset planet" @click="resetPlanet">
      <iconify-icon icon="tabler:reload" width="1.5rem" aria-hidden="true" />
    </button>
    <hr>
    <input ref="fileInput" type="file" @change="importPlanetFile" hidden>
    <button class="lg dark" aria-label="Import planet data" @click="openFileDialog">
      <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" />
    </button>
    <button class="lg dark" aria-label="Export planet data" @click="exportPlanetFile">
      <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@core/globals'
import pako from 'pako';
import { saveAs } from 'file-saver';
import { ref, type Ref } from 'vue';

const fileInput: Ref<HTMLInputElement | null> = ref(null)
const editMode: Ref<boolean> = ref(false)
const $emit = defineEmits(['dataLoad'])

function toggleEditMode()  {
  editMode.value = !editMode.value
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
  reader.onload = e => {
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
  const planetFilename = (LG_PARAMETERS.planetName?.replace(/\s/g, '_')) ?? 'Planet'
  saveAs(new Blob([gzipParams]), `${planetFilename}.lagrange`)
}

function resetPlanet() {
  LG_PARAMETERS.reset()
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
    background-color: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    height: 2.875rem;
    padding: 0 0.25rem 0 0.75rem;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      width: 32ch;
    }
    p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 32ch;
    }
  }
}

@media screen and (max-width:1199px) {
  #planet-info {
    margin-top: 0.5rem;
  }
}
@media screen and (max-width:767px) {
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
    }
    .name-wrapper > input {
      width: 100%;
    }
  }
}
@media screen and (max-width:567px) {
  #planet-info {
    .name-wrapper > p {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 20ch;
    }
  }
}
</style>