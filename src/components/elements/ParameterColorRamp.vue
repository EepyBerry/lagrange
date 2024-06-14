<template>
  <tr class="field">
    <td colspan="3">
      <slot>ParameterName</slot>
    </td>
  </tr>
  <tr class="field">
    <td colspan="3" class="color-ramp">
      <template v-for="step of colorRamp?.steps" :key="step.factor">
        <div ref="htmlColorSteps" class="color-step">
          <span class="color-step factor">{{ step.factor * 100 }}</span>
        </div>
      </template>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ColorRamp } from '@/core/models/color-ramp.model';
import { onMounted, ref, type Ref } from 'vue';
const colorRamp = defineModel<ColorRamp>()
const colors = ref(0)

const htmlColorSteps: Ref<HTMLElement[]> = ref([])

onMounted(() => {
  for (let i = 0; i < htmlColorSteps.value.length; i++) {
    const htmlStep = htmlColorSteps.value[i]
    htmlStep.style.left = `${colorRamp.value!.steps[i].factor * 100}%`
  }
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
  position: relative;
  width: 100%;
  height: 2rem;
  background-color: red;
  display: flex;
  flex-direction: row;
  font-size: 0.75rem;

  .color-step {
    text-align: center;
    position: absolute;
  }
}
</style>