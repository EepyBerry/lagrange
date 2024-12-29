<template>
  <div id="controls" :class="{ compact: compactMode }">
    <template v-if="compactMode">
      <ControlsContainer :compact-mode="true" />
      <InlineFooter />
    </template>
    <aside v-else class="sidebar">
      <ControlsContainer :compact-mode="false" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import InlineFooter from '../main/InlineFooter.vue'
import ControlsContainer from './ControlsContainer.vue'
defineProps<{ compactMode: boolean }>()
</script>

<style scoped lang="scss">
#controls:not(.compact) {
  z-index: 10;
  position: absolute;
  inset: 0 auto 0;
  margin-top: 3.875rem;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;

  .sidebar {
    width: 100%;
    padding: 1rem;
    padding-right: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    overflow-y: auto;

    user-select: none;
    direction: rtl;

    & > * {
      direction: ltr;
      align-self: flex-end;
    }
  }
}
#controls.compact {
  z-index: 5;
  position: absolute;
  inset: 50% 0 0;
  padding: 0.75rem 0.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.5rem;
  overflow-y: auto;
}

@media screen and (max-width: 1199px) {
  #controls:not(.compact) {
    .sidebar {
      padding: 0 1.5rem 0 0.5rem;

      & > section {
        min-width: 0;
      }
      & > section.expanded {
        min-width: 26rem;
      }
    }
  }
}
@media screen and (max-width: 767px) {
  #controls:not(.compact) {
    min-width: 2rem;
    margin-bottom: 3.875rem;

    .sidebar {
      padding: 0.5rem;
    }
  }
}
@media screen and (max-width: 567px) {
  #controls:not(.compact) {
    .sidebar {
      padding: 0.5rem;
      min-width: 0;
      max-width: 100%;
    }
  }
}
</style>
