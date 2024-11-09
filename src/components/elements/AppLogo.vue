<template>
  <SVGAppLogoUwU v-if="$route.query.uwu !== undefined" :aria-label="$t('a11y.logo_alt')" />
  <template v-else>
    <SVGAppLogo :aria-label="$t('a11y.logo')" />
    <SVGAppLogoUpdate v-if="showUpdate" />
  </template>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import SVGAppLogo from '../svg/SVGAppLogo.vue'
import SVGAppLogoUwU from '../svg/SVGAppLogoUwU.vue'
import SVGAppLogoUpdate from '../svg/SVGAppLogoUpdate.vue'
const $route = useRoute()
defineProps<{ showUpdate?: boolean }>()
</script>

<style scoped lang="scss">
#app-logo,
#app-logo-uwu {
  width: 240px;
  max-width: 16rem;
  align-self: center;
}
#app-logo-update {
  position: absolute;
  bottom: 16px;
  width: 180px;
  margin: 0 auto;
  max-width: 16rem;
  align-self: center;
}

@media screen and (max-width: 767px) {
  #app-logo,
  #app-logo-uwu {
    justify-self: center;
  }
}
</style>
