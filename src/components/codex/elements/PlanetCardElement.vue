<template>
  <div ref="cardRoot" class="planet-card">
    <!-- effects -->
    <ExtraMetalSlugPlanetExplosion ref="extraPlanetExplosionRef" @obliteration="obliterationHidePlanetImage = true" />

    <div class="planet-preview" :class="{ 'effect-hologram': !!EXTRAS_HOLOGRAM_EFFECT }">
      <!-- decoration -->
      <svg viewBox="0 0 256 256" role="presentation" >
        <g v-show="!obliterationHidePlanetImage" class="planet-preview-gizmo">
          <g class="planet-preview-gizmo inner">
            <circle cx="128" cy="128" :r="getPlanetCircleRadius()+8" fill="transparent" stroke="var(--lg-accent)" stroke-width="1.5" />
            <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 120, 140)" fill="none" stroke="var(--lg-accent)" stroke-width="6" />
            <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 145, 150)" fill="none" stroke="var(--lg-accent)" stroke-width="6" />
            <path :d="makeSVGCircleArc(128, 128, getPlanetCircleRadius()+11.5, 330, 360)" fill="none" stroke="var(--lg-accent)" stroke-width="6" />
          </g>
          <circle cx="128" :cy="128 + getPlanetCircleRadius()+8" r="5" fill="var(--lg-primary-static)" />
          <circle cx="128" :cy="128 + getPlanetCircleRadius()+8" r="6" fill="transparent" stroke="var(--lg-accent)" stroke-width="1.5" />
        </g>
        <line x1="128" :y1="128 + getPlanetCircleRadius()+14" x2="128" y2="272" stroke="var(--lg-accent)" stroke-width="1.5" stroke-dasharray="6 4" />
      </svg>

      <!-- preview -->
      <div v-show="!obliterationHidePlanetImage" class="planet-preview-inner">
        <img
          v-if="planet.preview"
          class="planet-image"
          :src="planet.preview"
          :aria-label="planet.data.planetName"
          :alt="planet.data.planetName"
        />
        <iconify-icon v-else class="planet-image-fallback" icon="bi:question-circle" :width="planet.data.planetRadius * 128.0" />
      </div>

      <!-- effects -->
      <span v-if="!!EXTRAS_CRT_EFFECT" class="effect-crt"></span>
    </div>
    <p class="planet-name">
      <span>
      {{ planet.data.planetName }}
      </span>
    </p>
    <div class="planet-card-actions" :class="{ 'fade-out': obliterationDisableControls }">
      <LgvButton
        class="contrast"
        icon="mingcute:information-line"
        :a11y-label="$t('codex.$action_info', { planet: planet.data.planetName })"
        :title="$t('codex.$action_info', { planet: planet.data.planetName })"
        :aria-disabled="obliterationDisableControls"
        @click="$emit('info')"
      />
      <LgvLink
        variant="button"
        link-type="internal"
        :href="uwuifyPath('/planet-editor/' + planet.id)"
        icon="mingcute:edit-2-line"
        :a11y-label="$t('codex.$action_edit', { planet: planet.data.planetName })"
        :title="$t('codex.$action_edit', { planet: planet.data.planetName })"
        :aria-disabled="obliterationDisableControls"
      />
      <LgvButton
        icon="mingcute:download-line"
        :a11y-label="$t('codex.$action_export', { planet: planet.data.planetName })"
        :title="$t('codex.$action_export', { planet: planet.data.planetName })"
        :aria-disabled="obliterationDisableControls"
        @click="$emit('export')"
      />
      <LgvButton
        class="warn"
        icon="mingcute:delete-2-line"
        :a11y-label="$t('codex.$action_delete', { planet: planet.data.planetName })"
        :title="$t('codex.$action_delete', { planet: planet.data.planetName })"
        :aria-disabled="obliterationDisableControls"
        @click="$emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EXTRAS_CRT_EFFECT, EXTRAS_HOLOGRAM_EFFECT, uwuifyPath } from '@core/extras'
import { type IDBPlanet } from '@/dexie.config'
import { onMounted, ref, useTemplateRef } from 'vue'
import { makeSVGCircleArc } from '@/core/utils/svg-utils'
import LgvButton from '@/_lib/components/LgvButton.vue'
import LgvLink from '@/_lib/components/LgvLink.vue'
import ExtraMetalSlugPlanetExplosion from '@/components/global/extras/ExtraMetalSlugPlanetExplosion.vue'

const cardRoot = useTemplateRef('cardRoot')
const extraPlanetExplosionRef = useTemplateRef('extraPlanetExplosionRef')

const $props = defineProps<{ planet: IDBPlanet }>()
const planetRadius = ref($props.planet.data.planetRadius*100.0 + '%')
const obliterationDisableControls = ref(false)
const obliterationHidePlanetImage = ref(false)

defineExpose({ planet: $props.planet, obliteratePlanet })
defineEmits(['info', 'export', 'delete'])
onMounted(() => setTimeout(() => cardRoot.value!.style.opacity = '1'))

async function obliteratePlanet() {
  obliterationDisableControls.value = true
  await extraPlanetExplosionRef.value!.doEffect()
}

function getPlanetCircleRadius() {
  return 128.0 * $props.planet.data.planetRadius
}
</script>

<style scoped lang="scss">
.planet-card {
  position: relative;
  flex: 1;

  border-radius: 2px;
  overflow: visible;

  opacity: 0;
  transition: opacity 100ms ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

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
      .planet-preview-gizmo {
        transform-origin: 50% 50%;
        transition: all 150ms ease-in-out;
      }
    }
    .planet-preview-inner {
      width: 100%;
      height: 100%;
      .planet-image {
        z-index: 0;
        max-width: 16rem;
        border-radius: 8px;
      }
      .planet-indicator {
        opacity: 0.375;
      }

      .planet-image-fallback {
        z-index: 0;
        width: 16rem;
        height: 16rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .effect-crt {
      border-radius: 50%;
      width: v-bind(planetRadius);
      height: v-bind(planetRadius);
    }
  } 
  .planet-name {
    background: var(--lg-accent);
    clip-path: polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
    display: flex;
    span {
      padding: 0.25rem 0.5rem;
      margin: 2px;

      background: var(--lg-primary);
      clip-path: polygon(0 7px, 7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%);
      
      max-width: 24ch;
      font-weight: 500;
      font-size: 1.25rem;
      text-overflow: ellipsis;
      text-align: center;
      overflow: hidden;
      cursor: text;
    }
  }
  .planet-card-actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    opacity: 0.5;
    
    :is(button,a):first-child {
      flex: 0;
      clip-path: polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    }
    :is(button,a):nth-child(2),
    :is(button,a):nth-child(3) {
      flex: 1;
      min-width: 3.75rem;
    }
    :is(button,a):last-child {
      flex: 0;
      clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
    }

    &.fade-out {
      opacity: 0;
      pointer-events: none;
      user-select: none;
    }
  }
}
.planet-card:hover, .planet-card:focus-within {
  .planet-name {
    background: var(--lg-contrast);
  }
  .planet-card-actions:not(.fade-out), .planet-indicator {
    opacity: 1;
  }
  svg {
    line { stroke: var(--lg-contrast); }
    .planet-preview-gizmo:not(.inner) {
      transform: scale(0.975);
      * {
        stroke: var(--lg-contrast);
      }
    }
    .planet-preview-gizmo.inner {
      transform: rotate(15deg);
    }
  }
}

:root[data-animations='off'] {
  .planet-card { transition: none; }
  svg .planet-preview-gizmo, svg .planet-preview-gizmo-inner { transition: none; }
}
@media screen and (prefers-reduced-motion) {
  .planet-card { transition: none; }
  svg .planet-preview-gizmo, svg .planet-preview-gizmo-inner { transition: none; }
}
</style>
