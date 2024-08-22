<template>
  <p>
    <slot>ParameterName</slot>
  </p>
  <div class="container">
    <div ref="htmlColorRamp" class="color-ramp" @click="togglePanel">
      <template v-for="step of lgColorRamp?.definedSteps" :key="step.id">
        <span
          ref="htmlColorSteps"
          class="color-step"
          :style="{
            left: `${step.factor * 100}%`,
            display: step.isBound ? 'none' : 'initial',
          }"
        >
        </span>
      </template>
      <div v-show="mode === 'rgba'" ref="htmlAlphaRamp" class="alpha-ramp"></div>
    </div>
    <button
      class="lg edit"
      :class="{ 'success': panelOpen }"
      :aria-label="$t('a11y.action_edit_ramp')"
      @click="togglePanel"
    >
      <iconify-icon v-if="panelOpen" class="icon" icon="mingcute:check-line" width="1.25rem" aria-hidden="true" />
      <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
    </button>
  </div>
  <table v-show="panelOpen" class="panel-table">
    <template v-for="step of lgColorRamp?.definedSteps" :key="step.id">
      <tr>
        <td class="action">
          <button
            v-if="!lgColorRamp?.isBoundStep(step.id) && mode !== 'opacity'"
            class="lg warn"
            :aria-label="$t('a11y.action_open_colorpanel')"
            @click="removeStep(step.id)"
            :disabled="pickerIdOpen === step.id"
          >
            <iconify-icon class="icon" icon="mingcute:delete-2-line" width="1.25rem" aria-hidden="true" />
          </button>
        </td>
        <td>
          <div class="factor-wrapper">
            <span></span>
            <span v-if="lgColorRamp?.isBoundStep(step.id)">{{ step.factor }}</span>
            <InputSliderElement
              v-else
              ref="htmlFactorInputs"
              class="lg wrapper-input"
              :id="step.id"
              :min="0.001"
              :max="0.999"
              :step="0.001"
              :aria-label="$t('a11y.editor_generic_input')"
              v-model="step.factor"
              @input="updateStepFactor(step.id, $event)"
            />
          </div>
        </td>
        <td>
          <div class="color-wrapper">
            <span
              class="current-color"
              :style="{ backgroundColor: `#${step.color.getHexString()}` }"
              @click="togglePicker(step.id)">
              <div v-show="mode === 'rgba'" class="alpha-color" :style="{ background: alphaToGrayscale(step.alpha, true) }"></div>
            </span>
            <button
              class="lg edit"
              :class="{ 'success': pickerIdOpen === step.id }"
              :aria-label="$t('a11y.action_open_colorpanel')"
              @click="togglePicker(step.id)"
            >
              <iconify-icon
                v-if="pickerIdOpen === step.id"
                class="icon"
                icon="mingcute:check-line"
                width="1.25rem"
                aria-hidden="true"
              />
              <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
            </button>
          </div>
        </td>
      </tr>
      <tr v-if="pickerIdOpen === step.id">
        <td colspan="4" class="picker-wrapper">
          <ColorPicker
            default-format="hex"
            :alpha-channel="mode === 'rgba' ? 'show' : 'hide'"
            :color="pickerIdInitColor"
            @color-change="updateStepColor(step, $event.colors.hex)"
          >
            <template #hue-range-input-label>
              <span class="visually-hidden">Hue</span>
            </template>
          </ColorPicker>
        </td>
      </tr>
    </template>
    <tr v-if="['rgb', 'rgba'].includes(mode ?? 'rgb') || !mode">
      <td colspan="4">
        <div class="add-step">
          <button class="lg" @click="addStep()" :aria-label="$t('a11y.action_add_colorstep')">
            <iconify-icon class="icon" icon="mingcute:add-line" width="1.25rem" aria-hidden="true" />
            {{ $t('editor.$action_add') }}
          </button>
          <iconify-icon class="icon" icon="ph:dot-outline-fill" width="1.25rem" aria-hidden="true" />
          <button class="lg" @click="sortSteps()" :aria-label="$t('a11y.action_sort_colorsteps')">
            <iconify-icon
              class="icon"
              icon="mingcute:numbers-09-sort-ascending-line"
              width="1.25rem"
              aria-hidden="true"
            />
            {{ $t('editor.$action_sort') }}
          </button>
        </div>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import { ColorPicker } from 'vue-accessible-color-picker'
import InputSliderElement from '../elements/InputSliderElement.vue'
import { ColorRamp, type ColorRampStep } from '@/core/models/color-ramp.model'

const lgColorRamp = defineModel<ColorRamp>()

const htmlAlphaRamp: Ref<HTMLElement | null> = ref(null)
const htmlColorRamp: Ref<HTMLElement | null> = ref(null)
const htmlColorSteps: Ref<HTMLElement[]> = ref([])
const htmlFactorInputs: Ref<HTMLInputElement[]> = ref([])

const panelOpen = ref(false)
const pickerIdOpen: Ref<string | null> = ref(null)
const pickerIdInitColor = ref('')

const $props = defineProps<{ mode?: 'rgb' | 'rgba' | 'opacity' }>()
watch(() => lgColorRamp.value?.definedSteps, () => updateRamp())
onMounted(() => updateRamp())

function updateRamp() {
  if (!lgColorRamp.value) {
    return
  }
  const gradient: string[] = []
  const alphaGradient: string[] = []
  for (let i = 0; i < lgColorRamp.value!.definedSteps.length; i++) {
    const step = lgColorRamp.value!.definedSteps[i]
    const rgb = step.color.getHexString()
    const a = Math.ceil(step.alpha*255).toString(16)
    gradient.push(`#${rgb} ${step.factor * 100.0}%`)
    alphaGradient.push(`#${a+a+a} ${step.factor * 100.0}%`)
  }
  htmlColorRamp.value!.style.background = `linear-gradient(90deg, ${gradient.join(', ')})`
  htmlAlphaRamp.value!.style.background = `linear-gradient(90deg, ${alphaGradient.join(', ')})`
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value
}

function togglePicker(id: string): void {
  // Update picker
  if (pickerIdOpen.value === id) {
    pickerIdOpen.value = null
  } else {
    const step = lgColorRamp.value!.getStep(id)
    const rgb = step.color.getHexString()
    const a = alphaToGrayscale(step.alpha)
    pickerIdInitColor.value = `#${rgb}${a}`
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
  const htmlInput = e.target as HTMLInputElement
  if (!htmlInput.valueAsNumber || isNaN(htmlInput.valueAsNumber)) {
    return
  }
  lgColorRamp.value?.updateStep(id, { factor: htmlInput.valueAsNumber })
  updateRamp()
}
function updateStepColor(step: ColorRampStep, c: string) {
  const intAlpha = parseInt(c.substring(7), 16)
  const floatAlpha = parseFloat((intAlpha/255.0).toFixed(2))
  const alpha = $props.mode === 'rgba' ? floatAlpha : 1.0
  lgColorRamp.value?.updateStep(step.id, { color: c.substring(0, 7), alpha })
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

// Misc functions

function alphaToGrayscale(alpha: number, full = false): string {
  const hex = Math.ceil(alpha*255).toString(16).padStart(2, '0')
  return full ? `#${hex+hex+hex}` : hex
}

</script>

<style scoped lang="scss">
p {
  grid-column: span 2;
}
.container {
  grid-column: span 2;
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
  overflow: hidden;
  cursor: pointer;

  .color-step {
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    border-left: 1px solid var(--lg-accent);
    border-right: 1px solid var(--lg-accent);
    background: white;
    width: 4px;
  }
}

.picker-wrapper {
  padding-bottom: 1rem;
}
.panel-table {
  grid-column: span 2;
  width: 100%;
  border-spacing: 0.5rem 0.125rem;
  padding: 0.375rem 0;

  border-radius: 4px;
  border: 1px solid var(--lg-input);
  background: var(--lg-panel);

  td {
    text-align: end;
  }
  .factor-wrapper {
    display: flex;
    justify-content: space-between;
    flex: 1;
    .wrapper-input {
      flex: 1;
      & > :deep(.lg-input-wrapper-slider) {
        flex: 1;
        input { flex: 1; }
      }
    }
  }
  .color-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    height: 100%;
    justify-self: end;
  }
  .current-color {
    position: relative;
    display: inline-flex;
    align-self: center;
    width: 3rem;
    height: 2rem;
    border-radius: 4px;
    border: 1px solid var(--lg-accent);
    cursor: pointer;
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

.alpha-ramp, .alpha-color {
  position: absolute;
  inset: auto 0 0;
  height: 4px;
  border-top: 1px solid var(--lg-input);
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
input.lg:not([type='checkbox'], [type='radio']) {
  width: 3rem;
}
@media screen and (max-width: 1023px) {
  .panel-table {
    border-spacing: 0.5rem;
    font-size: 1rem;
  }
}
</style>
