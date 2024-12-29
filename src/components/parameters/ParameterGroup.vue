<template>
  <section 
    class="parameter-group"
    :class="{ expanded: _expanded }"
    role="group"
    :aria-expanded="_expanded"
  >
    <button class="group-title" :class="{ locked: !toggleable }" @click="toggleExpand()" @keydown.enter="toggleExpand()">
      <span>
        <input v-model="_toggleParam" type="checkbox" class="lg" :class="{ 'no-model': _toggleParam === undefined }" @click="handleCheckboxClick">
        <h4><slot name="title">GROUP_TITLE</slot></h4>
      </span>
      <iconify-icon v-if="toggleable" class="indicator" icon="mingcute:right-fill" width="1rem" aria-hidden="true" />
    </button>
    <div v-show="_expanded" class="group-content">
      <slot name="content">
        <span class="default">Nothing here yet, sorry :c</span>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { type Ref, onMounted, ref, watch } from 'vue'

const _toggleParam = defineModel<boolean|undefined>({ default: undefined })
const _expanded: Ref<boolean> = ref(true)

const _props = defineProps<{ expand?: boolean, toggleable?: boolean }>()
onMounted(() => (_expanded.value = _props.expand ?? true))
watch(() => _toggleParam.value, v => {
  if (!v) _expanded.value = false
})

function handleCheckboxClick(evt: Event) {
  evt.stopImmediatePropagation()
}
function toggleExpand() {
  _expanded.value = !_expanded.value
}
</script>

<style scoped lang="scss">
.parameter-group {
  grid-column: span 2;

  background: var(--lg-panel);
  border: 1px solid var(--lg-accent);
  border-radius: 4px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  &.expanded > .group-title > .indicator {
    transform: rotateZ(90deg);
  }

  .group-title {
    min-height: 2.25rem;
    font-size: 1rem;
    font-weight: 600;
    padding: 0 0.5rem;

    background: none;
    border: none;
    color: unset;

    cursor: pointer;
    user-select: none;

    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      display: flex;
      align-items: center;
      gap: 8px;
      
      input[type='checkbox'].lg {
        pointer-events: all;
        cursor: pointer;
      }
      input[type='checkbox'].lg.no-model {
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
  .group-content {
    font-size: 0.875rem;
    font-weight: 300;
    padding: 0 0.5rem 0.5rem;
    overflow-x: auto;

    display: grid;
    grid-template-columns: auto auto;
    align-items: center;
    gap: 8px 0;
  }
  .group-content {
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
    .group-title {
      padding: 0 0.75rem;
    }
  }
}
@media screen and (max-width: 767px) {
  .parameter-group {
    .group-title {
      padding: 0 0.5rem;
    }
  }
}
</style>
