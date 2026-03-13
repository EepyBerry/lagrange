<template>
  <ParameterGrid>
    <ParameterCheckbox
      id="r-show"
      v-model="EDITOR_STATE.planetData.ringsEnabled"
      :true-value="true"
      :false-value="false"
    >
      {{ $t('editor.controls.ring.ring_show') }}
    </ParameterCheckbox>
    <template v-if="EDITOR_STATE.planetData.ringsEnabled">
      <ParameterGroup :toggleable="true">
        <template #title>{{ $t('editor.controls.ring.ring_list') }}</template>
        <template #content>
          <template v-for="(r, index) in EDITOR_STATE.planetData.ringsParams" :key="r.id">
            <!-- prettier-ignore-attribute -->
            <ParameterRing v-model="EDITOR_STATE.planetData.ringsParams[index]" :index="index" @delete="EDITOR_STATE.planetData.removeRing(r.id)" />
          </template>
          <LgvButton
            v-show="EDITOR_STATE.planetData.ringsParams.length < 8"
            class="sm action-add"
            icon="mingcute:add-line"
            @click="EDITOR_STATE.planetData.addRing()"
          >
            {{ $t('editor.$action_add') }}
          </LgvButton>
        </template>
      </ParameterGroup>
    </template>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterRing from '@components/global/parameters/ParameterRing.vue';
import LgvButton from '@/_lib/components/LgvButton.vue';
import { EDITOR_STATE } from '@/core/state/editor.state';
</script>
<style scoped lang="scss">
.action-add {
  grid-column: span 2;
}
</style>
