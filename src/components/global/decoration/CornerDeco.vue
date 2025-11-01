<template>
  <span class="deco corner"></span>
</template>
<style lang="scss">
.deco.corner {
  position: absolute;
  width: 0px;
  height: 0px;
  border-style: solid;
    
  &.tl {
    top: 0;
    left: 0;
    border-width: 24px 24px 0 0;
    border-color: var(--lg-accent) transparent transparent transparent;
  }
  &.tl.warn {
    border-color: var(--lg-warn-active) transparent transparent transparent;
  }

  &.tr {
    top: 0;
    right: 0;
    border-width: 0 24px 24px 0;
    border-color: transparent var(--lg-accent) transparent transparent;
  }
  &.tr.warn {
    border-color: transparent var(--lg-warn-active) transparent transparent;
  }

  &.bl {
    bottom: 0;
    left: 0;
    border-width: 24px 0 0 24px;
    border-color: transparent transparent transparent var(--lg-accent);
  }
  &.bl.warn {
    border-color: transparent transparent transparent var(--lg-warn-active);
  }

  &.br {
    bottom: 0;
    right: 0;
    border-width: 0 0 24px 24px;
    border-color: transparent transparent var(--lg-accent) transparent;
  }
  &.br.warn {
    border-color: transparent transparent var(--lg-warn-active) transparent;
  }
}
</style>