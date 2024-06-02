<template>
  <div id="sidebar">
    <section id="sidebar-section">
      <h1 id="title">
        <iconify-icon icon="mingcute:planet-fill" />
        Planet Settings
      </h1>
    </section>
    <section id="sidebar-section">
      <p>WIP :3</p>
      <input type="checkbox">
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
#sidebar {
  z-index: 5;
  position: absolute;
  inset: 0 auto 0 0;
  width: 20rem;
  margin: 1%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  #sidebar-section {
    background-color: var(--lg-primary);
    border-radius: 8px;
    width: 100%;
    padding: 0.5rem 0.75rem;
    display: flex;
    justify-content: space-between;
  }
}
</style>