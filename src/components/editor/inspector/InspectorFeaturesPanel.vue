<template>
  <section id="panel-features" class="panel">
    <div id="panel-features-header">
      <p>
        <iconify-icon icon="iconmind:feature-flag-outline-thin" width="1.25rem" />
        {{ $t('editor.inspector.features.$title') }}
      </p>
    </div>
    <div id="panel-features-content">
      <ul>
        <li>
          <InspectorFeature
            id="feature-data"
            :class="{ 'selected-feature': selectedFeature === 'data' }"
            @click="selectFeature('data')"
          >
            <iconify-icon icon="material-symbols:overview-outline" width="1.25rem" />
            {{ $t('editor.inspector.features.data') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-transform"
            :class="{ 'selected-feature': selectedFeature === 'transform' }"
            @click="selectFeature('transform')"
          >
            <iconify-icon icon="tabler:gizmo" width="1.25rem" />
            {{ $t('editor.inspector.features.transform') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-rendering"
            :class="{ 'selected-feature': selectedFeature === 'rendering' }"
            @click="selectFeature('rendering')"
          >
            <iconify-icon icon="material-symbols:vr180-create2d-outline" width="1.25rem" />
            {{ $t('editor.inspector.features.rendering') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-lighting"
            :class="{ 'selected-feature': selectedFeature === 'lighting' }"
            @click="selectFeature('lighting')"
          >
            <iconify-icon icon="mingcute:sun-line" width="1.25rem" />
            {{ $t('editor.inspector.features.lighting') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-surface"
            :class="{ 'selected-feature': selectedFeature === 'surface' }"
            @click="selectFeature('surface')"
          >
            <iconify-icon icon="mingcute:grass-line" width="1.25rem" />
            {{ $t('editor.inspector.features.surface') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-cracks"
            :class="{ 'selected-feature': selectedFeature === 'cracks' }"
            v-model="EDITOR_STATE.planetData.cracksEnabled"
            @click="selectFeature('cracks')"
            toggleable="true"
          >
            <iconify-icon icon="boxicons:explosion" width="1.25rem" />
            {{ $t('editor.inspector.features.cracks') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-craters"
            :class="{ 'selected-feature': selectedFeature === 'craters' }"
            v-model="EDITOR_STATE.planetData.cratersEnabled"
            @click="selectFeature('craters')"
            toggleable="true"
          >
            <iconify-icon icon="hugeicons:moon-01" width="1.25rem" />
            {{ $t('editor.inspector.features.craters') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-biomes"
            :class="{ 'selected-feature': selectedFeature === 'biomes' }"
            v-model="EDITOR_STATE.planetData.biomesEnabled"
            @click="selectFeature('biomes')"
            toggleable="true"
          >
            <iconify-icon icon="fluent:leaf-two-20-regular" width="1.25rem" />
            {{ $t('editor.inspector.features.biomes') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-clouds"
            :class="{ 'selected-feature': selectedFeature === 'clouds' }"
            v-model="EDITOR_STATE.planetData.cloudsEnabled"
            @click="selectFeature('clouds')"
            toggleable="true"
          >
            <iconify-icon icon="material-symbols:cloud-outline" width="1.25rem" />
            {{ $t('editor.inspector.features.clouds') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-atmosphere"
            :class="{ 'selected-feature': selectedFeature === 'atmosphere' }"
            v-model="EDITOR_STATE.planetData.atmosphereEnabled"
            @click="selectFeature('atmosphere')"
            toggleable="true"
          >
            <iconify-icon icon="material-symbols:line-curve" width="1.25rem" />
            {{ $t('editor.inspector.features.atmosphere') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-rings"
            :class="{ 'selected-feature': selectedFeature === 'rings' }"
            v-model="EDITOR_STATE.planetData.ringsEnabled"
            @click="selectFeature('rings')"
            toggleable="true"
          >
            <iconify-icon icon="ph:planet" width="1.25rem" />
            {{ $t('editor.inspector.features.rings') }}
          </InspectorFeature>
        </li>
        <li>
          <InspectorFeature
            id="feature-postprocessing"
            :class="{ 'selected-feature': selectedFeature === 'postprocessing' }"
            @click="selectFeature('postprocessing')"
          >
            <iconify-icon icon="mingcute:camera-2-line" width="1.25rem" />
            {{ $t('editor.inspector.features.postprocessing') }}
          </InspectorFeature>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EditorFeatures } from '@core/types.ts';
import InspectorFeature from '@components/editor/inspector/InspectorFeature.vue';
import { EDITOR_STATE } from '@core/editor/state/editor.state.ts';
import { onMounted, ref } from 'vue';

const selectedFeature = ref<EditorFeatures | null>(null);
const $emit = defineEmits(['featureChange']);

onMounted(() => {
  selectedFeature.value = 'data';
  $emit('featureChange', selectedFeature.value);
});

function selectFeature(feature: EditorFeatures) {
  selectedFeature.value = feature;
  $emit('featureChange', selectedFeature.value);
}
</script>

<style scoped lang="scss">
#panel-features {
  flex: 1;
  height: 100%;
  background: var(--lg-panel);
  scrollbar-width: auto;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  #panel-features-header {
    width: 100%;
    height: 2.5rem;
    padding: 0.5rem;
    background: linear-gradient(to right, var(--lg-accent), var(--lg-primary-static));
    border-bottom: var(--lg-var-border-width) solid var(--lg-accent);

    display: flex;
    align-items: center;
    justify-content: space-between;

    p {
      line-height: 1;
      text-shadow: 0 0 4px black;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    iconify-icon {
      color: var(--lg-features);
      filter: drop-shadow(0 0 4px black);
    }
  }

  #panel-features-content {
    width: 100%;
    overflow: auto;
  }

  ul {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0;

    li {
      width: 100%;
      list-style-type: none;
      padding: 0;
    }
  }
}

#feature-data:not(:disabled) iconify-icon {
  color: var(--lg-feature-data);
}
#feature-transform:not(:disabled) iconify-icon {
  color: var(--lg-feature-transform);
}
#feature-rendering:not(:disabled) iconify-icon {
  color: var(--lg-feature-rendering);
}
#feature-lighting:not(:disabled) iconify-icon {
  color: var(--lg-feature-lighting);
}
#feature-surface:not(:disabled) iconify-icon {
  color: var(--lg-feature-surface);
}
#feature-cracks:not(:disabled) iconify-icon {
  color: var(--lg-feature-cracks);
}
#feature-craters:not(:disabled) iconify-icon {
  color: var(--lg-feature-craters);
}
#feature-biomes:not(:disabled) iconify-icon {
  color: var(--lg-feature-biomes);
}
#feature-clouds:not(:disabled) iconify-icon {
  color: var(--lg-feature-clouds);
}
#feature-atmosphere:not(:disabled) iconify-icon {
  color: var(--lg-feature-atmosphere);
}
#feature-rings:not(:disabled) iconify-icon {
  color: var(--lg-feature-rings);
}
#feature-postprocessing:not(:disabled) iconify-icon {
  color: var(--lg-feature-postprocessing);
}
</style>
