<template>
  <div class="input-wrapper">
    <div class="input-wrapper-slider">
      <input
        :id="iid ?? undefined"
        class="lg"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="vModel"
        :disabled="disabled"
        @input="set($event)"
        :style="{ background: calculateTrackStyle() }"
      />
      <span class="rgb"></span>
    </div>

    <input
      v-model="vModel"
      :aria-labelledby="iid"
      class="lg"
      type="number"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
const vModel = defineModel<number>();
const $props = withDefaults(
  defineProps<{ iid?: string; step?: number; min?: number; max?: number; disabled?: boolean }>(),
  {
    min: 0,
    max: 100,
    step: 1,
  },
);
function set(ev: Event) {
  vModel.value = (ev.target as HTMLInputElement).valueAsNumber;
}
function calculateTrackStyle() {
  const clampedValuePct = (((vModel.value ?? 0) - $props.min) / ($props.max - $props.min)) * 100;
  if ($props.disabled) {
    return `linear-gradient(to right, var(--lg-button-disabled) 0, var(--lg-button-disabled) ${clampedValuePct}%, var(--lg-input-disabled) ${clampedValuePct}%, var(--lg-input-disabled) 100%)`;
  } else {
    return `linear-gradient(to right, var(--lg-input-contrast-focus) 0, var(--lg-input-contrast-focus) ${clampedValuePct}%, var(--lg-input) ${clampedValuePct}%, var(--lg-input) 100%)`;
  }
}
</script>

<style scoped lang="scss">
.input-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  font-family: monospace;

  .input-wrapper-slider {
    min-width: 2rem;
    display: inline-flex;
    position: relative;
  }
}

// inputs
input[type='number'] {
  width: 3rem;
}
input[type='range'] {
  width: 100%;
  min-width: 0;
}

// extras
.input-wrapper.rgb {
  .input-wrapper-slider > input {
    background: var(--lg-hue-background);
  }
}

@media screen and (max-width: 1023px) {
  input[type='number'] {
    height: 2rem;
    font-size: 1rem;
  }
  input[type='range'] {
    height: 1.5rem;
    font-size: 1rem;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      background: var(--lg-input-contrast-focus);
      width: 16px;
      height: 2rem;
      cursor: pointer;
    }
    &::-moz-range-thumb {
      background: var(--lg-input-contrast-focus);
      width: 16px;
      height: 2rem;
      cursor: pointer;
    }
  }
}

@media screen and (max-width: 567px) {
  .input-wrapper,
  .input-wrapper-slider {
    width: 100%;
  }
  input[type='range'] {
    width: 100%;
    text-align: end;
    flex: 1;
  }
  input[type='number'] {
    width: 4rem;
    min-width: 4rem;
  }
}
</style>
