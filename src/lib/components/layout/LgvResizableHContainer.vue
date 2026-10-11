<template>
  <div
    ref="container"
    class="lgv resizable-container"
    :class="{ flipped: $props.flipped }"
    @pointermove="calculateResizeHandlePosition"
    @pointerup="isResizeHandleDragging = false"
  >
    <div ref="leftPanel" class="resizable-container__left" :style="{ width: leftPanelWidth, maxWidth: maxLeftWidth }">
      <slot name="left"></slot>
    </div>
    <button
      class="resizable-container-handle"
      @pointerdown="isResizeHandleDragging = true"
      @keydown.left="stepResizeHandlePosition('left')"
      @keydown.right="stepResizeHandlePosition('right')"
      :aria-label="$t('a11y.action_resize_horizontal')"
    >
      <span class="handle__inner"><iconify-icon icon="material-symbols:drag-handle" width="1.5rem" /></span>
    </button>
    <div class="resizable-container__right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { ref, useTemplateRef, type Ref } from 'vue';

const container = useTemplateRef('container');
const leftPanel = useTemplateRef('leftPanel');

const $props = withDefaults(defineProps<{ flipped?: boolean; startingLeftWidth?: string; maxLeftWidth?: string }>(), {
  flipped: false,
  maxLeftWidth: 'calc(100% - 6rem)',
});

const isResizeHandleDragging: Ref<boolean> = ref(false);
const leftPanelWidth: Ref<string | undefined> = ref<string | undefined>($props.startingLeftWidth);

useEventListener(window, 'pointerup', disableDragging);
useEventListener(window, 'pointermove', calculateResizeHandlePosition);

function disableDragging() {
  isResizeHandleDragging.value = false;
}

function calculateResizeHandlePosition($event: PointerEvent) {
  if (isResizeHandleDragging.value === false) {
    return;
  }
  const containerRect = container.value!.getBoundingClientRect();
  const pointerRelativeX = $props.flipped ? containerRect.right - $event.clientX : $event.clientX - containerRect.left;
  leftPanelWidth.value = `clamp(6rem, ${pointerRelativeX}px, calc(100% - 6.375rem))`;
}

function stepResizeHandlePosition(direction: 'left' | 'right') {
  const currentLeftPanelWidth = getComputedStyle(leftPanel.value!).width;
  if ($props.flipped ? direction === 'left' : direction === 'right') {
    leftPanelWidth.value = `clamp(6rem, calc(${currentLeftPanelWidth} + 1rem), calc(100% - 6.375rem))`;
  } else {
    leftPanelWidth.value = `clamp(6rem, calc(${currentLeftPanelWidth} - 1rem), calc(100% - 6.375rem))`;
  }
}
</script>

<style scoped lang="scss">
.resizable-container {
  user-select: none;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;

  display: flex;

  & > .resizable-container__left {
    user-select: none;
    flex: 0 0 auto;
    min-width: 6rem;
    overflow-y: auto;
  }
  & > .resizable-container__right {
    user-select: none;
    flex: 1 1 0;
    min-width: 6rem;
    overflow-y: auto;
  }

  & > .resizable-container-handle {
    flex-shrink: 0;
    position: relative;
    width: 0.375rem;
    padding: 0;
    background: var(--lg-primary);
    border: none;
    border-left: var(--lg-var-border-width) solid var(--lg-accent);
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
    color: white;

    display: flex;
    align-items: center;
    justify-content: center;

    .handle__bounding-box {
      z-index: 2;
      position: absolute;
      inset: 0 -1rem;
    }

    .handle__inner {
      z-index: 1;
      position: absolute;
      inset: auto -0.5rem;

      padding: 0.5rem 0;
      background: var(--lg-primary);
      border: var(--lg-var-border-width) solid var(--lg-accent);
      border-radius: 4px;

      display: flex;
      align-items: center;
      justify-content: center;

      & > iconify-icon {
        transform: rotate(90deg);
      }
    }

    &:hover {
      cursor: ew-resize;
    }
  }

  &.flipped {
    & > .resizable-container__left {
      order: 2;
    }
    & > .resizable-container-handle {
      order: 1;
    }
    & > .resizable-container__right {
      order: 0;
    }
  }
}
</style>
