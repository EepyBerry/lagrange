<template>
  <span id="codex-background"></span>
  <div id="codex-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <div id="codex-header-controls">
      <RouterLink class="lg dark create-planet" to="/planet-editor/new">
        <iconify-icon icon="mingcute:add-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_add') }}
      </RouterLink>
      <hr />
      <input ref="fileInput" type="file" @change="importPlanetFile" hidden />
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
  <div v-if="planets.length > 0" id="codex-grid" router-link="/planet-editor/new">
    <PlanetCardElement v-for="planet of planets" :key="planet.id" :planet="planet" @export="exportPlanet(planet)" @delete="openDeleteConfirmDialog(planet)" />
  </div>
  <div v-else id="codex-grid" class="empty">
    <iconify-icon icon="ph:planet-thin" width="16rem" />
    <span>{{ $t('codex.no_planets') }}</span>
  </div>
  <div id="codex-footer">
    <InlineFooter  />
  </div>
  <AppDeleteConfirmDialog ref="deleteDialogRef" @confirm="deleteTargetedPlanet">
    <template v-slot:planet></template>
  </AppDeleteConfirmDialog>
</template>

<script setup lang="ts">
import PlanetCardElement from '@/components/elements/PlanetCardElement.vue';
import AppNavigation from '@/components/main/AppNavigation.vue';
import InlineFooter from '@/components/main/InlineFooter.vue';
import AppDeleteConfirmDialog from '@components/dialogs/AppDeleteConfirmDialog.vue';
import { idb, type IDBPlanet } from '@/dexie.config';
import { useHead } from '@unhead/vue';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { WindowEventBus } from '@/core/window-event-bus';
import { MD_WIDTH_THRESHOLD } from '@/core/globals';
import pako from 'pako'
import { saveAs } from 'file-saver'
import PlanetData from '@/core/models/planet-data.model';
import JSZip from 'jszip';

const i18n = useI18n()
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const planets: Ref<IDBPlanet[]> = ref([])

const deleteTarget: Ref<IDBPlanet|null> = ref(null)
const deleteDialogRef: Ref<{ open: Function } | null> = ref(null)
const showCompactNavigation: Ref<boolean> = ref(false)

useHead({
  title: i18n.t('codex.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

onMounted(async () => {
  computeResponsiveness()
  await loadPlanets()
  WindowEventBus.registerWindowEventListener('resize', onWindowResize)
})
onUnmounted(() => {
  WindowEventBus.deregisterWindowEventListener('resize', onWindowResize)
})

async function loadPlanets() {
  const idbPlanets = await idb.planets.orderBy('data._planetName').toArray()
  planets.value = idbPlanets.map(pl => ({ ...pl, data: PlanetData.createFrom(pl.data) }))
}

// ------------------------------------------------------------------------------------------------

function onWindowResize() {
  computeResponsiveness()
}

function computeResponsiveness() {
  showCompactNavigation.value = window.innerWidth < MD_WIDTH_THRESHOLD
}

// ------------------------------------------------------------------------------------------------

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
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(pako.inflate(e.target?.result as ArrayBuffer, { to: 'string' })) as IDBPlanet
      const newIdb: IDBPlanet = {
        id: data.id,
        data: PlanetData.createFrom(data.data),
        preview: data.preview
      }
      await idb.planets.add(newIdb, data.id)
      await loadPlanets()
      console.info(`Imported planet (ID=${data.id}): [${newIdb.data.planetName}]`)
    } catch (err) {
      console.error(err)
    }
  }
  reader.readAsArrayBuffer(files[0])
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
  await idb.planets.delete(deleteTarget.value!.id)
  await loadPlanets()
}

</script>

<style scoped lang="scss">
#codex-background {
  z-index: -1;
  position: fixed;
  inset: 0;
  background-image: url('/background/space-1920w.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
#codex-header {
  z-index: 15;
  position: absolute;
  inset: 0 0 auto 0;
  
  margin: 1rem;
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
  padding: 0 1rem 1rem;
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}

@media screen and (min-width: 2000px) {
  #codex-background {
    background-image: url('/background/space-2560w.png');
  }
}
@media screen and (max-width: 1199px) {
  #codex-background {
    background-image: url('/background/space-960w.png');
  }
  #codex-header {
    margin: 0.5rem;
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
  #codex-background {
    background-image: url('/background/space-540w.png');
  }
  #codex-grid {
    padding: 0.5rem;
    margin: 3.75rem 0.5rem 0;
  }
  #codex-footer {
    display: inline-flex;
    padding: 0 0.5rem 0.5rem;
  }
}
</style>