<template>
  <tr class="field">
    <td class="color">
      <slot>ParameterName</slot>
    </td>
    <td class="color">
      <div class="color-wrapper">
        <span class="current-color" :style="{ backgroundColor: `#${lgColor?.getHexString()}` }"></span>
        <button ref="reference"
          class="lg edit"
          aria-label="Open color panel"
          @click="togglePanel()"
          @keydown.enter="togglePanel()"
        >
          <iconify-icon class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
      <ColorPicker
        ref="floating"
        class="panel"
        :style="floatingStyles"
        alpha-channel="hide"
        default-format="rgb"
        @color-change="setColor($event.colors.rgb)"
        @focusout="closePanel()"
      >
        <template #hue-range-input-label>
          <span class="visually-hidden">Hue</span>
        </template>
      </ColorPicker>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { autoUpdate, offset, useFloating } from '@floating-ui/vue';
import { Color, type RGB } from 'three';
import { ref, type Ref } from 'vue';
import { ColorPicker } from 'vue-accessible-color-picker'

const divider = 255.0
const lgColor = defineModel<Color>()

const reference: Ref<any|null> = ref(null)
const floating: Ref<any|null> = ref(null)
const { floatingStyles } = useFloating(reference, floating, {
  placement: 'right-start',
  middleware: [offset(10)],
  whileElementsMounted: autoUpdate,
})

function setColor(rgb: RGB): void {
  lgColor.value = new Color(rgb.r / divider, rgb.g / divider, rgb.b / divider)
}

function togglePanel(): void {
  floating.value!.$el.style.display = isPanelOpen() ? '' : 'block'
}
function closePanel(): void {
  floating.value!.$el.style.display = ''
}

function isPanelOpen(): boolean {
  return floating.value!.$el.style.display === 'block'
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
.panel {
  display: none;
}
</style>