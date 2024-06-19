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
          <template v-for="step of lgColorRamp?.definedSteps" :key="step.id">
            <span ref="htmlColorSteps" class="color-step"></span>
          </template>
        </div>
        <button
          class="lg edit"
          :class="{ 'menu-expanded': panelOpen }"
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
          <template v-for="step of lgColorRamp?.definedSteps" :key="step.id">
            <tr>
              <td>
                <iconify-icon icon="mingcute:dots-line" width="1.5rem" aria-hidden="true" />
              </td>
              <td style="text-align: end;">
                <div v-if="lgColorRamp?.isBoundStep(step.id)" class="factor-wrapper">
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
                    @input="updateStepFactor(step.id, $event)"
                  >
                </div>
              </td>
              <td>
                <div class="color-wrapper">
                  <span class="current-color" :style="{ backgroundColor: `#${step.color.getHexString()}` }"></span>
                  <button
                    class="lg edit"
                    :class="{ 'menu-expanded': pickerIdOpen === step.id }"
                    aria-label="Open color panel"
                    @click="togglePicker(step.id)"
                  >
                    <iconify-icon v-if="pickerIdOpen === step.id" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
                    <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
                  </button>
                </div>
              </td>
              <td class="action">
                <button
                  v-if="!lgColorRamp?.isBoundStep(step.id)"
                  class="lg icon-button action"
                  aria-label="Open color panel"
                  @click="removeStep(step.id)"
                  :disabled="pickerIdOpen === step.id"
                >
                  <iconify-icon class="icon" icon="mingcute:delete-line" width="1.25rem" aria-hidden="true" />
                </button>
              </td>
            </tr>
            <tr v-if="pickerIdOpen === step.id">
              <td colspan="4">
                <ColorPicker
                  alpha-channel="hide"
                  default-format="hex"
                  :color="'#'+step.color.getHexString()"
                  @color-change="updateStepColor(step.id, $event.colors.hex)"
                >
                  <template #hue-range-input-label>
                    <span class="visually-hidden">Hue</span>
                  </template>
                </ColorPicker>
              </td>
            </tr>
          </template>
          <tr>
            <td colspan="4">
              <div class="add-step">
                <button class="lg" @click="addStep()" aria-label="Add color step">
                  <iconify-icon class="icon" icon="mingcute:add-line" width="1.25rem" aria-hidden="true" />
                </button>
                <iconify-icon class="icon" icon="ph:dot-outline-fill" width="1.25rem" aria-hidden="true" />
                <button class="lg" @click="sortSteps()" aria-label="Sort color steps">
                  <iconify-icon class="icon" icon="mingcute:numbers-09-sort-ascending-line" width="1.25rem" aria-hidden="true" />
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
import { onMounted, ref, type Ref } from 'vue';
import { ColorRamp } from '@/core/models/color-ramp.model';
import { ColorPicker } from 'vue-accessible-color-picker'

const lgColorRamp = defineModel<ColorRamp>()
const htmlColorRamp: Ref<HTMLElement|null> = ref(null)
const htmlColorSteps: Ref<HTMLElement[]> = ref([])

const panelOpen = ref(false)
const pickerIdOpen: Ref<string | null> = ref(null)

onMounted(() => updateRamp())

function updateRamp() {
  const gradient: string[] = []
  for (let i = 0; i < lgColorRamp.value!.definedSteps.length; i++) {
    const htmlStep = htmlColorSteps.value[i]
    const step = lgColorRamp.value!.definedSteps[i]
    htmlStep.style.display = step.isBound ? 'none' : 'initial'
    htmlStep.style.left = `${step.factor * 100}%`
    gradient.push(`#${step.color.getHexString()} ${step.factor * 100.0}%`)
  }
  htmlColorRamp.value!.style.background = `linear-gradient(90deg, ${gradient.join(', ')})`
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value
}

function togglePicker(id: string): void {
  if (pickerIdOpen.value === id) {
    pickerIdOpen.value = null
  } else {
    pickerIdOpen.value = id
  }
}

// Step operations

function sortSteps() {
  lgColorRamp.value?.sortSteps()
  pickerIdOpen.value = null
  setTimeout(updateRamp, 20)
}

function addStep() {
  lgColorRamp.value?.addStep()
  setTimeout(updateRamp, 20)
}

function updateStepFactor(id: string, e: Event) {
  lgColorRamp.value?.setStep(id, undefined, (e.target as HTMLInputElement).valueAsNumber)
  updateRamp()
}
function updateStepColor(id: string, c: string) {
  lgColorRamp.value?.setStep(id, c.substring(0, 7)) // strip alpha from color
  updateRamp()
}

function removeStep(id: string) {
  if (lgColorRamp.value?.isBoundStep(id)) {
    return
  }
  pickerIdOpen.value = null
  lgColorRamp.value?.removeStep(id)
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
  .action > button {
    float: right;
  }
  .add-step {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    & > button {
      flex: 1;
    }
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