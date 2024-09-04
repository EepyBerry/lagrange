<template>
  <span id="codex-background"></span>
  <div id="codex-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <div id="codex-header-controls">
      <RouterLink class="lg dark create-planet" to="/planet-editor/new" :title="$t('codex.$action_add')">
        <iconify-icon icon="mingcute:add-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_add') }}
      </RouterLink>
      <hr />
      <input ref="fileInput" type="file" @change="importPlanetFile" accept=".lagrange" multiple hidden />
      <button
        class="lg dark"
        :aria-label="$t('a11y.topbar_import')"
        :title="$t('tooltip.topbar_import')"
        @click="openFileDialog"
      >
        <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" />
      </button>
      <button
        class="lg dark"
        :aria-label="$t('a11y.topbar_export_all')"
        :title="$t('tooltip.topbar_export_all')"
        @click="exportPlanets"
      >
        <iconify-icon icon="mingcute:folder-zip-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </div>
  <div v-if="planets.length > 0" id="codex-grid">
    <PlanetCardElement
      v-for="planet of planets"
      :key="planet.id"
      :planet="planet"
      @export="exportPlanet(planet)"
      @delete="openDeleteConfirmDialog(planet)"
    />
    <NewCardElement />
  </div>
  <div v-else id="codex-grid" class="empty">
    <iconify-icon icon="ph:planet-thin" width="16rem" />
    <span>{{ $t('codex.no_planets') }}</span>
  </div>
  <div v-if="showInlineFooter" id="codex-footer">
    <InlineFooter />
  </div>
  <AppDeleteConfirmDialog ref="deleteDialogRef" @confirm="deleteTargetedPlanet" />
</template>

<script setup lang="ts">
import PlanetCardElement from '@/components/elements/PlanetCardElement.vue'
import AppNavigation from '@/components/main/AppNavigation.vue'
import InlineFooter from '@/components/main/InlineFooter.vue'
import AppDeleteConfirmDialog from '@components/dialogs/AppDeleteConfirmDialog.vue'
import { idb, type IDBPlanet } from '@/dexie.config'
import { useHead } from '@unhead/vue'
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { EventBus } from '@/core/event-bus'
import { MD_WIDTH_THRESHOLD, SM_WIDTH_THRESHOLD } from '@/core/globals'
import pako from 'pako'
import { saveAs } from 'file-saver'
import PlanetData from '@/core/models/planet-data.model'
import JSZip from 'jszip'
import NewCardElement from '@/components/elements/NewCardElement.vue'
import { readFileData } from '@/core/import.helper'

const i18n = useI18n()
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const planets: Ref<IDBPlanet[]> = ref([])

const deleteTarget: Ref<IDBPlanet | null> = ref(null)
const deleteDialogRef: Ref<{ open: Function } | null> = ref(null)
const showCompactNavigation: Ref<boolean> = ref(false)
const showInlineFooter: Ref<boolean> = ref(false)

useHead({
  title: i18n.t('codex.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

onMounted(async () => {
  computeResponsiveness()
  await loadPlanets()
  EventBus.registerWindowEventListener('resize', onWindowResize)
})
onUnmounted(() => {
  EventBus.deregisterWindowEventListener('resize', onWindowResize)
})
watch(
  () => EventBus.clearEvent.value,
  async () => await loadPlanets(),
)

async function loadPlanets() {
  const idbPlanets = await idb.planets.orderBy('data._planetName').toArray()
  planets.value = idbPlanets.map((pl) => ({ ...pl, data: PlanetData.createFrom(pl.data) }))
}

// ------------------------------------------------------------------------------------------------

function onWindowResize() {
  computeResponsiveness()
}

function computeResponsiveness() {
  showCompactNavigation.value = window.innerWidth < MD_WIDTH_THRESHOLD
  showInlineFooter.value = window.innerWidth < SM_WIDTH_THRESHOLD
}

// ------------------------------------------------------------------------------------------------

function openFileDialog() {
  fileInput.value?.click()
}

async function importPlanetFile(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files?.length === 0) {
    console.warn('At least one file should be specified!')
    return
  }

  const readPromises = Array.from(files).map((f) => {
    const reader = new FileReader()
    return new Promise<IDBPlanet>((resolve, reject) => {
      reader.onload = async (e) => {
        const data = readFileData(e.target?.result as ArrayBuffer)
        if (data) {
          resolve(data)
        } else {
          reject()
        }
      }
      reader.readAsArrayBuffer(f)
    })
  })

  try {
    const newPlanets: PromiseSettledResult<IDBPlanet>[] = await Promise.allSettled(readPromises)
    const rejectedFiles = newPlanets.filter((p) => p.status === 'rejected')
    if (rejectedFiles.length === newPlanets.length) {
      EventBus.sendToastEvent('warn', 'toast.import_failure', 3000)
      return
    }

    const allAdded = await idb.planets.bulkPut(
      newPlanets
        .filter((np) => np.status === 'fulfilled')
        .map((np: PromiseSettledResult<IDBPlanet>) => (np as PromiseFulfilledResult<IDBPlanet>).value)
        .map((np) => ({ ...np, version: np.version ?? '1' })),
    )
    if (allAdded && rejectedFiles.length === 0) {
      EventBus.sendToastEvent('success', 'toast.import_success', 3000)
    } else {
      EventBus.sendToastEvent('warn', 'toast.import_partial', 3000)
    }
  } catch (_) {
    EventBus.sendToastEvent('warn', 'toast.import_partial', 3000)
  } finally {
    await loadPlanets()
    fileInput.value!.value = ''
  }
}

async function exportPlanets() {
  const idbZip = new JSZip()
  for (const planet of planets.value) {
    const json = JSON.stringify(planet)
    const deflated = pako.deflate(json)
    const planetFilename = planet.data.planetName.replaceAll(' ', '_') + '.lagrange'
    idbZip.file(planetFilename, deflated)
  }
  const generatedZip = await idbZip.generateAsync({ type: 'blob' })
  saveAs(generatedZip, `lagrange-${import.meta.env.APP_VERSION}-planets-${new Date().toISOString()}.zip`)
}

function exportPlanet(planet: IDBPlanet) {
  planet.data.changedProps.splice(0)
  const jsonParams = JSON.stringify(planet)
  const gzipParams = pako.deflate(jsonParams)
  const planetFilename = planet.data.planetName.replaceAll(' ', '_')
  saveAs(new Blob([gzipParams]), `${planetFilename}.lagrange`)
}

async function openDeleteConfirmDialog(planet: IDBPlanet) {
  deleteTarget.value = planet
  deleteDialogRef.value?.open(deleteTarget.value.data.planetName)
}

async function deleteTargetedPlanet() {
  try {
    await idb.planets.delete(deleteTarget.value!.id)
    EventBus.sendToastEvent('success', 'toast.delete_success', 3000)
  } catch (_) {
    EventBus.sendToastEvent('warn', 'toast.delete_failure', 3000)
  } finally {
    await loadPlanets()
  }
}
</script>

<style scoped lang="scss">
#codex-background {
  z-index: -1;
  position: fixed;
  inset: 0;
  background-image: url('/background/space-1920w.jpg');
  background-size: 50%;
  background-position: center;
  background-repeat: repeat;
}
#codex-header {
  z-index: 15;
  position: fixed;
  backdrop-filter: blur(8px) brightness(50%);
  inset: 0 0 auto 0;

  inset: auto 1rem;
  padding: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  #codex-header-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &.compact {
    justify-content: space-between;
  }

  a.create-planet {
    height: 2.75rem;
    padding: 0.5rem 1rem;
    background: var(--lg-primary);
    border: 1px solid var(--lg-accent);
    border-radius: 4px;
    text-decoration: none;
  }
  a.create-planet:hover {
    background: var(--lg-button-active);
  }
  hr {
    height: 1.5rem;
  }
}
#codex-grid {
  flex: 1;
  padding-bottom: 3.75rem;
  margin: 4.75rem 1rem 1rem;
  height: calc(100% - 4.75rem);
  border-radius: 4px;

  display: grid;
  grid-template-rows: repeat(auto-fill, 26rem);
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;

  &.empty {
    font-style: italic;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    span {
      padding: 0 1rem;
      padding-bottom: 4.75rem;
    }
  }
}
#codex-footer {
  display: inline-flex;
  padding: 0 1rem 1rem;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

@media screen and (max-width: 1199px) {
  #codex-background {
    background-image: url('/background/space-960w.jpg');
  }
  #codex-header {
    inset: auto 0;
    padding: 0.5rem;
    :deep(aside) {
      left: 3.875rem;
    }
    #codex-header-controls {
      justify-content: flex-end;
    }
  }
  #codex-grid {
    padding-bottom: 3.25rem;
    margin: 3.75rem 0.5rem 0.5rem;
  }
}
@media screen and (max-width: 767px) {
  #codex-header {
    :deep(aside) {
      left: unset;
      top: 3.75rem;
    }
  }
  #codex-background {
    background-image: url('/background/space-540w.jpg');
  }
  #codex-grid {
    margin: 3.75rem 0.5rem 0;
    padding-bottom: 0.5rem;
  }
  #codex-footer {
    padding: 0 0.5rem 0.5rem;
  }
}
</style>
