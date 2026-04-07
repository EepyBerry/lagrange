<template>
  <hr />
</template>

<style scoped lang="scss">
hr {
  grid-column: span 2;
  text-align: center;
  height: 0.5rem;
  margin-bottom: 0.5rem;
  border: none;

  &[bordered] {
    border-bottom: 1px solid var(--lg-accent);
  }
}
</style>
