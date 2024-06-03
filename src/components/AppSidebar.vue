<template>
  <div id="sidebar">
    <section class="param-section">
      <div class="section-title">
        <h1 class="headline-sm">
          <iconify-icon icon="mingcute:planet-line" width="1.25em" />
          Planet settings
        </h1>
        <button class="icon-button">
          <iconify-icon icon="mingcute:down-fill" width="1.25rem" />
        </button>
      </div>
      <div class="section-content">
        <ParameterTable>
          <ParameterField v-model="LG_PARAMETERS.planetMeshQuality" type="number">Mesh quality</ParameterField>
          <ParameterField v-model="LG_PARAMETERS.planetRadius" type="number">Radius</ParameterField>
          <ParameterField v-model="LG_PARAMETERS.planetAxialTilt" type="number" unit="°">Axial tilt</ParameterField>
          <ParameterField v-model="LG_PARAMETERS.planetRotation" type="number" unit="°">Rotation</ParameterField>
          <ParameterDivider />
        </ParameterTable>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { LG_PARAMETERS } from '@/utils/globals'

watch(LG_PARAMETERS, (newValue) => {
  console.log(newValue)
})
</script>

<style scoped lang="scss">
#sidebar {
  z-index: 5;
  position: absolute;
  inset: 0 auto 0 0;
  width: 20rem;
  margin: 1%;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.param-section {
  background-color: var(--lg-primary);
  border-bottom: 2px solid var(--lg-accent);
  width: 100%;
  padding: 0.5rem 0.75rem;

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
}
</style>