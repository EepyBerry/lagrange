<template>
  <tr class="field">
    <td class="color">
      <slot>ParameterName</slot>
    </td>
    <td class="color">
      <div class="color-wrapper">
        <span class="current-color" :style="{ backgroundColor: `#${lgColor?.getHexString()}` }"></span>
        <button
          class="lg edit"
          :aria-label="$t('a11y.action_open_colorpanel')"
          :class="{ 'menu-expanded': pickerOpen }"
          @click="togglePanel()"
        >
          <iconify-icon v-if="pickerOpen" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
          <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <ColorPicker
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
    </td>
  </tr>
</template>

<script setup lang="ts">
import { LG_PARAMETERS } from '@/core/globals';
import { Color } from 'three';
import { onMounted, ref, watch } from 'vue';
import { ColorPicker } from 'vue-accessible-color-picker'

const lgColor = defineModel<Color>()
const pickerInitColor = ref('')
const pickerOpen = ref(false)

onMounted(() => initPickerColor())
watch(() => lgColor.value?.getHexString(), () => initPickerColor())

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
tr.field {
  width: 100%;

  & > td.color {
    text-wrap: nowrap;
    height: 100%;
  }
  & > td.color:first-of-type {
      width: 100%;
      white-space: nowrap;
  }
  & > td.color:last-of-type {
    width: auto;
    min-width: 10px;
    padding-left: 4px;
    text-align: end;
  }
}
.color-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  height: 100%;
}
.current-color {
  display: inline-flex;
  align-self: center;
  width: 3rem;
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--lg-accent);
}
.panel {
  display: none;
}
</style>