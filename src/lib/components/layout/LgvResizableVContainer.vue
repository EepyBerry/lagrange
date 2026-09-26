<template>
  <div
    ref="container"
    class="lgv resizable-container"
    :class="{ flipped: props.flipped }"
    @pointermove="calculateResizeHandlePosition"
    @pointerup="isResizeHandleDragging = false"
  >
    <div ref="topPanel" class="resizable-container__top" :style="{ height: topPanelHeight, maxHeight: maxTopHeight }">
      <slot name="top"></slot>
    </div>
    <button
      class="resizable-container-handle"
      @pointerdown="isResizeHandleDragging = true"
      @keydown.up="stepResizeHandlePosition('top')"
      @keydown.down="stepResizeHandlePosition('bottom')"
      :aria-label="$t('a11y.action_resize_vertical')"
    >
      <span class="handle__inner"><iconify-icon icon="material-symbols:drag-handle" width="1.5rem" /></span>
    </button>
    <div class="resizable-container__bottom">
      <slot name="bottom"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { ref, useTemplateRef, type Ref } from 'vue';

const container = useTemplateRef('container');
const topPanel = useTemplateRef('topPanel');
const isResizeHandleDragging: Ref<boolean> = ref(false);

const props = withDefaults(defineProps<{ flipped?: boolean; startingTopHeight?: string; maxTopHeight?: string }>(), {
  flipped: false,
  maxTopHeight: 'calc(100% - 6rem)',
});
const topPanelHeight = ref<string | undefined>(props.startingTopHeight);

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
  const pointerRelativeY = props.flipped ? containerRect.bottom - $event.clientY : $event.clientY - containerRect.top;
  topPanelHeight.value = `clamp(6rem, ${pointerRelativeY}px, calc(100% - 6.375rem))`;
}

function stepResizeHandlePosition(direction: 'top' | 'bottom') {
  const currentTopPanelHeight = getComputedStyle(topPanel.value!).height;
  if (props.flipped ? direction === 'top' : direction === 'bottom') {
    topPanelHeight.value = `clamp(6rem, calc(${currentTopPanelHeight} + 1rem), calc(100% - 6.375rem))`;
  } else {
    topPanelHeight.value = `clamp(6rem, calc(${currentTopPanelHeight} - 1rem), calc(100% - 6.375rem))`;
  }
}
</script>

<style scoped lang="scss">
.resizable-container {
  user-select: none;
  overflow: hidden;
  min-height: 0;
  height: 100%;
  flex: 1 1 auto;

  display: flex;
  flex-direction: column;

  & > .resizable-container__top {
    user-select: none;
    flex: 0 0 auto;
    min-height: 6rem;
    overflow: auto;

    display: flex;
  }
  & > .resizable-container__bottom {
    user-select: none;
    flex: 1 1 0;
    min-height: 6rem;
    overflow: auto;

    display: flex;
  }

  & > .resizable-container-handle {
    flex-shrink: 0;
    position: relative;
    height: 0.375rem;
    background: var(--lg-primary);
    border: none;
    border-top: var(--lg-var-border-width) solid var(--lg-accent);
    border-bottom: var(--lg-var-border-width) solid var(--lg-accent);
    color: white;

    display: flex;
    align-items: center;
    justify-content: center;

    .handle__bounding-box {
      z-index: 2;
      position: absolute;
      inset: -0.5rem 0;
    }

    .handle__inner {
      z-index: 1;
      position: absolute;
      inset: -0.5rem auto;

      padding: 0 0.5rem;
      background: var(--lg-primary);
      border: var(--lg-var-border-width) solid var(--lg-accent);
      border-radius: 4px;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    &:hover {
      cursor: ns-resize;
    }
  }

  &.flipped {
    & > .resizable-container__top {
      order: 2;
    }
    & > .resizable-container-handle {
      order: 1;
    }
    & > .resizable-container__bottom {
      order: 0;
    }
  }
}
</style>
