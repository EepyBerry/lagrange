<template>
  <div class="color-ramp">
    <template v-for="step of colorRamp?.steps" :key="step.factor">
      <input type="hidden" :value="step">
    </template>
  </div>
</template>

<script setup lang="ts">
import { ColorRamp } from '@/core/models/color-ramp.model';
import { onMounted, ref } from 'vue';
const colorRamp = defineModel<ColorRamp>()
const colors = ref(0)

onMounted(() => {

})

function updateRamp() {
  colorRamp.value?.steps.forEach(s => {
    
  })
}

function addColor(color: string, factor: number) {
  colorRamp.value?.setStep(color, factor)
}
</script>

<style scoped lang="scss">
.color-ramp {
  height: 1rem;
  width: 100%;
}
</style>