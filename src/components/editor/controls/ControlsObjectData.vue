<template>
  <div>
    <LgvNotification id="object-data-notice" type="info">{{ $t('editor.basic_data.feature_notice') }}</LgvNotification>
    <ParameterGrid>
      <ParameterSelect id="d-type" v-model="EDITOR_STATE.planetData.planetType" @change="resetPlanetClass">
        {{ $t('editor.basic_data.classification_type') }}:
        <template #options>
          <option v-for="opt in listPlanetTypeValues()" :key="opt" :value="opt">
            {{ $t(getI18nPlanetType(opt)) }}
          </option>
        </template>
      </ParameterSelect>
      <ParameterSelect id="d-class" v-model="EDITOR_STATE.planetData.planetClass">
        {{ $t('editor.basic_data.classification_class') }}:
        <template #options>
          <option v-for="opt in listPlanetClassValues()" :key="opt" :value="opt">
            {{ $t(getI18nPlanetClass(opt)) }}
          </option>
        </template>
      </ParameterSelect>
    </ParameterGrid>
  </div>
</template>
<script setup lang="ts">
import { EDITOR_STATE } from '@core/editor/state/editor.state';
import LgvNotification from '@lib/components/custom/LgvNotification.vue';
import ParameterSelect from '@/components/global/parameters/ParameterSelect.vue';
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
<style scoped lang="scss">
#object-data-notice {
  margin-bottom: 0.5rem;
}
</style>
