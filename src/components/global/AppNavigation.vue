<template>
  <button id="nav-toggle" ref="navMenuTrigger" class="nav" :class="{ active: isNavMenuOpen }" :aria-label="$t('a11y.action_nav_toggle')">
    <iconify-icon v-if="isNavMenuOpen" icon="material-symbols:menu-open-rounded" width="1.75rem" aria-hidden="true" />
    <iconify-icon v-else icon="material-symbols:menu-rounded" width="1.75rem" aria-hidden="true" />
  </button>
  <nav id="nav-menu" ref="navMenu" class="floating" :style="navFloatingStyles.floatingStyles.value">
    <RouterLink :to="uwuifyPath('/codex')" class="nav" :aria-label="$t('a11y.action_nav_codex')">
      <iconify-icon icon="mingcute:book-2-line" width="1.5rem" aria-hidden="true" />
      {{ $t('main.nav.codex') }}
    </RouterLink>
    <RouterLink
      :to="uwuifyPath('/planet-editor/new')"
      class="nav"
      :class="{ 'router-link-active': !!route.params.id }"
      :aria-label="$t('a11y.action_nav_editor')"
      @click="router.push('/planet-editor/new')"
    >
      <iconify-icon icon="mingcute:planet-line" width="1.5rem" aria-hidden="true" />
      {{ $t('main.nav.editor') }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus'
import { uwuifyPath } from '@core/extras'
import { useFloating, autoUpdate, offset, type Placement } from '@floating-ui/vue'
import { onMounted, ref, watch, type Ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import * as Globals from '@core/globals'

const router = useRouter()
const route = useRoute()
const navMenuTrigger: Ref<HTMLElement | null> = ref(null)
const navMenu: Ref<HTMLElement | null> = ref(null)
const navFloatingPlacement: Ref<Placement> = ref('right')
const navFloatingStyles = useFloating(navMenuTrigger, navMenu, {
  whileElementsMounted: autoUpdate,
  placement: navFloatingPlacement,
  middleware: [offset(8)],
})
const isNavMenuOpen: Ref<boolean> = ref(false)

onMounted(() => {
  EventBus.registerWindowEventListener('resize', updateNavFloatingLayout)
  updateNavFloatingLayout()
})
watch(
  () => EventBus.clickEvent.value,
  (evt) => {
    if (!evt) return;
    if (evt.target === navMenuTrigger.value) {
      toggleNavMenu()
    } else if (!navMenu.value?.contains(evt.target as Node)) {
      toggleNavMenu(false)
    }
  }
)

function updateNavFloatingLayout() {
  if (window.innerWidth < Globals.SM_WIDTH_THRESHOLD) {
    navFloatingPlacement.value = 'bottom-start'
  } else {
    navFloatingPlacement.value = 'right'
  }
}
function toggleNavMenu(override?: boolean) {
  if (override !== undefined) {
    navMenu.value!.style.visibility = override ? 'visible' : 'hidden'
    isNavMenuOpen.value = override
  } else {
    navMenu.value!.style.visibility = navMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible'
    isNavMenuOpen.value = navMenu.value!.style.visibility === 'visible'
  }
}
</script>

<style lang="scss">
#nav-menu {
  z-index: 1;
  background: none;
  border: none;
  display: flex;
  flex-direction: row;
}

@media screen and (max-width: 767px) {
  #nav-menu {
    flex-direction: column;
  }
}
</style>
