<template>
  <footer>
    <div>
      <slot />
    </div>
  </footer>
</template>

<style scoped lang="scss">
footer {
  z-index: 10;
  position: fixed;
  bottom: -1px;
  padding: 2px 2px 0;

  background: var(--lg-accent);
  clip-path: polygon(1.5rem 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);

  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;

  & > div {
    padding: 0.125rem 1.5rem;
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
