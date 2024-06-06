<template>
    <section class="param-section" :class="{ expanded: _expanded }">
      <div class="section-title">
        <h1 class="headline-sm">
          <iconify-icon :icon="icon" width="1.25em" />
          <slot name="title">SECTION_TITLE</slot>
        </h1>
        <button class="section-toggle icon-button" @click="_expanded = !_expanded">
          <iconify-icon icon="mingcute:right-fill" width="1.25rem" />
        </button>
      </div>
      <div class="section-content" v-show="_expanded">
        <slot name="content">
            SECTION_CONTENT
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
  padding: 0.5rem 0.5rem 0;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: 4px;

  &.expanded .section-toggle {
    transform: rotateZ(90deg);
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .icon-button { padding: 0.25rem; }
}
</style>