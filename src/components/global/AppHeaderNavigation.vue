<template>
  <div id="header-nav">
    <LgvButton
      id="nav-menu-trigger"
      ref="navMenuTrigger"
      variant="icon"
      icon="material-symbols:menu"
      iconWidth="1.5rem"
      :class="{ active: isNavMenuOpen }"
    />
    <div id="header-nav-logo-wrapper">
      <SVGAppLogoText />
    </div>
  </div>

  <!------ BEGIN floating menus ------>
  <Teleport to="body">
    <div id="nav-menu" ref="navMenu" class="floating" :style="navFloating.floatingStyles.value">
      <LgvLink
        id="nav-link-codex"
        variant="dark"
        link-type="internal"
        icon="material-symbols:format-list-bulleted"
        :href="uwuifyPath('/')"
      >
        {{ $t('codex.$title') }}
      </LgvLink>
      <LgvLink
        id="nav-link-editor"
        variant="dark"
        link-type="internal"
        icon="material-symbols:edit-document-outline"
        :href="uwuifyPath('/planet-editor/new')"
      >
        {{ $t('editor.$title') }}
      </LgvLink>
    </div>
  </Teleport>
  <!------ END floating menus ------>
</template>

<script setup lang="ts">
import SVGAppLogoText from '@components/global/svg/SVGAppLogoText.vue';
import { uwuifyPath } from '@core/extras.ts';
import { offset, autoUpdate, useFloating, type UseFloatingReturn } from '@floating-ui/vue';
import LgvButton from '@lib/components/base/LgvButton.vue';
import LgvLink from '@lib/components/base/LgvLink.vue';
import { useEventListener } from '@vueuse/core';
import { ref, useTemplateRef, type Ref } from 'vue';

const isNavMenuOpen: Ref<boolean> = ref(false);
const navMenuTrigger = useTemplateRef<InstanceType<typeof LgvButton>>('navMenuTrigger');
const navMenu = useTemplateRef('navMenu');
const navFloating: UseFloatingReturn = useFloating(navMenuTrigger, navMenu, {
  whileElementsMounted: autoUpdate,
  placement: 'bottom-start',
  middleware: [offset(8)],
});

useEventListener(window, 'click', onWindowClick);
function onWindowClick(evt: MouseEvent) {
  if ((evt.target as HTMLElement).id === navMenuTrigger.value!.$el.id) {
    toggleNavMenu();
  } else if (!navMenu.value?.contains(evt.target as Node)) {
    toggleNavMenu(false);
  }
}

function toggleNavMenu(override?: boolean) {
  if (override !== undefined) {
    navMenu.value!.style.visibility = override ? 'visible' : 'hidden';
    isNavMenuOpen.value = override;
  } else {
    navMenu.value!.style.visibility = navMenu.value!.style.visibility === 'visible' ? 'hidden' : 'visible';
    isNavMenuOpen.value = navMenu.value!.style.visibility === 'visible';
  }
}
</script>

<style scoped lang="scss">
#header-nav {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;

  #nav-menu-trigger {
    color: var(--lg-contrast);
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
    padding: 0.5rem;
  }
  #header-nav-logo-wrapper {
    height: 100%;
    padding: 0 0.5rem 0 0.625rem;
    border-right: var(--lg-var-border-width) solid var(--lg-accent);
    display: flex;
    align-items: center;
  }
}
#nav-menu {
  z-index: 10;
  font-size: 0.875rem;
  box-shadow: 0 0 1rem var(--lg-black);
  a {
    justify-content: flex-start;
  }
}
</style>
