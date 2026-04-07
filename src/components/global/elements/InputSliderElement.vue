<template>
  <div class="input-wrapper">
    <div class="input-wrapper-slider">
      <input
        :id="iid ?? undefined"
        class="lg"
        type="range"
        :min="min ?? 0"
        :max="max ?? 100"
        :step="step ?? 1"
        :value="vModel"
        :disabled="disabled"
        @input="set($event)"
      />
      <span class="rgb"></span>
    </div>

    <input
      v-model="vModel"
      :aria-labelledby="iid"
      class="lg"
      type="number"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
const vModel = defineModel<number>();
defineProps<{ iid?: string; step?: number; min?: number; max?: number; disabled?: boolean }>();
function set(ev: Event) {
  vModel.value = (ev.target as HTMLInputElement).valueAsNumber;
}
</script>

<style scoped lang="scss">
.input-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-family: monospace;

  &.xs input[type='range'] {
    width: 4rem;
  }
  &.sm input[type='range'] {
    width: 6rem;
  }
  &.md input[type='range'] {
    width: 7rem;
  }
  &.fw input[type='range'] {
    width: 100%;
  }

  .input-wrapper-slider {
    display: inline-flex;
    position: relative;
  }
}

// inputs
input[type='number'] {
  width: 3rem;
}
input[type='range'] {
  width: 7rem;
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
