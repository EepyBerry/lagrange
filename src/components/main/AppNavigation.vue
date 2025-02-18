<template>
  <template v-if="compactMode">
    <button ref="buttonOpen" class="lg nav" :aria-label="$t('a11y.action_nav_toggle')">
      <iconify-icon v-if="isOpen" icon="material-symbols:menu-open-rounded" width="1.75rem" aria-hidden="true" />
      <iconify-icon v-else icon="material-symbols:menu-rounded" width="1.75rem" aria-hidden="true" />
    </button>

    <aside id="nav-compact" ref="sidebar" :class="{ open: isOpen }" @click="handleClick">
      <nav>
        <hr />
        <RouterLink :to="uwuifyPath('/codex')" class="lg nav" :aria-label="$t('a11y.action_nav_codex')">
          <iconify-icon icon="mingcute:book-2-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.codex') }}
        </RouterLink>
        <hr />
        <RouterLink
          :to="uwuifyPath('/planet-editor/new')"
          class="lg nav"
          :class="{ 'router-link-active': !!route.params.id }"
          :aria-label="$t('a11y.action_nav_editor')"
          @click="router.push('/planet-editor/new')"
        >
          <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.editor') }}
        </RouterLink>
      </nav>
    </aside>
  </template>
  <template v-else>
    <aside id="nav-full" ref="sidebar" :class="{ open: isOpen }" @click="handleClick">
      <nav>
        <RouterLink :to="uwuifyPath('/codex')" class="lg nav" :aria-label="$t('a11y.action_nav_codex')">
          <iconify-icon icon="mingcute:book-2-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.codex') }}
        </RouterLink>
        <hr />
        <RouterLink
          :to="uwuifyPath('/planet-editor/new')"
          class="lg nav"
          :class="{ 'router-link-active': !!route.params.id }"
          :aria-label="$t('a11y.action_nav_editor')"
          @click="router.push('/planet-editor/new')"
        >
          <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
          {{ $t('main.nav.editor') }}
        </RouterLink>
      </nav>
    </aside>
  </template>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus'
import { uwuifyPath } from '@/core/extras'
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const buttonOpen: Ref<HTMLElement | null> = ref(null)
const sidebar: Ref<HTMLElement | null> = ref(null)
const isOpen: Ref<boolean> = ref(false)

defineProps<{ compactMode: boolean }>()
onMounted(async () => {
  EventBus.registerWindowEventListener('keydown', handleKey)
})
onUnmounted(() => {
  EventBus.deregisterWindowEventListener('keydown', handleKey)
})
watch(
  () => EventBus.clickEvent.value,
  async (evt) => await handleClick(evt!),
)

function handleClick(evt: MouseEvent) {
  if (evt.target === buttonOpen.value) {
    isOpen.value = !isOpen.value
  } else if (evt.target !== sidebar.value && isOpen.value) {
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
  left: 1rem;
}

#nav-compact {
  position: absolute;
  left: 3.375rem;
  display: none;
  &.open {
    display: initial;
  }
}
@media screen and (max-width: 767px) {
  #nav-compact {
    left: 0;
    top: 3.375rem;

    nav {
      display: flex;
      flex-direction: column;

      hr {
        display: none;
      }
    }
  }
}
</style>
