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
          aria-label="Open color panel"
          @click="togglePanel()"
        >
          <iconify-icon v-if="_panelOpen" class="icon" icon="mingcute:close-line" width="1.25rem" aria-hidden="true" />
          <iconify-icon v-else class="icon" icon="mingcute:edit-2-line" width="1.25rem" aria-hidden="true" />
        </button>
      </div>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <ColorPicker
        v-show="_panelOpen"
        alpha-channel="hide"
        default-format="hex"
        @color-change="setColor($event.colors.rgb)"
      >
        <template #hue-range-input-label>
          <span class="visually-hidden">Hue</span>
        </template>
      </ColorPicker>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { Color, type RGB } from 'three';
import { onMounted, ref, type Ref } from 'vue';
import { ColorPicker } from 'vue-accessible-color-picker'

const divider = 255.0
const lgColor = defineModel<Color>()
const panelColor = ref('')

const _panelOpen = ref(false)

onMounted(() => panelColor.value = lgColor.value?.getHexString() || '')

function setColor(rgb: RGB): void {
  lgColor.value = new Color(rgb.r / divider, rgb.g / divider, rgb.b / divider)
}

function togglePanel(): void {
  _panelOpen.value = !_panelOpen.value
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