<template>
  <header>
    <div>
      <slot></slot>
    </div>
  </header>
</template>

<style scoped lang="scss">
header {
  $flat-angle: 1.25rem;
  z-index: 10;
  position: absolute;
  top: -1px;
  padding: 0 var(--lg-var-border-width) var(--lg-var-border-width);

  background: var(--lg-accent);
  clip-path: polygon(0 0, 100% 0, calc(100% - $flat-angle) 100%, $flat-angle 100%);

  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;

  & > div {
    position: relative;
    padding: 0.125rem $flat-angle;
    background: var(--lg-primary);
    clip-path: inherit;

    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media screen and (max-width: 1199px) {
  // TODO
}
</style>
