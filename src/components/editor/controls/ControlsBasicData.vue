<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.basic_data.classification') }}</template>
      <template #content>
        <ParameterSelect id="b-type" v-model="LG_PLANET_DATA.planetType">
          {{ $t('editor.controls.basic_data.classification_type') }}:
          <template #options>
            <option v-for="opt in listPlanetTypeValues()" :key="opt" :value="opt">{{ $t(getI18nPlanetType(opt)) }}</option>
          </template>
        </ParameterSelect>
        <ParameterSelect id="b-type" v-model="LG_PLANET_DATA.planetClass">
          {{ $t('editor.controls.basic_data.classification_class') }}:
          <template #options>
            <option v-for="opt in listPlanetClassValues()" :key="opt" :value="opt">{{ $t(getI18nPlanetClass(opt)) }}</option>
          </template>
        </ParameterSelect>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterSelect from '@/components/global/parameters/ParameterSelect.vue';
import { PlanetClass, PlanetType } from '@/core/types';
import { getI18nPlanetClass, getI18nPlanetType } from '@/core/utils/i18n-utils';
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'

function listPlanetTypeValues(): PlanetType[] {
  return Object.entries(PlanetType).filter(([_, elem]) => Number.isInteger(elem)).map(([_, v]) => v) as PlanetType[]
}
function listPlanetClassValues(): PlanetClass[] {
  return Object.entries(PlanetClass)
    .filter(([_, elem]) => Number.isInteger(elem))
    .filter(([name, _]) => name.includes(PlanetType[LG_PLANET_DATA.value.planetType]))
    .map(([_, v]) => v) as PlanetClass[]
}
</script>
