<template>
  <section
    class="collapsible-section"
    :class="{ expanded: _expanded, compact: compactMode, 'allow-icon-mode': allowIconMode }"
    role="group"
    :aria-expanded="_expanded"
  >
    <button class="section-title" @click="toggleExpand()" @keydown.enter="toggleExpand()">
      <h3>
        <iconify-icon :icon="icon" width="1.25rem" aria-hidden="true" />
        <span><slot name="title">SECTION_TITLE</slot></span>
      </h3>
      <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-hidden="true" />
    </button>
    <div class="section-content" v-show="_expanded">
      <slot name="content">
        <span class="default">Nothing here yet, sorry :c</span>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref } from 'vue'
const _expanded: Ref<boolean> = ref(true)

const _props = defineProps<{ icon?: string; compactMode?: boolean; allowIconMode?: boolean; expand?: boolean }>()
onMounted(() => (_expanded.value = _props.expand ?? true))

function toggleExpand() {
  _expanded.value = !_expanded.value
}
</script>

<style scoped lang="scss">
.collapsible-section {
  pointer-events: all;
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  min-width: 26rem;

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  &.compact {
    min-width: 0;
  }
  &.expanded > .section-title > .indicator {
    transform: rotateZ(90deg);
  }

  .section-title {
    background: none;
    border: none;
    color: unset;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.75rem;

    cursor: pointer;
    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-content {
    font-size: 0.875rem;
    font-weight: 300;
    padding: 0 0.75rem 0.75rem;
    overflow-x: auto;
  }
  .section-content:has(.default) {
    text-align: center;
    .default {
      font-size: 0.75rem;
    }
  }
}
.collapsible-section.warn {
  background: var(--lg-warn-panel);
  border: 1px solid var(--lg-warn);
}

@media screen and (max-width: 1199px) {
  .collapsible-section:not(.expanded, .compact).allow-icon-mode {
    align-self: flex-start;
    width: fit-content;
    min-width: 0;

    .section-title {
      min-width: 0;

      span,
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
