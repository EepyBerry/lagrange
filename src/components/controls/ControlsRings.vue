<template>
  <ParameterGrid>
    <ParameterCheckbox id="r-show" v-model="LG_PLANET_DATA.ringsEnabled" :true-value="true" :false-value="false">
      {{ $t('editor.controls.ring.ring_show') }}
    </ParameterCheckbox>
    <template v-if="LG_PLANET_DATA.ringsEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.ring.ring_list') }}</template>
        <template #content>
          <template v-for="(b, index) in LG_PLANET_DATA.ringsParams" :key="b.id">
            <!-- prettier-ignore-attribute -->
            <ParameterRing v-model="LG_PLANET_DATA.ringsParams[index]" :index="index" @delete="deleteRing" />
          </template>
          <button class="lg action-add" @click="addRing">
            <iconify-icon class="icon" icon="mingcute:add-line" width="1.25rem" aria-hidden="true" />
            {{ $t('editor.$action_add') }}
          </button>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { RingParameters } from '@/core/models/ring-parameters.model'
import { LG_PLANET_DATA } from '@core/services/planet-editor.service'
import ParameterRing from '../parameters/ParameterRing.vue'

function addRing() {
  const newRing = new RingParameters(LG_PLANET_DATA.value.changedProps, '_ringsParameters', 1.5, 1.75)
  LG_PLANET_DATA.value.ringsParams.push(newRing)
  LG_PLANET_DATA.value.markForChange('_ringsParameters')
}

function deleteRing(id: string) {
  const ringIdx = LG_PLANET_DATA.value.ringsParams.findIndex((b) => b.id === id)
  if (ringIdx < 0) {
    throw new Error('Cannot delete non-existent ring!')
  }
  LG_PLANET_DATA.value.ringsParams.splice(ringIdx, 1)
  LG_PLANET_DATA.value.markForChange('_ringsParameters')
}
</script>
<style scoped lang="scss">
.action-add {
  grid-column: span 2;
}
</style>
