<template>
  <div class="notification" :class="type">
    <span class="deco" />
    <span class="deco" />
    <span class="deco" />
    <span class="deco" />
    <div class="notification-icon">
      <iconify-icon v-if="type === 'info'" icon="material-symbols:info-outline" width="1.375rem" aria-hidden="true" />
      <iconify-icon v-if="type === 'warn'" icon="material-symbols:warning" width="1.375rem" aria-hidden="true" />
    </div>
    <div class="notification-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EditorMessageLevel } from '@core/types.ts';
defineProps<{ type: EditorMessageLevel }>();
</script>

<style scoped lang="scss">
.notification .deco {
  $height: 3px;
  position: absolute;
  top: -1px;
  left: 0;
  height: $height;

  &:first-child {
    left: 1.875rem;
    width: 1.875rem;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - $height), calc(100% - $height) 100%, 0 100%);
  }
  &:nth-child(2) {
    left: 4.375rem;
    width: 16px;
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - $height),
      calc(100% - $height) 100%,
      $height 100%,
      0 calc(100% - $height)
    );
  }
  &:nth-child(3) {
    left: 5.875rem;
    width: 16px;
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - $height),
      calc(100% - $height) 100%,
      $height 100%,
      0 calc(100% - $height)
    );
  }
  &:nth-child(4) {
    left: auto;
    right: 0;
    width: 12px;
    clip-path: polygon(0 0, 100% 0, 100% 100%, $height 100%, 0 calc(100% - $height));
  }
}
.notification {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  text-wrap: wrap;

  border: none;
  border-top: 1px solid;
  clip-path: polygon(0 0, 0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);

  &.success {
    border-color: var(--lg-success);
    background: var(--lg-success-panel);
    .deco {
      background: var(--lg-success);
    }
    .notification-icon {
      background: var(--lg-success);
      color: var(--lg-success-panel);
      & > iconify-icon {
        filter: drop-shadow(0 1px 0 var(--lg-success-panel));
      }
    }
  }
  &.info {
    border-color: var(--lg-info);
    background: var(--lg-info-panel);
    .deco {
      background: var(--lg-info);
    }
    .notification-icon {
      background: var(--lg-info);
      & > iconify-icon {
        filter: drop-shadow(0 1px 0 var(--lg-info-panel));
      }
    }
  }
  &.warn {
    border-color: var(--lg-warn);
    background: var(--lg-warn-panel);
    .deco {
      background: var(--lg-warn);
    }
    .notification-icon {
      background: var(--lg-warn);
      & > iconify-icon {
        filter: drop-shadow(0 1px 0 var(--lg-warn-panel));
      }
    }
  }
}
.notification-content {
  width: 100%;
  padding: 0.5rem 0.75rem;
}
.notification-icon {
  padding: 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
