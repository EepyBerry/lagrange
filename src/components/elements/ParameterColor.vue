<template>
  <tr class="field">
    <td class="color">
      <slot>ParameterName</slot>
    </td>
    <td class="color">
      <div class="color-wrapper">
        <span class="current-color" :style="{ backgroundColor: `#${lgColor?.getHexString()}` }"></span>
        <button ref="reference" class="lg edit" aria-label="Open color panel">
          <iconify-icon class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
      <ColorPicker
        ref="floating"
        :style="floatingStyles"
        alpha-channel="hide"
        default-format="rgb"
        :color="'#' + lgColor?.getHexString()"
        @color-change="setColor($event.colors.rgb)"
      >
        <template #hue-range-input-label>
          <span class="visually-hidden">Hue</span>
        </template>

        <template #alpha-range-input-label>
          <span class="visually-hidden">Alpha</span>
        </template>
      </ColorPicker>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { autoUpdate, offset, useFloating } from '@floating-ui/vue';
import type { Color, RGB } from 'three';
import { ref } from 'vue';
import { ColorPicker } from 'vue-accessible-color-picker'

const lgColor = defineModel<Color>()

const reference = ref(null)
const floating = ref(null)
const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right-start',
  middleware: [offset(10)],
  whileElementsMounted: autoUpdate,
})

function setColor(rgb: RGB) {
  lgColor.value?.setRGB(rgb.r / 255.0, rgb.g / 255.0, rgb.b / 255.0)
  console.log(lgColor.value?.getHexString())
}
</script>

<style scoped lang="scss">
tr.field {
  width: 100%;

  & > td.color {
    font-size: 0.875rem;
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>