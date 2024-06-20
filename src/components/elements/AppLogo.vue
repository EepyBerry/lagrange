<template>
  <SVGAppLogoUwU v-if="$route.query.uwu !== undefined" aria-label="OwO Lagrange logo!" />
  <SVGAppLogo v-else aria-label="Lagrange logo" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import SVGAppLogo from '../svg/SVGAppLogo.vue';
import SVGAppLogoUwU from '../svg/SVGAppLogoUwU.vue';
const $route = useRoute()
</script>