<template>
  <p>
    <slot>ParameterName</slot>
  </p>
  <div class="color-wrapper">
    <span class="current-color" :style="{ backgroundColor: `#${lgColor?.getHexString()}` }" @click="togglePanel"></span>
    <LgvButton
      class="sm"
      :class="{ success: pickerOpen }"
      :aria-label="$t('a11y.action_open_colorpanel')"
      :icon="pickerOpen ? 'mingcute:check-line' : 'mingcute:edit-2-line'"
      @click="togglePanel"
    />
  </div>
  <ColorPicker
    v-show="pickerOpen"
    class="picker"
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
import LgvButton from '@/_lib/components/LgvButton.vue'
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
  border-radius: 2px;
  border: 1px solid var(--lg-accent);
  cursor: pointer;
}
.panel {
  display: none;
}
</style>
