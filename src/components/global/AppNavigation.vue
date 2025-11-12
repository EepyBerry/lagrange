<template>
  <LgvButton
    id="nav-toggle"
    ref="navMenuTrigger"
    variant="dark"
    class="contrast"
    :class="{ active: isNavMenuOpen }"
    :icon="isNavMenuOpen ? 'material-symbols:menu-open-rounded' : 'material-symbols:menu-rounded'"
    icon-width="1.75rem"
    :a11y-label="$t('a11y.action_nav_toggle')"
  />
  <nav id="nav-menu" ref="navMenu" class="floating" :style="navFloatingStyles.floatingStyles.value">
    <LgvLink
      variant="dark"
      link-type="internal"
      class="dark contrast"
      :active="!!$route.params.id"
      :href="uwuifyPath('/codex')"
      :a11y-label="$t('a11y.action_nav_codex')"
      icon="mingcute:book-2-line"
    >
      {{ $t('main.nav.codex') }}
    </LgvLink>
    <LgvLink
      variant="dark"
      link-type="internal"
      class="dark contrast"
      :active="!!$route.params.id"
      :href="uwuifyPath('/planet-editor/new')"
      :a11y-label="$t('a11y.action_nav_editor')"
      icon="mingcute:planet-line"
    >
      {{ $t('main.nav.editor') }}
    </LgvLink>
  </nav>
</template>

<script setup lang="ts">
import { EventBus } from '@/core/event-bus'
import { uwuifyPath } from '@core/extras'
import { useFloating, autoUpdate, offset, type Placement } from '@floating-ui/vue'
import { onMounted, ref, useTemplateRef, watch, type Ref } from 'vue'
import LgvButton from '@/_lib/components/LgvButton.vue'
import * as Globals from '@core/globals'
import LgvLink from '@/_lib/components/LgvLink.vue'

const navMenuTrigger = useTemplateRef('navMenuTrigger')
const navMenu = useTemplateRef('navMenu')
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
    if ((evt.target as HTMLElement).id === navMenuTrigger.value!.$el.id) {
      console.log('evt?.target')
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
    console.log(navMenu.value!.style.visibility)
  }
}
</script>

<style lang="scss">
#nav-toggle {
  width: 2.75rem;
  height: 2.75rem;
}
#nav-menu {
  z-index: 1;
  background: none;
  border: none;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  & > a { 
    flex: 1;
    height: 2.75rem;
    width: 100%;
  }
}

@media screen and (max-width: 767px) {
  #nav-menu {
    flex-direction: column;
  }
}
</style>
