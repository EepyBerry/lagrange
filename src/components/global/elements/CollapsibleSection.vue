<template>
  <section
    class="collapsible-section"
    :class="{ expanded: _expanded, compact: compactMode, 'allow-icon-mode': allowIconMode }"
    role="group"
    :aria-expanded="_expanded"
  >
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
  </section>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref } from 'vue';
const _expanded: Ref<boolean> = ref(true);

const _props = defineProps<{ icon?: string; compactMode?: boolean; allowIconMode?: boolean; expand?: boolean }>();
onMounted(() => (_expanded.value = _props.expand ?? true));

function toggleExpand() {
  _expanded.value = !_expanded.value;
}
</script>

<style scoped lang="scss">
.collapsible-section {
  pointer-events: all;
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 2px;
  min-width: 25rem;
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 4px;

  &.compact {
    min-width: 0;
  }
  &.expanded > .collapsible-section-title > .indicator {
    transform: rotateZ(90deg);
  }

  .collapsible-section-title {
    background: none;
    border: none;
    color: unset;
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    padding: 0.75rem;

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
.collapsible-section.warn {
  background: var(--lg-warn-panel);
  border-color: var(--lg-warn-active);
}

@media screen and (max-width: 1366px) {
  .collapsible-section:not(.expanded, .compact).allow-icon-mode {
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
  .collapsible-section:not(.compact) {
    min-width: 16rem;
  }
}
</style>
