<template>
  <div class="lg-input-wrapper">
    <div class="lg-input-wrapper-slider">
      <input
        :id="iid ?? undefined"
        class="lg"
        type="range"
        :min="min ?? 0"
        :max="max ?? 100"
        :step="step ?? 1"
        :value="vModel"
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

    &::-webkit-slider-thumb {
      height: 1.25rem;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
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
    background: var(--lg-contrast-focus);
    border-radius: 2px;
    border: none;
    width: 4px;
    height: 1.5rem;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    z-index: 1;
    background: var(--lg-contrast-focus);
    border-radius: 2px;
    border: none;
    width: 4px;
    height: 1.5rem;
    cursor: pointer;
  }

  &:focus {
    background: var(--lg-input-focus);
  }
  &:focus::-webkit-slider-thumb {
    background: var(--lg-contrast-focus);
    border: 1px solid var(--lg-text);
  }
  &:focus::-moz-range-thumb {
    background: var(--lg-contrast-focus);
    border: 1px solid var(--lg-text);
  }
}

@media screen and (max-width: 1023px) {
  input.lg[type='number'] {
    height: 2rem;
    font-size: 1rem;
  }
  input.lg[type='range'] {
    height: 2rem;
    font-size: 1rem;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      background: var(--lg-contrast-focus);
      width: 6px;
      height: 2rem;
      cursor: pointer;
    }
    &::-moz-range-thumb {
      background: var(--lg-contrast-focus);
      width: 6px;
      height: 2rem;
      cursor: pointer;
    }
  }

  .lg-input-wrapper.rgb {
    .lg-input-wrapper-slider > input.lg[type='range'] {
      height: calc(2rem - 4px);

      &::-webkit-slider-thumb {
        height: calc(2rem - 4px);
      }
      &::-moz-range-thumb {
        height: calc(2rem - 4px);
      }
    }
  }
}

@media screen and (max-width: 567px) {
  .lg-input-wrapper,
  .lg-input-wrapper-slider {
    width: 100%;
  }
  input.lg[type='range'] {
    width: 100%;
    text-align: end;
    flex: 1;
  }
  input.lg[type='number'] {
    width: 4rem;
    min-width: 4rem;
  }
}
</style>
