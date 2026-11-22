<template>
  <svg id="gizmo-border-notch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48.5 48.5">
    <polygon
      class="cls-1"
      points="0 6.83 0 48.5 5.69 48.5 5.69 12.52 5.69 5.69 12.52 5.69 48.5 5.69 48.5 0 6.83 0 0 0 0 6.83"
    />
  </svg>
</template>

<style scoped lang="scss">
#gizmo-border-notch {
  z-index: 2;
  position: absolute;
  width: 2rem;
  fill: var(--lg-accent);

  &.tl {
    top: 0.5rem;
    left: 0.5rem;
  }
  &.bl {
    transform: rotate(-90deg);
    bottom: 0.5rem;
    left: 0.5rem;
  }
  &.br {
    transform: rotate(180deg);
    bottom: 0.5rem;
    right: 0.5rem;
  }
}
</style>
