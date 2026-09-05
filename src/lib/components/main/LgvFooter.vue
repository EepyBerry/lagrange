<template>
  <footer>
    <div>
      <slot />
    </div>
  </footer>
</template>

<style scoped lang="scss">
footer {
  $flat-angle: 1.25rem;
  z-index: 10;
  position: fixed;
  bottom: -1px;
  padding: var(--lg-var-border-width) var(--lg-var-border-width) 0;

  background: var(--lg-accent);
  clip-path: polygon($flat-angle 0, calc(100% - $flat-angle) 0, 100% 100%, 0 100%);

  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;

  & > div {
    padding: 0.125rem $flat-angle;
    background: var(--lg-primary);
    clip-path: inherit;

    display: flex;
    align-self: center;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
}

@media screen and (max-width: 767px) {
  footer {
    display: none;
  }
}
</style>
