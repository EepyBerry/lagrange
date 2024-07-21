<template>
  <template v-if="compactMode">
    <button ref="buttonOpen" class="lg dark">
      <iconify-icon v-if="isOpen" icon="material-symbols:menu-open-rounded" width="1.75rem" />
      <iconify-icon v-else icon="material-symbols:menu-rounded" width="1.75rem" />
    </button>

    <aside id="nav-compact" ref="sidebar" :class="{ open: isOpen }" @click="handleClick">
      <nav>
        <hr>
        <RouterLink class="lg dark" to="codex">
          <iconify-icon icon="mingcute:book-2-line" width="1.5rem" aria-hidden="true" />
        </RouterLink>
        <RouterLink class="lg dark" to="planet-editor">
          <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
        </RouterLink>
      </nav>
    </aside>
  </template>
  <template v-else>
    <aside id="nav-full" ref="sidebar" :class="{ open: isOpen }" @click="handleClick">
      <nav>
        <RouterLink class="lg dark" to="codex">
          <iconify-icon icon="mingcute:book-2-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.codex') }}
        </RouterLink>
        <hr>
        <RouterLink class="lg dark" to="planet-editor">
          <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.editor') }}
        </RouterLink>
      </nav>
    </aside>
  </template>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/window-event-bus';
import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { RouterLink } from 'vue-router';

const buttonOpen: Ref<HTMLElement|null> = ref(null)
const sidebar: Ref<HTMLElement|null> = ref(null)
const isOpen: Ref<boolean> = ref(false)

defineProps<{ compactMode: boolean }>()
onMounted(async () => {
  EventBus.registerWindowEventListener('click', handleClick)
  EventBus.registerWindowEventListener('keydown', handleKey)
})
onUnmounted(() => {
  EventBus.deregisterWindowEventListener('click', handleClick)
  EventBus.deregisterWindowEventListener('keydown', handleKey)
})

function handleClick(evt: MouseEvent) {
  if (evt.target === buttonOpen.value) {
    console.debug('open sidebar')
    isOpen.value = !isOpen.value
  }
  else if (evt.target !== sidebar.value && isOpen.value) {
    console.debug('close sidebar')
    isOpen.value = false
  }
}

function handleKey(evt: KeyboardEvent) {
  if (evt.key.toUpperCase() === 'ESCAPE') {
    isOpen.value = false
  }
}
</script>

<style scoped lang="scss">
#nav-full {
  position: absolute;
  left: 0;
}

#nav-compact {
  position: absolute;
  left: 3.875rem;
  display: none;
  &.open {
    display: initial;
  }
}
nav {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  
  hr { height: 2rem; align-self: center }
  a.lg.dark {
    width: 100%;
    display: flex;
    padding: 0 0.75rem;
    font-size: 1rem;
    text-decoration: none;

    & > iconify-icon {
      pointer-events: none;
    }
  }
}
button {
  iconify-icon {
    pointer-events: none;
  }
}

@media screen and (max-width: 1199px) {
  #nav-compact {
    left: 3.375rem;
    nav {
      gap: 0.5rem;
    }
  }
}
@media screen and (max-width: 767px) {
  #nav-compact {
    left: 0;
    top: 3.375rem;

    nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      hr {
        width: 2rem;
        height: unset;
        align-self: center
      }
    }
  }
}
</style>