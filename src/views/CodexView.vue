<template>
  <div id="codex-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <div id="codex-header-controls">
      <RouterLink class="lg dark create-planet" to="planet-editor">
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
        :aria-label="$t('a11y.topbar_export')"
        :title="$t('tooltip.topbar_export')"
        @click="exportPlanets"
      >
        <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
      
  </div>
  <div v-if="planets.length > 0" id="codex-grid" router-link="/planet-editor">
    <PlanetCardElement v-for="planet of planets" :key="planet.id" :planet="planet" />
  </div>
  <div v-else id="codex-grid" class="empty">
    <iconify-icon icon="ph:planet-thin" width="16rem" />
    <span>{{ $t('codex.no_planets') }}</span>
  </div>
  <div id="codex-footer">
    <InlineFooter  />
  </div>
</template>

<script setup lang="ts">
import PlanetCardElement from '@/components/elements/PlanetCardElement.vue';
import AppNavigation from '@/components/main/AppNavigation.vue';
import InlineFooter from '@/components/main/InlineFooter.vue';
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

const i18n = useI18n()
const fileInput: Ref<HTMLInputElement | null> = ref(null)
const planets: Ref<IDBPlanet[]> = ref([])
const isLoading: Ref<boolean> = ref(false)

// Responsiveness
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
  planets.value = await idb.planets.toArray()
}

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
  reader.onload = (e) => {
    try {
      const data = JSON.parse(pako.inflate(e.target?.result as ArrayBuffer, { to: 'string' })) as IDBPlanet
      const newParams = PlanetData.createFrom(data)
      console.debug(`Loaded planet (ID=${data.id}): [${newParams.planetName}]`)
    } catch (err) {
      console.error(err)
    }
  }
  reader.readAsArrayBuffer(files[0])
}

function exportPlanets() {
  const jsonParams = JSON.stringify(planets)
  const gzipParams = pako.deflate(jsonParams)
  const planetFilename = 'Planet'
  saveAs(new Blob([gzipParams]), `${planetFilename}.lagrange`)
}

function exportPlanetFile(id: string) {
  const planet = planets.value.find(p => p.id === id)!
  const jsonParams = JSON.stringify(planet)
  const gzipParams = pako.deflate(jsonParams)
  const planetFilename = 'Planet'
  saveAs(new Blob([gzipParams]), `${planetFilename}.lagrange`)
}

</script>

<style scoped lang="scss">
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
  padding: 1rem;
  margin: 4.75rem 1rem 0;
  height: calc(100% - 4.75rem);

  display: grid;
  grid-template-columns: repeat(4, 1fr);

  &.empty {
    background: var(--lg-primary);
    border: 2px dashed var(--lg-accent);
    border-radius: 4px;
    color: var(--lg-contrast);
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

@media screen and (max-width: 1199px) {
  #codex-header {
    margin: 0.5rem;
    
    #codex-header-controls {
      justify-content: flex-end;
    }
  }
  #codex-grid {
    padding: 0.5rem 0.5rem 0;
    margin: 3.75rem 0.5rem 0;
  }
}
@media screen and (max-width: 767px) {
  #codex-footer {
    display: inline-flex;
    padding: 0 0.5rem 0.5rem;
  }
}
</style>