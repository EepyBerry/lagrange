<template>
  <div id="sidebar">
    <SidebarSection :expand="true">
      <template v-slot:title>Planet Settings</template>
      <template v-slot:content>
        <ParameterTable>
          <ParameterRadio>
            <template v-slot:title>Mesh</template>
            <template v-slot:options>
              <ParameterRadioOption
                v-model="LG_PARAMETERS.planetGeometryType"
                name="planet-mesh"
                id="0"
                :value="GeometryType.ICOSPHERE"
                icon="tabler:sphere"
              >
                Sphere
              </ParameterRadioOption>
              <ParameterRadioOption
                v-model="LG_PARAMETERS.planetGeometryType"
                name="planet-mesh"
                id="1"
                :value="GeometryType.TORUS"
                icon="lucide:torus"
              >
                Torus
              </ParameterRadioOption>
              <ParameterRadioOption
                v-model="LG_PARAMETERS.planetGeometryType"
                name="planet-mesh"
                id="2"
                :value="GeometryType.BOX"
                icon="tabler:cube"
              >
                Torus
              </ParameterRadioOption>
            </template>
          </ParameterRadio>
          <ParameterDivider />
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
import { LG_PARAMETERS } from '@core/globals'
import { GeometryType } from '@core/types'
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