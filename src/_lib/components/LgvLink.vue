<template>
  <a v-if="linkType === 'external'" :href="href" class="lgv external" target="_blank" rel="noopener noreferrer nofollow">
    <iconify-icon v-if="icon" :icon="icon" :width="iconWidth" aria-hidden="true" />
    <slot></slot>
  </a>
  <RouterLink v-else class="lgv" :to="href">
    <iconify-icon v-if="icon" :icon="icon" :width="iconWidth" aria-hidden="true" />
    <slot></slot>
  </RouterLink>
</template>

<script setup lang="ts">
type LinkType = 'internal' | 'external'
withDefaults(defineProps<{ linkType: LinkType, href?: string, icon?: string, iconWidth?: string }>(), {
  icon: 'mingcute:question-line',
  iconWidth: '1.5rem',
  linkType: 'internal',
  href: '/'
});
</script>

<style lang="scss">
// standard link
a.lgv {
  display: inline;
  padding: 0;
  margin: 0;
  min-width: 0;
  min-height: 0;
  background: none;
  border: none;
  position: relative;
  color: var(--lg-link);
  padding: 0;
  cursor: pointer;

  &:visited { color: var(--lg-link-visited); }
}

// button link
a.lgv[variant='button'] {
  color: var(--lg-text);
  background: var(--lg-button);
  border-radius: 2px;
  padding: 0;

  min-width: 2.5rem;
  min-height: 2.5rem;
  font-family: Poppins;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover { background: var(--lg-button-hover); }
  &:active { background: var(--lg-button-active); }

  &.contrast { background: var(--lg-contrast); }
  &.contrast:not(:disabled):hover { background: var(--lg-contrast-hover); }
  &.contrast:not(:disabled):active { background: var(--lg-contrast-active); }

  &.success { background: var(--lg-success); }
  &.success:not(:disabled):hover { background: var(--lg-success-hover); }
  &.success:not(:disabled):active { background: var(--lg-success-active); }

  &.info { background: var(--lg-info); }
  &.info:not(:disabled):hover { background: var(--lg-info-hover); }
  &.info:not(:disabled):active { background: var(--lg-info-active); }

  &.warn { background: var(--lg-warn); }
  &.warn:not(:disabled):hover { background: var(--lg-warn-hover); }
  &.warn:not(:disabled):active { background: var(--lg-warn-active); }
}
a.lgv[variant='button'].external::before {
  z-index: 1;
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  
  width: 0; 
  height: 0; 
  border-style: solid;
  border-width: 0 0.5rem 0.5rem 0;
  border-color: transparent white transparent transparent;
}

a.lgv[variant='dark'] {
  color: var(--lg-text);
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  
  min-width: 2.5rem;
  min-height: 2.5rem;
  font-size: 0.875rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover { background: var(--lg-button-dark-hover); }
  &:active { background: var(--lg-button-dark-active); }

  &.contrast { border-color: var(--lg-contrast); }
  &.contrast:not(:disabled):hover { background: var(--lg-contrast-hover); }
  &.contrast:not(:disabled):active { background: var(--lg-contrast-active); }
}
a.lgv[variant='dark'].external::before {
  z-index: 1;
  content: '';
  position: absolute;
  top: 0;
  right: 0;

  width: 0; 
  height: 0; 
  border-style: solid;
  border-width: 0 0.5rem 0.5rem 0;
  border-color: transparent white transparent transparent;
}
</style>