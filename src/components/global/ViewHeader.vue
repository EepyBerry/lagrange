<template>
  <header class="view-header">
    <AppNavigation />
    <div class="view-header-controls">
      <span class="view-header-corner lb" />
      <span class="view-header-corner l" />
      <span class="view-header-corner rb" />
      <span class="view-header-corner r" />
      <slot></slot>
    </div>
    <span class="filler" />
  </header>
</template>

<script setup lang="ts">
import AppNavigation from './AppNavigation.vue';
</script>

<style lang="scss">
.view-header {
  z-index: 15;
  position: absolute;
  inset: 0 0 auto 0;
  
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-rows: 1fr;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  #nav-toggle {
    margin-top: 0.5rem;
    margin-left: 0.5rem;
  }
  .view-header-controls {
    position: relative;
    padding: 0.5rem;
    background: var(--lg-panel);
    border-bottom: 1px solid var(--lg-accent);
    pointer-events: all;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
}
.view-header-corner {
  z-index: 1;
  position: absolute;
  top: 0;
  width: 0;
  height: 0;
  border-style: solid;

  $corner-width: 1.5rem;
  $corner-height: 3.5rem;
  $corner-border-width: calc(1.5rem + 1px);
  $corner-border-height: calc(3.5rem + 1px);

  &.lb {
    left: calc(0px - $corner-border-width);
    border-width: 0 $corner-width $corner-border-height 0;
    border-color: transparent var(--lg-accent) transparent transparent;
  }
  &.l {
    left: -$corner-width;
    bottom: 0;
    border-width: 0 $corner-width $corner-height 0;
    border-color: transparent var(--lg-panel) transparent transparent;
  }
  &.rb {
    right: calc(0px - $corner-border-width);
    border-width: $corner-border-height $corner-width 0 0;
    border-color: var(--lg-accent) transparent transparent transparent;
  }
  &.r {
    right: -$corner-width;
    bottom: 0;
    border-width: $corner-height $corner-width 0 0 ;
    border-color: var(--lg-panel) transparent transparent transparent;
  }
}

@media screen and (max-width: 1199px) {
  .view-header {
    grid-template-columns: 1fr auto;
    .filler { display: none; }
  }
  .view-header-corner.rb, .view-header-corner.r {
    display: none;
  }
}
@media screen and (max-width: 767px) {
  .view-header {
    gap: 0;
    #nav-toggle {
      margin-top: 0;
      margin-left: 0.25rem;
    }
  }
  .view-header.xs-fullwidth {
    grid-template-columns: unset;
    grid-template-rows: unset;
    display: flex;
    .view-header-controls {
      flex: 1;
      background: none;
      border: none;
    }
    .view-header-corner {
      display: none;
    }
  }
}
</style>