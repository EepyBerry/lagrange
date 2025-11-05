<template>
  <div ref="cardRoot" class="planet-card">
    <BorderTopDeco />
    <CornerDeco class="br" />
    <div class="planet-card-inner">
      <div class="planet-preview" :class="{ 'extra-hologram': !!EXTRAS_HOLOGRAM_MODE }">
        <svg viewBox="0 0 256 256">
          <circle cx="128" cy="128" :r="getPlanetCircleRadius()+8" fill="transparent" stroke="var(--lg-accent)" stroke-width="1" />
          <circle cx="128" :cy="128 + getPlanetCircleRadius()+8" r="4" fill="var(--lg-primary-static)" />
          <circle cx="128" :cy="128 + getPlanetCircleRadius()+8" r="6" fill="transparent" stroke="var(--lg-accent)" stroke-width="1" />
          <line x1="128" :y1="128 + getPlanetCircleRadius()+14" x2="128" y2="272" stroke="var(--lg-accent)" stroke-width="1" stroke-dasharray="6 4" />
        </svg>
        <img
          v-if="planet.preview"
          class="planet-image"
          :src="planet.preview"
          :aria-label="planet.data.planetName"
          :alt="planet.data.planetName"
        />
        <iconify-icon v-else icon="ph:planet-thin" width="auto" />
        <span class="crt" :class="{ animated: A11Y_ANIMATE }"></span>
      </div>
      <p class="planet-name">{{ planet.data.planetName }}</p>
      <div class="planet-card-actions">
        <button
          class="lg contrast"
          style="flex: 0"
          :aria-label="$t('codex.$action_info', { planet: planet.data.planetName })"
          :title="$t('codex.$action_info', { planet: planet.data.planetName })"
          @click="$emit('info')"
        >
          <iconify-icon icon="mingcute:information-line" width="1.5rem" aria-hidden="true" />
        </button>
        <hr />
        <RouterLink
          :to="uwuifyPath('/planet-editor/' + planet.id)"
          class="lg link-button"
          :aria-label="$t('codex.$action_edit', { planet: planet.data.planetName })"
          :title="$t('codex.$action_edit', { planet: planet.data.planetName })"
        >
          <iconify-icon icon="mingcute:edit-2-line" width="1.5rem" aria-hidden="true" />
        </RouterLink>
        <button
          class="lg"
          :aria-label="$t('codex.$action_export', { planet: planet.data.planetName })"
          :title="$t('codex.$action_export', { planet: planet.data.planetName })"
          @click="$emit('export')"
        >
          <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
        </button>
        <hr />
        <button
          class="lg warn"
          :aria-label="$t('codex.$action_delete', { planet: planet.data.planetName })"
          :title="$t('codex.$action_delete', { planet: planet.data.planetName })"
          @click="$emit('delete')"
        >
          <iconify-icon icon="mingcute:delete-2-line" width="1.5rem" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EXTRAS_HOLOGRAM_MODE, uwuifyPath } from '@core/extras'
import { A11Y_ANIMATE } from '@core/globals'
import { type IDBPlanet } from '@/dexie.config'
import { onMounted, ref, type Ref } from 'vue'
import { RouterLink } from 'vue-router'
import BorderTopDeco from '../decoration/BorderTopDeco.vue'
import CornerDeco from '../decoration/CornerDeco.vue'

const cardRoot: Ref<HTMLElement | null> = ref(null)

const $props = defineProps<{ planet: IDBPlanet }>()
defineEmits(['info', 'export', 'delete'])
onMounted(() => setTimeout(() => cardRoot.value!.style.opacity = '1'))

function getPlanetCircleRadius() {
  return $props.planet.data.ringsEnabled
    ? (128.0 * $props.planet.data.planetRadius) - ($props.planet.data.findOutermostRingRadius()*128.0/5.0) + 4
    : 128.0 * $props.planet.data.planetRadius
}

</script>

<style scoped lang="scss">
.planet-card {
  position: relative;

  background: var(--lg-accent);
  clip-path: polygon(0 23px, 23px 0, 100% 0, 100% calc(100% - 23px), calc(100% - 23px) 100%, 0 100%);
  border-radius: 2px;
  overflow: visible;

  opacity: 0;
  transition: opacity 100ms ease-in-out;
  gap: 1rem;
  display: flex;

  .planet-card-inner {
    flex: 1;
    margin: 1px;
    background: var(--lg-primary);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .planet-preview {
    position: relative;
    margin-top: 1.5rem;
    color: var(--lg-text);
    width: 16rem;
    height: 16rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg { 
      position: absolute; 
      inset: 0; 
      overflow: visible;
    }
    .planet-image {
      z-index: 0;
      max-width: 16rem;
      border-radius: 8px;
    }
  }
  .planet-name {
    font-weight: 500;
    font-size: 1.25rem;
    max-width: 24ch;
    text-overflow: ellipsis;
    text-align: center;
    overflow: hidden;
  }

  .planet-card-actions {
    width: 100%;
    display: flex;
    align-items: center;
    border-top: 1px solid var(--lg-accent);
    background: var(--lg-panel);
    padding: 0.5rem;
    gap: 0.5rem;

    hr { height: 100%; }
    button, a {
      min-width: 2.5rem;
      min-height: 2.5rem;
      font-size: 0.875rem;
    }
    
    *:nth-child(3), *:nth-child(4) {
      flex: 1;
    }
    button:last-child {
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%);
    }
  }
}

@media screen and (prefers-reduced-motion) {
  .planet-card {
    transition: none;
  }
}
</style>
