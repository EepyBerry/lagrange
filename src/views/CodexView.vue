<template>
  <span id="codex-background"></span>
  <ViewHeader id="codex-header">
    <!-- file input -->
    <input ref="fileInput" type="file" accept=".lagrange" multiple hidden @change="importPlanetFile" />
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_import')"
      :title="$t('tooltip.topbar_import')"
      @click="openFileDialog"
    >
      <iconify-icon icon="mingcute:upload-line" width="1.5rem" aria-hidden="true" />
    </button>

    <!-- new planet -->
    <RouterLink id="codex-header-controls-newplanet" class="lg dark" :to="uwuifyPath('/planet-editor/new')" :title="$t('codex.$action_add')">
      <iconify-icon icon="mingcute:add-line" width="1.5rem" aria-hidden="true" />
      {{ $t('codex.$action_add') }}
    </RouterLink>

    <!-- export planets -->
    <button
      class="lg dark"
      :aria-label="$t('a11y.topbar_export_all')"
      :title="$t('tooltip.topbar_export_all')"
      @click="exportPlanets"
    >
      <iconify-icon icon="mingcute:folder-zip-line" width="1.5rem" aria-hidden="true" />
    </button>
  </ViewHeader>

  <div v-if="planets.length > 0" id="codex-grid">
    <!-- prettier-ignore-attribute -->
    <PlanetCardElement
      v-for="planet of planets"
      :key="planet.id"
      :planet="(planet as IDBPlanet)"
      @info="openPlanetInfoDialog(planet as IDBPlanet)"
      @export="exportPlanet(planet as IDBPlanet)"
      @delete="openDeleteConfirmDialog(planet as IDBPlanet)"
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
  <AppPlanetInfoDialog ref="planetInfoDialogRef" />
  <AppDeleteConfirmDialog ref="deleteDialogRef" @confirm="deleteTargetedPlanet" />
</template>

<script setup lang="ts">
import PlanetCardElement from '@/components/codex/elements/PlanetCardElement.vue'
import InlineFooter from '@components/global/InlineFooter.vue'
import AppPlanetInfoDialog from '@components/codex/dialogs/PlanetInfoDialog.vue'
import AppDeleteConfirmDialog from '@components/codex/dialogs/DeleteConfirmDialog.vue'
import { idb, type IDBPlanet } from '@/dexie.config'
import { useHead } from '@unhead/vue'
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { EventBus } from '@core/event-bus'
import { SM_WIDTH_THRESHOLD } from '@core/globals'
import pako from 'pako'
import { saveAs } from 'file-saver'
import PlanetData from '@core/models/planet-data.model'
import JSZip from 'jszip'
import NewCardElement from '@/components/codex/elements/NewCardElement.vue'
import { readFileData } from '@core/helpers/import.helper'
import { nanoid } from 'nanoid'
import { uwuifyPath } from '@core/extras'
import ViewHeader from '@/components/global/ViewHeader.vue'

const i18n = useI18n()
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const planets: Ref<IDBPlanet[]> = ref([])

const planetInfoDialogRef: Ref<{ open: (planet: IDBPlanet) => void } | null> = ref(null)

const deleteTarget: Ref<IDBPlanet | null> = ref(null)
const deleteDialogRef: Ref<{ open: (planetName: string) => void } | null> = ref(null)
const showInlineFooter: Ref<boolean> = ref(false)

useHead({
  title: i18n.t('codex.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

onMounted(async () => {
  computeResponsiveness()
  await loadPlanets()
  EventBus.registerWindowEventListener('click', onWindowClick)
  EventBus.registerWindowEventListener('resize', onWindowResize)
})
onUnmounted(() => {
  EventBus.deregisterWindowEventListener('click', onWindowClick)
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

async function onWindowClick(event: MouseEvent) {
  EventBus.sendClickEvent(event)
}
function onWindowResize() {
  computeResponsiveness()
}

function computeResponsiveness() {
  showInlineFooter.value = window.innerWidth < SM_WIDTH_THRESHOLD
}

// ------------------------------------------------------------------------------------------------

function openFileDialog() {
  fileInput.value?.click()
}

async function importPlanetFile(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files || files?.length === 0) {
    console.warn('<Lagrange> At least one file should be specified!')
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

    const allAdded = await idb.planets.bulkAdd(
      newPlanets
        .filter((np) => np.status === 'fulfilled')
        .map((np: PromiseSettledResult<IDBPlanet>) => (np as PromiseFulfilledResult<IDBPlanet>).value)
        .map((np) => ({ ...np, id: nanoid(), timestamp: Date.now(), version: np.version ?? '1' })),
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
  saveAs(new Blob([gzipParams as BufferSource]), `${planetFilename}.lagrange`)
}

async function openPlanetInfoDialog(planet: IDBPlanet) {
  planetInfoDialogRef.value?.open(planet)
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

<style lang="scss">
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
  position: fixed;

  #codex-header-controls-newplanet {
    padding: 0 1rem;
    background: var(--lg-contrast-light);
    border: 1px solid var(--lg-contrast);
    text-decoration: none;
    &:hover { background: var(--lg-button-active); }
  }
}
#codex-grid {
  margin: 4rem 1rem 4rem;
  height: calc(100% - 4.75rem);

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 2rem;

  &.empty {
    font-style: italic;
    text-align: center;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;

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
}
@media screen and (max-width: 767px) {
  #codex-background {
    background-image: url('/background/space-540w.jpg');
  }
  #codex-grid {
    margin-bottom: 0.5rem;
  }
  #codex-footer {
    padding: 0 0.5rem 0.5rem;
  }
}
</style>
