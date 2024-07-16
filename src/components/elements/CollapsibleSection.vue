<template>
    <section
      class="collapsible-section"
      :class="{ expanded: _expanded, static: static }"
      role="group"
      :aria-expanded="_expanded"
    >
      <div v-if="static"  class="section-title static">
        <h3>
          <span><slot name="title">SECTION_TITLE</slot></span>
        </h3>
      </div>
      <button v-else class="section-title"
        @click="toggleExpand()"
        @keydown.enter="toggleExpand()"
      >
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
import { type Ref, onMounted, ref } from 'vue';
const _expanded: Ref<boolean> = ref(true)

const _props = defineProps<{ icon?: string, static?: boolean, expand?: boolean }>()
onMounted(() => _expanded.value = _props.expand ?? true)

function toggleExpand() {
  if (_props.static) {
    return
  }
  _expanded.value = !_expanded.value
}
</script>

<style scoped lang="scss">
.collapsible-section {
  pointer-events: all;
  background: var(--lg-primary);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  &.static {
    margin-bottom: 0.75rem;
  }
  &.expanded .indicator {
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
  .section-title.static {
    justify-content: center;
    cursor: default;
  }
  .section-content {
    font-size: 0.875rem;
    font-weight: 300;
    padding: 0 0.75rem 0.75rem;
  }
  .section-content:has(.default) {
    text-align: center;
    .default {
      font-size: 0.75rem;
    }
  }
}
</style>