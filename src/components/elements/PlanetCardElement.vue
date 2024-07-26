<template>
  <div class="planet-card">
    <RouterLink :to="'/planet-editor/'+planet.id" class="planet-preview">
      <img v-if="planet.preview" class="planet-image" :src="planet.preview" />
      <iconify-icon v-else icon="ph:planet-thin" width="auto" />
    </RouterLink>
    <p class="planet-name">{{ planet.data.planetName }}</p>
    <div class="actions">
      <RouterLink :to="'/planet-editor/'+planet.id"
        class="lg link-button"
        :aria-label="$t('a11y.topbar_export')"
        :title="$t('tooltip.topbar_export')"
      >
        <iconify-icon icon="mingcute:edit-2-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_edit') }}
      </RouterLink>
      <button
        class="lg"
        :aria-label="$t('a11y.topbar_export')"
        :title="$t('tooltip.topbar_export')"
        @click="emitExportEvent"
      >
        <iconify-icon icon="mingcute:download-line" width="1.5rem" aria-hidden="true" />
        {{ $t('codex.$action_export') }}
      </button>
      <hr>
      <button
        class="lg warn"
        :aria-label="$t('a11y.topbar_export')"
        :title="$t('tooltip.topbar_export')"
        @click="emitDeleteEvent"
      >
        <iconify-icon icon="mingcute:delete-2-line" width="1.5rem" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type IDBPlanet } from '@/dexie.config';
import { RouterLink } from 'vue-router';
defineProps<{ planet: IDBPlanet }>()
const $emit = defineEmits(['export', 'delete'])

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
  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .planet-preview {
    flex: 1;
    color: var(--lg-text);

    .planet-image {
      max-width: 100%;
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
    & > .lg:not(.warn), & > a {
      flex: 1;
    }
    & > .lg {
      min-width: 2.5rem;
      min-height: 2.5rem;
      font-size: 0.875rem;
    }
  }
}
</style>