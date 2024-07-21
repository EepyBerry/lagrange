<template>
  <div id="codex-header" :class="{ compact: !!showCompactNavigation }">
    <AppNavigation :compact-mode="showCompactNavigation" />
    <RouterLink class="lg dark create-planet" to="planet-editor">
      <iconify-icon icon="mingcute:add-line" width="1.5rem" />
      {{ $t('codex.$action_add') }}
    </RouterLink>
  </div>
  <div id="codex-grid" router-link="/planet-editor">
    <PlanetCardElement v-for="planet of planets" :key="planet.id" :planet="planet" />
  </div>
</template>

<script setup lang="ts">
import { idb, type IDBPlanet } from '@/dexie.config';
import { useHead } from '@unhead/vue';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { WindowEventBus } from '@/core/window-event-bus';
import { MD_WIDTH_THRESHOLD } from '@/core/globals';
import PlanetCardElement from '@/components/elements/PlanetCardElement.vue';
import AppNavigation from '@/components/main/AppNavigation.vue';

const i18n = useI18n()
const planets: Ref<IDBPlanet[]> = ref([])

// Responsiveness
const showCompactNavigation: Ref<boolean> = ref(false)

useHead({
  title: i18n.t('codex.$title') + ' · ' + i18n.t('main.$title'),
  meta: [{ name: 'description', content: 'Planet editor' }],
})

onMounted(async () => {
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
  showCompactNavigation.value = window.innerWidth < MD_WIDTH_THRESHOLD
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

  &.compact {
    justify-content: space-between;
  }

  a.create-planet {
    min-height: 2.875rem;
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

@media screen and (max-width: 1199px) {
  #codex-header {
    margin: 0.5rem;
  }
}
</style>