<template>
  <div id="sidebar">
    <section>
      <div id="title">
        <h1 class="headline-sm">
          <iconify-icon icon="mingcute:planet-line" width="1.25em" />
          Planet settings
        </h1>
      <iconify-icon icon="mingcute:down-fill" width="1.25em" />
      </div>
      <ParameterTable>
        <ParameterField type="number" unit="°">Axial tilt</ParameterField>
        <ParameterField type="number" unit="°">Rotation</ParameterField>
        <ParameterDivider />
        <ParameterField type="number" unit="°">Axial tilt</ParameterField>
      </ParameterTable>
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
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  section {
    background-color: var(--lg-primary);
    border-bottom: 2px solid var(--lg-accent);
    width: 100%;
    padding: 0.5rem 0.75rem;

    display: flex;
    flex-direction: column;
    align-items: space-between;
    gap: 4px;
  }
}

#title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>