<template>
  <div id="sidebar">
    <SidebarSection :expand="true">
      <template v-slot:title>Planet Settings</template>
      <template v-slot:content>
        <ParameterTable>
          <ParameterField v-model="LG_PARAMETERS.planetMeshQuality" type="number" unit="°">Mesh quality</ParameterField>
          <ParameterField v-model="LG_PARAMETERS.planetAxialTilt" type="number" unit="°">Axial tilt</ParameterField>
          <ParameterField v-model="LG_PARAMETERS.planetRotation" type="number" unit="°">Rotation</ParameterField>
          <ParameterDivider />
        </ParameterTable>
      </template>
    </SidebarSection>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { LG_PARAMETERS } from '@core/globals'

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
</style>