<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.basic_data.classification') }}</template>
      <template #content>
        <ParameterSelect id="b-type" v-model="EDITOR_STATE.planetData.planetType" @change="resetPlanetClass">
          {{ $t('editor.controls.basic_data.classification_type') }}:
          <template #options>
            <option v-for="opt in listPlanetTypeValues()" :key="opt" :value="opt">
              {{ $t(getI18nPlanetType(opt)) }}
            </option>
          </template>
        </ParameterSelect>
        <ParameterSelect id="b-class" v-model="EDITOR_STATE.planetData.planetClass">
          {{ $t('editor.controls.basic_data.classification_class') }}:
          <template #options>
            <option v-for="opt in listPlanetClassValues()" :key="opt" :value="opt">
              {{ $t(getI18nPlanetClass(opt)) }}
            </option>
          </template>
        </ParameterSelect>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterSelect from '@/components/global/parameters/ParameterSelect.vue';
import { EDITOR_STATE } from '@/core/state/editor.state';
import { PlanetClass, PlanetType } from '@/core/types';
import { getI18nPlanetClass, getI18nPlanetType } from '@/core/utils/i18n-utils';

function listPlanetTypeValues(): PlanetType[] {
  return Object.entries(PlanetType)
    .filter(([_, elem]) => Number.isInteger(elem))
    .map(([_, v]) => v) as PlanetType[];
}
function listPlanetClassValues(): PlanetClass[] {
  return EDITOR_STATE.value.planetData.getPlanetClassesFromType(EDITOR_STATE.value.planetData.planetType);
}

function resetPlanetClass() {
  EDITOR_STATE.value.planetData.planetClass = PlanetClass.INDETERMINATE;
}
</script>
