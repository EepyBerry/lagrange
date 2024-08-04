<template>
  <div class="planet-card" ref="cardRoot">
    <div class="planet-preview">
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
    <div class="actions">
      <RouterLink
        :to="'/planet-editor/' + planet.id"
        class="lg link-button"
        :aria-label="$t('codex.$action_edit', { planet: planet.data.planetName })"
        :title="$t('codex.$action_edit', { planet: planet.data.planetName })"
      >
        <iconify-icon icon="mingcute:edit-2-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_edit') }}
      </RouterLink>
      <button
        class="lg"
        :aria-label="$t('codex.$action_export', { planet: planet.data.planetName })"
        :title="$t('codex.$action_export', { planet: planet.data.planetName })"
        @click="emitExportEvent"
      >
        <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_export') }}
      </button>
      <hr />
      <button
        class="lg warn"
        :aria-label="$t('codex.$action_delete', { planet: planet.data.planetName })"
        :title="$t('codex.$action_delete', { planet: planet.data.planetName })"
        @click="emitDeleteEvent"
      >
        <iconify-icon icon="mingcute:delete-2-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { A11Y_ANIMATE } from '@/core/globals'
import { type IDBPlanet } from '@/dexie.config'
import { onMounted, ref, type Ref } from 'vue'
import { RouterLink } from 'vue-router'

const cardRoot: Ref<HTMLElement | null> = ref(null)

defineProps<{ planet: IDBPlanet }>()
const $emit = defineEmits(['export', 'delete'])

onMounted(() => setTimeout(() => cardRoot.value?.classList.add('animated')))

function emitExportEvent() {
  $emit('export')
}

function emitDeleteEvent() {
  $emit('delete')
}
</script>

<style scoped lang="scss">
.planet-card {
  padding: 1rem;
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  overflow: hidden;

  opacity: 0;
  transition: opacity 100ms ease-in-out;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  &.animated {
    opacity: 1;
  }

  .planet-preview {
    position: relative;
    color: var(--lg-text);
    max-height: 16rem;

    .planet-image {
      max-width: 16rem;
      filter: contrast(110%);
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

  .actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    hr {
      height: 1.5rem;
    }
    & > .lg:not(.warn),
    & > a {
      flex: 1;
    }
    & > .lg {
      min-width: 2.5rem;
      min-height: 2.5rem;
      font-size: 0.875rem;
    }
  }
}

@media screen and (prefers-reduced-motion) {
  .planet-card {
    transition: none;
  }
}
</style>
