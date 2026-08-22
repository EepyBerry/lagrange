<template>
  <div id="app-logo-wrapper">
    <SVGAppLogoUwU v-if="$route.query.uwu !== undefined" :aria-label="$t('a11y.logo_alt')" />
    <template v-else>
      <img id="app-logo-planet" src="/lagrange_logo_planet.png" alt="logo-planet" />
      <SVGAppLogo :aria-label="$t('a11y.logo')" />
    </template>
  </div>
</template>

<script setup lang="ts">
import SVGAppLogo from '@components/global/svg/SVGAppLogo.vue';
import SVGAppLogoUwU from '@components/global/svg/SVGAppLogoUwU.vue';
import { useRoute } from 'vue-router';
const $route = useRoute();
defineProps<{ showUpdate?: boolean }>();
</script>

<style scoped lang="scss">
#app-logo-wrapper {
  z-index: 0;
  position: relative;
  display: flex;
  height: 240px;

  #app-logo-planet {
    z-index: -1;
    position: absolute;
    inset: 0;
    transform: translate(5px, 5px);
    height: calc(95.833333%);
    filter: drop-shadow(0px 0px 8px var(--lg-logo-shadow));
  }

  #app-logo,
  #app-logo-uwu {
    height: inherit;
    max-width: 16rem;
    align-self: center;
    overflow: visible;
  }
}

@media screen and (max-width: 767px) {
  #app-logo-wrapper {
    #app-logo,
    #app-logo-uwu {
      justify-self: center;
    }
  }
}
</style>
