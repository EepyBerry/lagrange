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
          <LgvButton
            v-show="LG_PLANET_DATA.ringsParams.length < 8"
            class="sm action-add"
            icon="mingcute:add-line"
            @click="addRing"
          >
            {{ $t('editor.$action_add') }}
          </LgvButton>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import { LG_PLANET_DATA } from '@/core/services/editor.service';
import ParameterRing from '@components/global/parameters/ParameterRing.vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import { ChangeAction } from '@/core/models/change-tracker.model';
import type { RingParameters } from '@/core/models/ring-parameters.model';

function addRing() {
  LG_PLANET_DATA.value.markForChange('_ringsParams', undefined, ChangeAction.ADD);
}

function deleteRing(ringParams: RingParameters) {
  console.log(ringParams);
  LG_PLANET_DATA.value.markForChange('_ringsParams', { data: ringParams }, ChangeAction.DELETE);
}
</script>
<style scoped lang="scss">
.action-add {
  grid-column: span 2;
}
</style>
