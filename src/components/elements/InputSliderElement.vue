<template>
  <div class="lg-input-wrapper">
    <div class="lg-input-wrapper-slider">
      <input
        class="lg"
        type="range"
        :id="iid ?? undefined"
        :min="min ?? 0"
        :max="max ?? 100"
        :step="step ?? 1"
        :value="vModel"
        @input="set($event)"
      />
      <span class="rgb"></span>
    </div>
    
    <input
      :aria-labelledby="iid"
      class="lg"
      type="number"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      v-model="vModel"
    />
  </div>
</template>

<script setup lang="ts">
const vModel = defineModel<number>()
defineProps<{ iid?: string; step?: number; min?: number; max?: number }>()
function set(ev: Event) {
  vModel.value = (ev.target as HTMLInputElement).valueAsNumber
}
</script>

<style scoped lang="scss">
.lg-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  font-family: monospace;

  &.xs input.lg[type='range'] {
    width: 4rem;
  }
  &.sm input.lg[type='range'] {
    width: 6rem;
  }
  &.md input.lg[type='range'] {
    width: 8rem;
  }
  &.fw input.lg[type='range'] {
    width: 100%;
  }

  .lg-input-wrapper-slider {
    display: inline-flex;
    position: relative;
  }
}

// extras
.lg-input-wrapper:not(.rgb) span.rgb {
  display: none;
}
.lg-input-wrapper.rgb {
  .lg-input-wrapper-slider > input {
    margin-bottom: 4px;
    height: 1.25rem;
    min-height: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      height: 1.25rem;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  span.rgb {
    z-index: 0;
    display: initial;
    position: absolute;
    inset: auto 0 0;
    height: 3px;

    background: var(--lg-hue-background);
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    opacity: 0.5;
  }
}

// inputs
input.lg[type='number'] {
  width: 3rem;
  text-align: end;
}
input.lg[type='range'] {
  -webkit-appearance: none;
  width: 8rem;
  appearance: none;
  padding: 0;
  min-height: 1.5rem;
  height: 1rem;
  background: var(--lg-input);
  outline: none;

  &::-webkit-slider-thumb {
    z-index: 1;
    -webkit-appearance: none;
    appearance: none;
    width: 4px;
    height: 1.5rem;
    background: var(--lg-contrast-focus);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    z-index: 1;
    background: var(--lg-contrast-focus);
    border: none;
    border-radius: 2px;
    width: 4px;
    height: 1.5rem;
    cursor: pointer;
  }

  &:focus {
    background: var(--lg-input-focus);
  }

  &:focus::-webkit-slider-thumb,
  &:focus::-moz-range-thumb {
    background: var(--lg-contrast-focus);
    border: 1px solid var(--lg-text);
  }
}

@media screen and (max-width: 1023px) {
  input.lg[type='number'], input.lg[type='range'] {
    height: 2rem;
    font-size: 1rem;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 6px;
      height: 2rem;
      background: var(--lg-contrast-focus);
      cursor: pointer;
    }

    &::-moz-range-thumb {
      background: var(--lg-contrast-focus);
      border: none;
      border-radius: 2px;
      width: 6px;
      height: 2rem;
      cursor: pointer;
    }
  }
  
  .lg-input-wrapper.rgb {
    .lg-input-wrapper-slider > input.lg[type='range'] {
      height: calc(2rem - 4px);

      &::-webkit-slider-thumb,
      &::-moz-range-thumb {
        height: calc(1rem - 4px);
        background: red
      }
    }
  }
}
</style>
