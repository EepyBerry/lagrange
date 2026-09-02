<template>
  <header>
    <div>
      <slot></slot>
    </div>
  </header>
</template>

<style scoped lang="scss">
header {
  z-index: 10;
  position: absolute;
  top: -1px;
  padding: 0 2px 2px;

  background: var(--lg-accent);
  clip-path: polygon(0 0, 100% 0, calc(100% - 1.5rem) 100%, 1.5rem 100%);

  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;

  & > div {
    position: relative;
    padding: 0.125rem 1.5rem;
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
