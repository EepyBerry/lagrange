<template>
  <p>
    <slot>ParameterName</slot>
  </p>
  <div class="color-wrapper">
    <span
      class="current-color"
      :style="{ backgroundColor: `#${lgColor?.getHexString()}` }"
      @click="togglePanel"
    ></span>
    <button
      class="lg edit"
      :aria-label="$t('a11y.action_open_colorpanel')"
      :class="{ 'success': pickerOpen }"
      @click="togglePanel"
    >
      <iconify-icon v-if="pickerOpen" class="icon" icon="mingcute:check-line" width="1.25rem" aria-hidden="true" />
      <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
    </button>
  </div>
  <ColorPicker
    class="picker"
    v-show="pickerOpen"
    alpha-channel="hide"
    default-format="hex"
    :color="pickerInitColor"
    @color-change="setColor($event.colors.hex)"
  >
    <template #hue-range-input-label>
      <span class="visually-hidden">Hue</span>
    </template>
  </ColorPicker>
</template>

<script setup lang="ts">
import { Color } from 'three'
import { onMounted, ref, watch } from 'vue'
import { ColorPicker } from 'vue-accessible-color-picker'

const lgColor = defineModel<Color>()
const pickerInitColor = ref('')
const pickerOpen = ref(false)

onMounted(() => initPickerColor())
watch(
  () => lgColor.value?.getHexString(),
  () => initPickerColor(),
)

function initPickerColor() {
  pickerInitColor.value = '#' + lgColor.value?.getHexString()
}

function setColor(hex: string): void {
  lgColor.value = new Color(hex.substring(0, 7)) // Strip alpha
}

function togglePanel(): void {
  pickerOpen.value = !pickerOpen.value
}
</script>

<style scoped lang="scss">
.picker {
  grid-column: span 2;
}
.color-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: 100%;
}
.current-color {
  display: inline-flex;
  align-self: center;
  width: 3rem;
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--lg-accent);
  cursor: pointer;
}
.panel {
  display: none;
}
</style>
