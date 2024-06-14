<template>
  <tr class="field">
    <td colspan="3">
      <slot>ParameterName</slot>
    </td>
  </tr>
  <tr class="field">
    <td colspan="2">
      <div class="container">
        <div class="color-ramp" ref="htmlColorRamp">
          <template v-for="_ of colorRamp?.steps" :key="_.factor">
            <span ref="htmlColorSteps" class="color-step"></span>
          </template>
        </div>
        <button class="edit" aria-label="Edit ramp">
          <iconify-icon class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
    </td>
    <td></td>
  </tr>
</template>

<script setup lang="ts">
import { ColorRamp } from '@/core/models/color-ramp.model';
import { onMounted, ref, type Ref } from 'vue';
const colorRamp = defineModel<ColorRamp>()
const htmlColorRamp: Ref<HTMLElement|null> = ref(null)
const htmlColorSteps: Ref<HTMLElement[]> = ref([])

onMounted(() => updateRamp())

function updateRamp() {
  const gradient: string[] = []
  for (let i = 0; i < htmlColorSteps.value.length; i++) {
    const htmlStep = htmlColorSteps.value[i]
    const step = colorRamp.value!.steps[i]
    htmlStep.style.display = [0.00,1.00].includes(step.factor) ? 'none' : 'initial'
    htmlStep.style.left = `${step.factor * 100}%`
    gradient.push(`#${step.color.getHexString()} ${step.factor * 100.0}%`)
  }
  htmlColorRamp.value!.style.background = `linear-gradient(90deg, ${gradient.join(', ')})`
  console.log(gradient)
}

function addColor(color: string, factor: number) {
  colorRamp.value?.setStep(color, factor)
}

</script>

<style scoped lang="scss">
.field {
  font-size: 0.875rem;
}
.container {
  width: 100%;
  font-size: 0.875rem;
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.color-ramp {
  position: relative;
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--lg-accent);
  width: 100%;

  .color-step {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px solid var(--lg-accent);
    border-right: 1px solid var(--lg-accent);
    background-color: white;
    width: 4px;
  }
}

button.edit {
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  
  .icon {
    color: white;
    padding: 4px;
  }
}
</style>