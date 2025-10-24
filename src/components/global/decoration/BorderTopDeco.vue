<template>
  <span class="deco card-top-border">
    <span class="deco triangle"></span>
    <span class="deco polygon">
      <iconify-icon class="deco icon" icon="mingcute:planet-fill" width="1rem" aria-hidden="true" />
    </span>
  </span>
</template>
<style lang="scss">
.deco.card-top-border {
  position: absolute;
  inset: 0 0 auto;
  height: 12px;
  background-color: var(--lg-accent);

  .deco.triangle {
    position: absolute;
    top: 8px;
    left: 0;
    width: 0px;
    height: 0px;
    border-width: 16px 16px 0 0;
    border-style: solid;
    border-color: var(--lg-accent) transparent transparent transparent;
  }
  .deco.polygon {
    position: absolute;
    left: 0;
    width: 64px;
    height: 24px;
    background: var(--lg-accent);
    border-bottom-left-radius: 2px;
    clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  }
  .deco.icon {
    position: absolute;
    top: 4px;
    left: 20px;
    color: var(--black);
  }
  .deco.line {
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--lg-accent);
  }
}
</style>