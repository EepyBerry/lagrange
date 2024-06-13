<template>
  <div id="sidebar">
    <div class="sidebar-scroll">
      <SidebarSection icon="tabler:gizmo" :expand="true">
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
                  :value="GeometryType.SPHERE"
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
            <ParameterField v-model="LG_PARAMETERS.planetMeshQuality" type="number">
              Mesh quality
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetAxialTilt" type="number" unit="°">
              Axial tilt
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetRotation" type="number" unit="°">
              Rotation
            </ParameterField>
            <ParameterDivider />
          </ParameterTable>
        </template>
      </SidebarSection>
      <SidebarSection icon="mingcute:planet-line" :expand="false">
        <template v-slot:title>Surface</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField v-model="LG_PARAMETERS.planetSurfaceNoise.frequency"  type="number" :step="0.01">
              Frequency
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetSurfaceNoise.amplitude"  type="number" :step="0.01">
              Amplitude
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetSurfaceNoise.lacunarity" type="number" :step="0.01">
              Lacunarity
            </ParameterField>
            <ParameterField type="color-ramp">Color ramp</ParameterField>
            <ParameterDivider />
            <ParameterField v-model="LG_PARAMETERS.planetSurfaceShowBumps" type="checkbox">
              Show bumps
            </ParameterField>
          </ParameterTable>
        </template>
      </SidebarSection>
      <SidebarSection icon="mingcute:clouds-line" :expand="false">
        <template v-slot:title>Clouds</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField v-model="LG_PARAMETERS.cloudsEnabled" type="checkbox">
              Show clouds
            </ParameterField>
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterField v-model="LG_PARAMETERS.cloudsAxialTilt" type="number" unit="°">
                Axial tilt
              </ParameterField>
              <ParameterField v-model="LG_PARAMETERS.cloudsRotation" type="number" unit="°">
                Rotation
              </ParameterField>
              <ParameterField v-model="LG_PARAMETERS.cloudsHeight" type="number">
                Height
              </ParameterField>
              <ParameterField type="color-ramp">Color ramp</ParameterField>
            </template>
          </ParameterTable>
        </template>
      </SidebarSection>
      <SidebarSection icon="material-symbols:line-curve-rounded" :expand=false>
        <template v-slot:title>Atmosphere</template>
        <template v-slot:content>
        </template>
      </SidebarSection>
    </div>
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
  margin: 1rem;

  overflow-y: auto;
  scrollbar-color: var(--lg-accent) transparent;
  scrollbar-width: thin;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  .sidebar-scroll {
    width: 100%;
  }
}
</style>