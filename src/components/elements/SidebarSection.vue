<template>
    <section
      class="param-section"
      :class="{ expanded: _expanded }"
      role="group"
      :aria-expanded="_expanded"
    >
      <button class="section-title"
        @click="_expanded = !_expanded"
        @keydown="_expanded = !_expanded"
      >
        <h3 class="headline-sm">
          <iconify-icon :icon="icon" width="1.25em" aria-hidden="true" />
          <slot name="title">SECTION_TITLE</slot>
        </h3>
        <iconify-icon class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-label="Expand indicator" />
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

const _props = defineProps<{ icon: string, expand?: boolean }>()
onMounted(() => _expanded.value = _props.expand ?? true)
</script>

<style scoped lang="scss">
.param-section {
  background-color: var(--lg-primary);
  border-bottom: 2px solid var(--lg-accent);
  width: 100%;
  padding: 0.5rem;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  &.expanded .indicator {
    transform: rotateZ(90deg);
  }

  .section-title {
    background: none;
    border: none;
    color: unset;
    font-size: 1rem;
    font-weight: 600;

    padding: 0;
    cursor: pointer;
    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-content:has(.default) {
    text-align: center;
    .default {
      font-size: 0.75rem;
      opacity: 0.25;
    }
  }

  .indicator { padding: 0.25rem; }
}
</style>