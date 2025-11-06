<template>
  <span class="deco separator" role="separator">
    <span class="deco greeble"></span>
    <span class="deco greeble"></span>
    <span class="deco greeble"></span>
  </span>
</template>
<style lang="scss">
.deco.separator {
  display: inline-block;
  position: relative;
  width: 100%;
  border-top: 2px solid var(--lg-accent);
  margin-bottom: 1rem;

  .deco.greeble {
    position: absolute;
    top: 0;
    height: 6px; background: var(--lg-accent);
  }
  .deco.greeble:first-child {
    left: 5%;
    width: 3%;
  }
  .deco.greeble:nth-child(2) {
    left: 11%;
    width: 10%;
  }
  .deco.greeble:last-child {
    left: 50%;
    width: 25%;
  }

  &.flip-x {
    transform: scaleX(-1);
  }
  &.flip-y {
    transform: scaleY(-1);
  }
}
</style>