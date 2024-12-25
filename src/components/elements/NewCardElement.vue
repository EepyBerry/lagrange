<template>
  <RouterLink
    ref="cardRoot"
    class="planet-card-link" 
    :to="uwuifyPath('/planet-editor/new')"
    :aria-label="$t('codex.$action_add')"
    :title="$t('codex.$action_add')"
  >
    <iconify-icon icon="mingcute:add-line" width="6rem" aria-hidden="true" />
  </RouterLink>
</template>

<script setup lang="ts">
import { uwuifyPath } from '@/core/extras';
</script>

<style scoped lang="scss">
.planet-card-link,
.planet-card-link:visited {
  min-height: 26rem;
  padding: 1rem;
  background: transparent;
  border: 2px dashed var(--lg-accent);
  color: var(--lg-accent);
  border-radius: 4px;
  overflow: hidden;

  transition:
    transform 100ms ease-in-out,
    border 100ms ease-in-out,
    color 100ms ease-in-out;
  opacity: 1;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.planet-card-link:hover {
  border: 2px dashed var(--lg-contrast);
  color: var(--lg-contrast);
}
.planet-card-link:active {
  transform: scale(98%);
}

@media screen and (prefers-reduced-motion) {
  .planet-card-link {
    transition: none;
  }
}
</style>
