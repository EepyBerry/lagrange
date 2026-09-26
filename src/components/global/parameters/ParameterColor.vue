<template>
  <p>
    <slot>ParameterName</slot>
  </p>
  <div ref="anchorRef" class="color-wrapper">
    <LgvButton
      class="action-edit-color sm"
      :style="{ backgroundColor: `#${lgColor?.getHexString()}` }"
      @click="togglePanel"
    ></LgvButton>
  </div>

  <!------ floating elements ------>
  <Teleport to="body">
    <div v-if="pickerOpen" ref="floatingColorPicker" class="floating color-picker" :style="floatingStyles">
      <ColorPicker
        alpha-channel="hide"
        default-format="hex"
        :visible-formats="['hex']"
        :color="pickerInitColor"
        @color-change="setColor($event)"
      >
        <template #hue-range-input-label>
          <span class="a11y--visually-hidden"></span>
        </template>
        <template #alpha-range-input-label>
          <span class="a11y--visually-hidden"></span>
        </template>
      </ColorPicker>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { autoUpdate, offset, shift, useFloating } from '@floating-ui/vue';
import LgvButton from '@lib/components/base/LgvButton.vue';
import { onClickOutside, useEventListener } from '@vueuse/core';
import { Color } from 'three';
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import { ColorPicker, type ColorChangeDetail } from 'vue-accessible-color-picker';

const lgColor = defineModel<Color>();
const pickerInitColor = ref('');
const pickerOpen = ref(false);

const floatingColorPicker = useTemplateRef('floatingColorPicker');
const anchorRef = ref<HTMLElement | null>(null);

const { floatingStyles } = useFloating(anchorRef, floatingColorPicker, {
  whileElementsMounted: autoUpdate,
  placement: 'right-end',
  middleware: [offset(8), shift()],
});

useEventListener(window, 'keydown', onKeydown);
onClickOutside(floatingColorPicker, () => closePicker(), { ignore: ['.color-wrapper'] });

onMounted(initPickerColor);
onUnmounted(() => {
  if (pickerOpen.value) {
    closePicker();
  }
});

function onKeydown(evt: KeyboardEvent) {
  if (evt.key === 'Escape' && pickerOpen.value) {
    closePicker();
  }
}

function initPickerColor() {
  pickerInitColor.value = '#' + (lgColor.value?.getHexString() ?? 'ffffff');
}

function setColor(detail: ColorChangeDetail): void {
  const hex = detail.color.toString({ format: 'hex', collapse: false, alpha: false });
  lgColor.value = new Color(hex);
}

function togglePanel(): void {
  if (pickerOpen.value) {
    closePicker();
  } else {
    openPicker();
  }
}

function openPicker(): void {
  pickerOpen.value = true;
  initPickerColor();
}

function closePicker(): void {
  if (pickerOpen.value) {
    pickerOpen.value = false;
  }
}
</script>

<style scoped lang="scss">
p {
  font-size: 0.8125rem;
}
.color-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: 100%;

  .action-edit-color {
    display: inline-flex;
    align-self: center;
    border-radius: 2px;
    border: 1px solid var(--lg-accent);
    cursor: pointer;
  }
}
.floating.color-picker {
  z-index: 10;
  visibility: visible;
  padding: 0;
}
</style>
