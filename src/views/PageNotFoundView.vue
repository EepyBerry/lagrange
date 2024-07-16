<template>
  <div id="container">
    <AppLogo />
    <div class="text">
      <h1 v-if="msgVariant === 1" class="title">{{ $t('main.404_01') }}</h1>
      <h1 v-if="msgVariant === 2" class="title"><i>{{ $t('main.404_02') }}</i></h1>
      <h1 v-if="msgVariant === 3" class="title">{{ $t('main.404_03') }}</h1>
      <h1 class="title ultra" v-if="msgVariant === 4">{{ $t('main.404_04') }}</h1>
      <p class="subtitle">{{ $t('main.404_subtitle') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from '@/components/elements/AppLogo.vue';
import { useHead } from '@unhead/vue';
import { onMounted, ref } from 'vue';
useHead({ meta: [
  { name: 'robots', content: 'noindex' },
  { name: 'description', content: 'Default error page' }
]})

const msgVariant = ref(0)

onMounted(() => {
  msgVariant.value = Math.floor(Math.random() * 4) + 1

})

</script>

<style scoped lang="scss">
#container {
  flex: 1;
  background: url('skybox/space_up.png');
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;

  #app-logo, #app-logo-uwu {
    width: clamp(200px, 37.5vw, 300px);
    align-self: center;
    justify-self: center;
  }

  .text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    text-align: center;
    padding-bottom: 2rem;
  }

  .title {
    font-size: clamp(2rem, 5vw, 2.5rem);
  }
  .subtitle {
    text-align: center;
    font-size: 1rem;
  }
  .ultra {
    font-family: VCR OSD Mono;
  }
}
</style>