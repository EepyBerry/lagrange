<template>
  <tr class="field">
    <td colspan="2">
      <slot>ParameterName</slot>
    </td>
  </tr>
  <tr class="field">
    <td colspan="2">
      <div class="container">
        <div class="color-ramp" ref="htmlColorRamp">
          <template v-for="_ of lgColorRamp?.steps" :key="_.factor">
            <span ref="htmlColorSteps" class="color-step"></span>
          </template>
        </div>
        <button
          class="lg edit"
          aria-label="Edit ramp"
          @click="togglePanel()"
        >
          <iconify-icon v-if="panelOpen" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
          <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
    </td>
  </tr>
  <tr v-if="panelOpen">
    <td colspan="2">
      <table class="panel-table">
        <tbody>
          <tr v-for="(step, index) of lgColorRamp?.definedSteps" :key="step.factor" class="field">
            <td>
              <label :for="'step'+index.toString()">Step data</label>
              <input :id="'step'+index.toString()" class="lg" type="number" :value="step.factor">
            </td>
            <td class="color">
            <div class="color-wrapper">
              <span class="current-color" :style="{ backgroundColor: `#${step.color.getHexString()}` }"></span>
              <button
                class="lg icon-button"
                aria-label="Open color panel"
                @click="togglePanel()"
              >
                <iconify-icon class="icon" icon="mingcute:delete-line" width="1.25rem" aria-hidden="true" />
              </button>
            </div>
          </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ColorRamp } from '@/core/models/color-ramp.model';
import { onMounted, ref, type Ref } from 'vue';
const lgColorRamp = defineModel<ColorRamp>()
const htmlColorRamp: Ref<HTMLElement|null> = ref(null)
const htmlColorSteps: Ref<HTMLElement[]> = ref([])

const panelOpen = ref(false)

onMounted(() => updateRamp())

function updateRamp() {
  const gradient: string[] = []
  for (let i = 0; i < lgColorRamp.value!.definedSteps.length; i++) {
    const htmlStep = htmlColorSteps.value[i]
    const step = lgColorRamp.value!.steps[i]
    htmlStep.style.display = [0,1].includes(step.factor) ? 'none' : 'initial'
    htmlStep.style.left = `${step.factor * 100}%`
    gradient.push(`#${step.color.getHexString()} ${step.factor * 100.0}%`)
  }
  htmlColorRamp.value!.style.background = `linear-gradient(90deg, ${gradient.join(', ')})`
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value
}
</script>

<style scoped lang="scss">
.field {
  font-size: 0.875rem;

  .container {
    width: 100%;
    font-size: 0.875rem;
    white-space: nowrap;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
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

.panel-table {
  width: 100%;
  border-collapse: inherit;
  border-spacing: inherit;
  .color-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 100%;
  }
  .current-color {
    display: inline-flex;
    align-self: center;
    width: 3rem;
    height: 2rem;
    border-radius: 4px;
    border: 1px solid var(--lg-accent);
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
input.lg {
  text-align: end;
}
input.lg:not([type=checkbox],[type=radio]) {
  max-width: 3rem;
}
</style>