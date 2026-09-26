<template>
  <p>
    <slot>ParameterName</slot>
  </p>
  <div class="color-ramp-header">
    <div ref="htmlColorRamp" class="color-ramp" @click="togglePanel">
      <template v-for="step of lgColorRamp?.steps" :key="step.id">
        <span
          ref="htmlColorSteps"
          class="color-step"
          :style="{
            left: `${step.factor * 100}%`,
          }"
        >
        </span>
      </template>
      <div v-show="mode === 'rgba'" ref="htmlAlphaRamp" class="alpha-indicator__ramp" />
    </div>
    <LgvButton
      variant="dark"
      class="sm"
      :icon="panelOpen ? 'mingcute:down-fill' : 'mingcute:right-fill'"
      :a11y-label="$t('a11y.action_edit_ramp')"
      @click="togglePanel"
    />
  </div>
  <table v-show="panelOpen" class="color-ramp-table">
    <template v-for="step of lgColorRamp?.steps" :key="step.id">
      <tr>
        <td class="action">
          <LgvButton
            v-if="mode !== 'opacity'"
            variant="icon"
            class="sm warn"
            icon="mingcute:delete-2-line"
            :disabled="pickerIdOpen === step.id || (lgColorRamp?.steps.length ?? 0) <= 1"
            :a11y-label="$t('a11y.action_open_colorpanel')"
            @click="removeStep(step.id)"
          />
        </td>
        <td>
          <div class="factor-wrapper">
            <span></span>
            <InputSliderElement
              :id="step.id"
              ref="htmlFactorInputs"
              v-model="step.factor"
              class="wrapper-input"
              :min="0"
              :max="1"
              :step="0.001"
              :aria-label="$t('a11y.editor_generic_input')"
              @input="updateStepFactor(step.id, $event)"
            />
          </div>
        </td>
        <td>
          <div class="color-wrapper" :ref="(el) => (stepAnchorRefs[step.id] = el as HTMLElement)">
            <LgvButton
              class="action-edit-color sm"
              :style="{ backgroundColor: `#${step.color.getHexString()}` }"
              @click="togglePicker(step.id)"
            >
              <iconify-icon class="action-edit-color__icon" icon="mingucte:edit-2-line" width="1rem" />
              <div
                v-show="mode === 'rgba'"
                class="alpha-indicator__color"
                :style="{ background: alphaToGrayscale(step.alpha, true) }"
              ></div>
            </LgvButton>
          </div>
        </td>
      </tr>
    </template>
    <tr v-if="['rgb', 'rgba'].includes(mode ?? 'rgb')">
      <td colspan="4">
        <div class="add-step">
          <LgvButton class="sm" icon="ph:plus" @click="addStep()">
            {{ $t('editor.$action_add') }}
          </LgvButton>
          <LgvButton class="sm" icon="mingcute:numbers-09-sort-ascending-line" @click="sortSteps()">
            {{ $t('editor.$action_sort') }}
          </LgvButton>
        </div>
      </td>
    </tr>
  </table>

  <!------ floating elements ------>
  <Teleport to="body">
    <div v-if="pickerIdOpen !== null" ref="floatingColorPicker" class="floating color-picker" :style="floatingStyles">
      <ColorPicker
        :key="pickerIdOpen"
        default-format="hex"
        :alpha-channel="mode === 'rgba' ? 'show' : 'hide'"
        :color="pickerIdInitColor"
        @color-change="updateCurrentStepColor($event)"
      >
        <template #hue-range-input-label>
          <span class="a11y--visually-hidden"></span>
        </template>
        <template #alpha-range-input-label>
          <span class="a11y--visually-hidden"></span>
        </template>
      </ColorPicker>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import InputSliderElement from '@components/global/elements/InputSliderElement.vue';
import { ColorRamp, type ColorRampStep } from '@core/models/planet/color-ramp.model.ts';
import { alphaToGrayscale, colorRampToStyle } from '@core/utils/render-utils';
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/vue';
import LgvButton from '@lib/components/base/LgvButton.vue';
import { onClickOutside, useEventListener } from '@vueuse/core';
import { onMounted, onUnmounted, ref, useTemplateRef, watch, type Ref } from 'vue';
import { ColorPicker, type ColorChangeDetail } from 'vue-accessible-color-picker';

const lgColorRamp = defineModel<ColorRamp>();

const htmlAlphaRamp: Ref<HTMLElement | null> = ref(null);
const htmlColorRamp: Ref<HTMLElement | null> = ref(null);

const panelOpen = ref(false);
const pickerIdOpen: Ref<string | null> = ref(null);
const pickerIdInitColor = ref('');

const floatingColorPicker = useTemplateRef('floatingColorPicker');
const anchorRef = ref<HTMLElement | null>(null);
const stepAnchorRefs = ref<Record<string, HTMLElement | null>>({});

const { floatingStyles } = useFloating(anchorRef, floatingColorPicker, {
  whileElementsMounted: autoUpdate,
  placement: 'right-end',
  middleware: [offset(8), shift()],
});
const $props = defineProps<{ mode?: 'rgb' | 'rgba' | 'opacity' }>();

useEventListener(window, 'keydown', onKeydown);
onClickOutside(floatingColorPicker, () => closePicker(), { ignore: ['.color-wrapper'] });

onMounted(() => updateRamp());
onUnmounted(() => {
  if (pickerIdOpen.value !== null) {
    closePicker();
  }
});

watch(
  () => lgColorRamp.value?.hash,
  () => updateRamp(),
);

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === 'Escape' && pickerIdOpen.value !== null) {
    closePicker();
  }
}

function updateRamp() {
  if (!lgColorRamp.value) {
    return;
  }
  const rampStyle = colorRampToStyle(lgColorRamp.value!);
  htmlColorRamp.value!.style.background = rampStyle.color;
  htmlAlphaRamp.value!.style.background = rampStyle.alpha;
}

function togglePanel(): void {
  panelOpen.value = !panelOpen.value;
  if (!panelOpen.value) {
    closePicker();
  }
}

function togglePicker(id: string): void {
  if (pickerIdOpen.value === id) {
    closePicker();
  } else {
    pickerIdOpen.value = id;
    anchorRef.value = stepAnchorRefs.value[id] ?? null;
    const step = lgColorRamp.value!.getStep(id);
    const rgb = step.color.getHexString();
    const a = alphaToGrayscale(step.alpha);
    pickerIdInitColor.value = `#${rgb}${$props.mode === 'rgba' ? a : ''}`;
  }
}

function closePicker(): void {
  if (pickerIdOpen.value !== null) {
    pickerIdOpen.value = null;
    anchorRef.value = null;
  }
}

// Step operations

function sortSteps() {
  closePicker();
  lgColorRamp.value?.sortSteps();
  setTimeout(updateRamp, 20);
}

function addStep() {
  lgColorRamp.value?.addStep();
  setTimeout(updateRamp, 20);
}

function updateStepFactor(id: string, e: Event) {
  const htmlInput = e.target as HTMLInputElement;
  if (Number.isNaN(htmlInput.valueAsNumber)) {
    return;
  }
  lgColorRamp.value?.updateStep(id, { factor: htmlInput.valueAsNumber });
  updateRamp();
}

function updateCurrentStepColor(detail: ColorChangeDetail) {
  if (!pickerIdOpen.value) return;
  const step = lgColorRamp.value?.getStep(pickerIdOpen.value);
  if (!step) return;
  updateStepColor(step, detail);
}

function updateStepColor(step: ColorRampStep, detail: ColorChangeDetail) {
  const hex = detail.color.toString({ format: 'hex', collapse: false, alpha: false });
  const alpha = $props.mode === 'rgba' ? Number.parseFloat(detail.color.alpha.toFixed(2)) : 1;
  lgColorRamp.value?.updateStep(step.id, { color: hex, alpha });
  updateRamp();
}

function removeStep(id: string) {
  if ((lgColorRamp.value?.steps.length ?? 0) <= 1) {
    return;
  }
  if (pickerIdOpen.value === id) {
    closePicker();
  }
  lgColorRamp.value?.removeStep(id);
  updateRamp();
}
</script>

<style scoped lang="scss">
p {
  grid-column: span 2;
  font-size: 0.8125rem;
}
.color-ramp-header {
  grid-column: span 2;
  width: 100%;
  white-space: nowrap;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  & > .color-ramp {
    position: relative;
    height: 2rem;
    border: 1px solid var(--lg-accent);
    width: 100%;
    overflow: hidden;
    cursor: pointer;

    & > .color-step {
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
}
.color-ramp-table {
  grid-column: span 2;
  width: 100%;
  border-spacing: 0.5rem 0.125rem;
  padding: 0.375rem 0;

  border-radius: 2px;
  border: 1px solid var(--lg-accent);
  background: var(--lg-panel);

  td {
    text-align: end;
  }
  .factor-wrapper {
    font-size: 0.8125rem;
    display: flex;
    justify-content: space-between;
    flex: 1;
    .wrapper-input {
      flex: 1;
      & > :deep(.input-wrapper-slider) {
        flex: 1;
        input {
          flex: 1;
        }
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
  .action-edit-color {
    position: relative;
    display: inline-flex;
    align-self: center;
    border-radius: 2px;
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

  input {
    text-align: end;
  }
  input:not([type='checkbox'], [type='radio']) {
    width: 3rem;
  }
}

.floating.color-picker {
  z-index: 10;
  visibility: visible;
  padding: 0;
}

.alpha-indicator__ramp,
.alpha-indicator__color {
  position: absolute;
  inset: auto 0 0;
  height: 4px;
  border-top: 1px solid var(--lg-input);
}

button.edit {
  border: none;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;

  .icon {
    color: white;
    padding: 4px;
  }
}

@media screen and (max-width: 1023px) {
  .color-ramp-table {
    border-spacing: 0.5rem;
    font-size: 1rem;
  }
}
</style>
