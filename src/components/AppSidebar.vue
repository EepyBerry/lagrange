<template>
  <aside id="sidebar">
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
                  name="p-mesh"
                  id="opt-sphere"
                  :value="GeometryType.SPHERE"
                  icon="tabler:sphere"
                  ariaLabel="Sphere"
                >
                  Sphere
                </ParameterRadioOption>
                <ParameterRadioOption
                  v-model="LG_PARAMETERS.planetGeometryType"
                  name="p-mesh"
                  id="opt-torus"
                  :value="GeometryType.TORUS"
                  icon="lucide:torus"
                  ariaLabel="Torus"
                >
                  Torus
                </ParameterRadioOption>
                <ParameterRadioOption
                  v-model="LG_PARAMETERS.planetGeometryType"
                  name="p-mesh"
                  id="opt-cube"
                  :value="GeometryType.BOX"
                  icon="tabler:cube"
                  ariaLabel="Cube"
                >
                  Torus
                </ParameterRadioOption>
              </template>
            </ParameterRadio>
            <ParameterDivider />
            <ParameterField v-model="LG_PARAMETERS.planetMeshQuality" id="p-qual" type="number">
              Mesh quality
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetAxialTilt" id="p-tilt" type="number" unit="°">
              Axial tilt
            </ParameterField>
            <ParameterField v-model="LG_PARAMETERS.planetRotation" id="p-rot" type="number" unit="°">
              Rotation
            </ParameterField>
            <ParameterDivider />
          </ParameterTable>
        </template>
      </SidebarSection>
      <SidebarSection icon="mingcute:planet-line" :expand="true">
        <template v-slot:title>Surface</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceShowBumps"
              id="s-bumps"
              type="checkbox"
            >
              Show bumps
            </ParameterField>
            <ParameterDivider />
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.frequency"
              id="s-freq"
              type="number"
              :step="0.01"
            >
              Frequency
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.amplitude"
              id="s-amp"
              type="number"
              :step="0.01"
            >
              Amplitude
            </ParameterField>
            <ParameterField
              v-model="LG_PARAMETERS.planetSurfaceNoise.lacunarity"
              id="s-lac"
              type="number"
              :step="0.01"
            >
              Lacunarity
            </ParameterField>
            <ParameterDivider />
            <ParameterColorRamp 
              v-model="LG_PARAMETERS.planetSurfaceColorRamp"
              id="s-color"
            >
              Color ramp
            </ParameterColorRamp>
          </ParameterTable>
        </template>
      </SidebarSection>
      <SidebarSection icon="mingcute:clouds-line" :expand="false">
        <template v-slot:title>Clouds</template>
        <template v-slot:content>
          <ParameterTable>
            <ParameterField
              v-model="LG_PARAMETERS.cloudsEnabled"
              id="c-toggle"
              type="checkbox"
            >
              Show clouds
            </ParameterField>
            <ParameterDivider />
            <template v-if="LG_PARAMETERS.cloudsEnabled">
              <ParameterField
                v-model="LG_PARAMETERS.cloudsAxialTilt"
                id="c-tilt"
                type="number"
                unit="°"
              >
                Axial tilt
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsRotation"
                id="c-rot"
                type="number"
                unit="°"
              >
                Rotation
              </ParameterField>
              <ParameterField 
                v-model="LG_PARAMETERS.cloudsHeight"
                id="c-height"
                type="number"
              >
                Height
              </ParameterField>
              <ParameterDivider />
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.frequency"
                id="c-freq"
                type="number"
                :step="0.01"
              >
                Frequency
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.amplitude"
                id="c-amp"
                type="number"
                :step="0.01"
              >
                Amplitude
              </ParameterField>
              <ParameterField
                v-model="LG_PARAMETERS.cloudsNoise.lacunarity"
                id="c-lac"
                type="number"
                :step="0.01"
              >
                Lacunarity
              </ParameterField>
            <ParameterDivider />
            <ParameterColorRamp v-model="LG_PARAMETERS.cloudsColorRamp">Color/Opacity ramp</ParameterColorRamp>
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
  </aside>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@core/globals'
import { GeometryType } from '@core/types'
import ParameterColorRamp from './elements/ParameterColorRamp.vue';
</script>

<style scoped lang="scss">
#sidebar {
  z-index: 5;
  position: absolute;
  inset: 0 auto 0 0;
  min-width: 24rem;
  padding: 1rem;

  overflow-y: auto;
  scrollbar-color: var(--lg-accent) transparent;
  scrollbar-width: thin;
  transform: scaleX(-1);

  .sidebar-scroll {
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    transform: scaleX(-1);
  }
}

@media screen and (max-width:767px) {
  #sidebar {
    min-width: 2rem;
  }
}
</style>