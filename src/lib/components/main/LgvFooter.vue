<template>
  <footer>
    <div>
      <slot />
    </div>
  </footer>
</template>

<style lang="scss">
footer {
  z-index: 10;
  position: fixed;
  bottom: -1px;
  padding: 1.5px 1.5px 0;

  background: var(--lg-accent);
  clip-path: polygon(1.5rem 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);

  display: flex;
  align-self: center;
  align-items: center;
  justify-content: center;

  & > div {
    padding: 0.25rem 1.5rem;
    background: var(--lg-panel);
    clip-path: polygon(1.5rem 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%);

    display: flex;
    align-self: center;
    align-items: center;
    justify-content: center;
  }
}

@media screen and (max-width: 1199px) {
  footer {
    align-self: flex-end;
    border-top-right-radius: 0;
    border-right: 0;
  }
}

@media screen and (max-width: 767px) {
  footer {
    display: none;
  }
}
</style>
