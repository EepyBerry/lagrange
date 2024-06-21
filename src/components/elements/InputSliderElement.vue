<template>
  <div class="lg-input-wrapper">
    <input
      type="range"
      class="lg"
      :id="id ?? undefined"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      aria-label="Input slider"
      :value="vModel"
      @input="set($event)">
    <input
      :id="id"
      class="lg"
      type="number"
      :min="min ?? 0"
      :max="max ?? 100"
      :step="step ?? 1"
      aria-label="Parameter input"
      v-model="vModel">
  </div>
</template>

<script setup lang="ts">
const vModel = defineModel<number>()
defineProps<{ id?: string, step?: number, min?: number, max?: number }>()
function set(ev: Event) {
  vModel.value = (ev.target as HTMLInputElement).valueAsNumber
}
</script>

<style scoped lang="scss">
.lg-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;

  &.xs input.lg[type=range] {
    width: 4rem;
  }
  &.sm input.lg[type=range] {
    width: 6rem;
  }
  &.md input.lg[type=range] {
    width: 8rem;
  }
  &.fw input.lg[type=range] {
    width: 100%;
  }
}

input.lg[type=number] {
  max-width: 3rem;
  text-align: end;
}
input.lg[type=range] {
  -webkit-appearance: none;
  width: 8rem;
  appearance: none;
  padding: 0;
  min-height: 1.5rem;
  height: 1rem;
  background: var(--lg-input);
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 4px;
    height: 1.5rem;
    background: var(--lg-contrast);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    background: var(--lg-contrast);
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
</style>