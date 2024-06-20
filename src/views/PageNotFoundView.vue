<template>
  <span>Page not found :c</span>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue';
useHead({ meta: [
  { name: 'robots', content: 'noindex' },
  { name: 'description', content: 'Default error page' }
]})
</script>