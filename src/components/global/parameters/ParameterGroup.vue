<template>
  <section class="parameter-group" :class="{ expanded: _expanded }" role="group" :aria-expanded="_expanded">
    <button
      type="button"
      class="parameter-group-title"
      :class="{ locked: !toggleable }"
      @click="toggleExpand()"
      @keydown.enter="toggleExpand()"
    >
      <span class="parameter-group-title__inner">
        <input
          v-model="_toggleParam"
          type="checkbox"
          class="lg"
          :class="{ 'no-model': _toggleParam === undefined }"
          @click="handleCheckboxClick"
        />
        <span><slot name="title">GROUP_TITLE</slot></span>
      </span>
      <iconify-icon v-if="toggleable" class="indicator" icon="mingcute:right-fill" width="1.25rem" aria-hidden="true" />
    </button>
    <div v-show="_expanded" class="parameter-group-content">
      <slot name="content">
        <span class="default">┐(´∀｀)┌</span>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref, watch } from 'vue';

const _toggleParam = defineModel<boolean | undefined>({ default: undefined });
const _expanded: Ref<boolean> = ref(true);

const _props = defineProps<{ expand?: boolean; toggleable?: boolean }>();
onMounted(() => (_expanded.value = _props.expand ?? true));
watch(
  () => _toggleParam.value,
  (v) => {
    if (!v) _expanded.value = false;
  },
);

function handleCheckboxClick(evt: Event) {
  evt.stopImmediatePropagation();
}
function toggleExpand() {
  _expanded.value = !_expanded.value;
}
</script>

<style scoped lang="scss">
.parameter-group {
  grid-column: span 2;
  margin: 0 -0.5rem;

  background: var(--lg-panel);
  border-top: var(--lg-var-border-width) solid var(--lg-accent);
  border-bottom: var(--lg-var-border-width) solid var(--lg-accent);
  border-radius: 2px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  &.expanded > .parameter-group-title > .indicator {
    transform: rotateZ(90deg);
  }

  .parameter-group-title {
    min-height: 2.25rem;
    font-family: inherit;
    font-size: 0.875rem;
    padding: 0 0.5rem;
    text-align: left;

    background: none;
    border: none;
    color: unset;

    cursor: pointer;
    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;

    .parameter-group-title__inner {
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      & > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      input[type='checkbox'] {
        flex-shrink: 0;
        pointer-events: all;
        cursor: pointer;
      }
      input[type='checkbox'].no-model {
        opacity: 0;
        visibility: hidden;
        display: none;
        pointer-events: none;
        cursor: default;
      }
    }

    &.locked {
      cursor: default;
      pointer-events: none;
    }
  }
  .parameter-group-content {
    font-size: 0.875rem;
    font-weight: 300;
    padding: 0 0.5rem 0.5rem;
    overflow-x: auto;

    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 8px 0.25rem;
  }
  .parameter-group-content {
    .default {
      grid-column: span 2;
      text-align: center;
      font-size: 0.75rem;
    }
  }
}
.parameter-group.warn {
  background: var(--lg-warn-panel);
  border: 1px solid var(--lg-warn);
}

@media screen and (max-width: 1199px) {
  .parameter-group {
    min-width: 16rem;
    .parameter-group-title {
      padding: 0 0.75rem;
    }
  }
}
@media screen and (max-width: 767px) {
  .parameter-group {
    .parameter-group-title {
      padding: 0 0.5rem;
    }
  }
}
</style>
