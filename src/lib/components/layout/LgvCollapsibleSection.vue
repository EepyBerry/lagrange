<template>
  <section class="lgv collapsible-section" :class="{ expanded: _expanded }" role="group" :aria-expanded="_expanded">
    <div class="collapsible-section__inner">
      <button class="collapsible-section-title" @click="toggleExpand()" @keydown.enter="toggleExpand()">
        <span class="title-container">
          <iconify-icon :icon="icon" width="1.25rem" aria-hidden="true" />
          <span><slot name="title">SECTION_TITLE</slot></span>
        </span>
        <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-hidden="true" />
      </button>
      <div v-show="_expanded" class="collapsible-section-content">
        <slot name="content">
          <span class="default">Nothing here yet, sorry :c</span>
        </slot>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref } from 'vue';
const _expanded: Ref<boolean> = ref(true);

const _props = defineProps<{ icon?: string; expand?: boolean }>();
onMounted(() => (_expanded.value = _props.expand ?? true));

function toggleExpand() {
  _expanded.value = !_expanded.value;
}
</script>

<style scoped lang="scss">
.lgv.collapsible-section {
  pointer-events: all;
  padding: 1px;
  background: var(--lg-accent);
  min-width: 24rem;
  width: 100%;

  &.expanded .collapsible-section-title > .indicator {
    transform: rotateZ(90deg);
  }

  .collapsible-section__inner {
    flex: 1;
    height: 100%;
    clip-path: inherit;
    background: var(--lg-primary);

    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .collapsible-section-title {
    background: none;
    border: none;
    color: unset;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    padding: 0.625rem;

    cursor: pointer;
    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-container {
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      font-family: inherit;
      line-height: 1;

      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }
  .collapsible-section-content {
    font-size: 0.875rem;
    font-weight: 300;
    margin: 0 0.75rem 0.75rem;
    overflow-x: auto;
  }
  .collapsible-section-content .default {
    font-size: 0.75rem;
  }
}

.lgv.collapsible-section[variant='filled'] {
  .collapsible-section__inner {
    background: unset;
  }
}

.lgv.collapsible-section.warn {
  background: var(--lg-warn-active);
  .collapsible-section__inner {
    background: var(--lg-warn-panel);
  }
}

@media screen and (max-width: 1366px) {
  .lgv.collapsible-section:not(.expanded, .compact).allow-icon-mode {
    align-self: flex-start;
    width: fit-content;
    min-width: 0;

    .collapsible-section-title {
      min-width: 0;
      .title-container > span {
        display: none;
      }
      .indicator {
        display: none;
      }
    }
  }
  .lgv.collapsible-section:not(.compact) {
    min-width: 16rem;
  }
}
</style>
