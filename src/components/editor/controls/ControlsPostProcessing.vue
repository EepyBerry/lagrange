<template>
  <ParameterGrid>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.postprocessing.bloom') }}</template>
      <template #content>
      </template>
    </ParameterGroup>
    <ParameterGroup toggleable>
      <template #title>{{ $t('editor.controls.postprocessing.pixelation') }}</template>
      <template #content>
      </template>
    </ParameterGroup>
  </ParameterGrid>
</template>
<script setup lang="ts">
import ParameterGrid from "@components/global/parameters/ParameterGrid.vue";
import ParameterGroup from "@components/global/parameters/ParameterGroup.vue";
</script>
