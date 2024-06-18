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
          <template v-for="fac of lgColorRamp?.definedFactors" :key="fac">
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
          <template v-for="(step, index) of lgColorRamp?.definedSteps" :key="step.id">
            <tr>
              <td>
                <iconify-icon icon="mingcute:dots-line" width="1.5rem" aria-hidden="true" />
              </td>
              <td style="text-align: end;">
                <div v-if="lgColorRamp?.isBoundStep(index)" class="factor-wrapper">
                  <span>{{ step.factor }}</span>
                </div>
                <div v-else class="factor-wrapper">
                  <input
                    class="lg"
                    type="number"
                    min="0.001"
                    max="0.999"
                    step="0.001"
                    :value="step.factor"
                    @input="updateStepFactor(index, $event)"
                  >
                </div>
              </td>
              <td>
                <div class="color-wrapper">
                  <span class="current-color" :style="{ backgroundColor: `#${step.color.getHexString()}` }"></span>
                  <button
                    class="lg edit"
                    aria-label="Open color panel"
                    @click="togglePicker(index)"
                  >
                    <iconify-icon v-if="pickersOpen[index]" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
                    <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
                  </button>
                </div>
              </td>
              <td>
                <span class="action" v-if="lgColorRamp?.isBoundStep(index)"></span>
                <button
                  v-else
                  class="lg icon-button action"
                  aria-label="Open color panel"
                  @click="removeStep(index)"
                >
                  <iconify-icon class="icon" icon="mingcute:delete-line" width="1.25rem" aria-hidden="true" />
                </button>
              </td>
            </tr>
            <tr v-if="pickersOpen[index]">
              <td colspan="4">
                <ColorPicker
                  alpha-channel="hide"
                  default-format="hex"
                  :color="'#'+step.color.getHexString()"
                  @color-change="updateStepColor(index, $event.colors.hex)"
                >
                  <template #hue-range-input-label>
                    <span class="visually-hidden">Hue</span>
                  </template>
                </ColorPicker>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { ColorRamp } from '@/core/models/color-ramp.model';
import { ColorPicker } from 'vue-accessible-color-picker'

const lgColorRamp = defineModel<ColorRamp>()
const htmlColorRamp: Ref<HTMLElement|null> = ref(null)
const htmlColorSteps: Ref<HTMLElement[]> = ref([])

const panelOpen = ref(false)
const pickersOpen: Ref<boolean[]> = ref(Array(lgColorRamp.value?.definedSteps.length).fill(false))

onMounted(() => updateRamp())

function updateRamp() {
  const gradient: string[] = []
  for (let i = 0; i < lgColorRamp.value!.definedSteps.length; i++) {
    const htmlStep = htmlColorSteps.value[i]
    const step = lgColorRamp.value!.definedSteps[i]
    htmlStep.style.display = [0,1].includes(step.factor) ? 'none' : 'initial'
    htmlStep.style.left = `${step.factor * 100}%`
    gradient.push(`#${step.color.getHexString()} ${step.factor * 100.0}%`)
  }
  htmlColorRamp.value!.style.background = `linear-gradient(90deg, ${gradient.join(', ')})`
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value
}
function togglePicker(index: number): void {
  pickersOpen.value[index] = !pickersOpen.value[index]
}

// Step operations

function sortSteps() {
  //lgColorRamp.value?.sortSteps()
  pickersOpen.value.fill(false)
}

function updateStepFactor(index: number, e: Event) {
  lgColorRamp.value?.setStep(index, undefined, (e.target as HTMLInputElement).valueAsNumber)
  updateRamp()
}
function updateStepColor(index: number, c: string) {
  lgColorRamp.value?.setStep(index, c.substring(0, 7)) // strip alpha from color
  updateRamp()
}

function removeStep(index: number) {
  if (lgColorRamp.value?.isBoundStep(index)) {
    return
  }
  pickersOpen.value.splice(index, 1)
  lgColorRamp.value?.removeStep(index)
  updateRamp()
}

</script>

<style scoped lang="scss">
.container {
  width: 100%;
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

.panel-table {
  width: 100%;
  margin-top: 0.5rem;
  border-collapse: inherit;
  border-spacing: inherit;

  .color-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    height: 100%;
    justify-self: end;
  }
  .current-color {
    display: inline-flex;
    align-self: center;
    width: 3rem;
    height: 2rem;
    border-radius: 4px;
    border: 1px solid var(--lg-accent);
  }
  .action {
    min-width: 2rem;
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