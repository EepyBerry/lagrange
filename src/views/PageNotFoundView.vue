<template>
  <div id="container">
    <AppLogo />
    <div class="text">
      <h1 v-if="msgVariant === 1" class="title">{{ $t('404.text_01') }}</h1>
      <h1 v-if="msgVariant === 2" class="title">
        <i>{{ $t('404.text_02') }}</i>
      </h1>
      <h1 v-if="msgVariant === 3" class="title">{{ $t('404.text_03') }}</h1>
      <h1 class="title ultra" v-if="msgVariant === 4">{{ $t('404.text_04') }}</h1>
      <p class="subtitle">{{ $t('404.subtext') }}</p>
      <a class="home-link lg link-button" href="/">
        <iconify-icon icon="mingcute:book-2-line" height="1.5rem" />
        {{ $t('404.link') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppLogo from '@components/elements/AppLogo.vue'
import { useHead } from '@unhead/vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
useHead({
  title: i18n.t('404.$title') + ' · ' + i18n.t('main.$title'),
  meta: [
    { name: 'robots', content: 'noindex' },
    { name: 'description', content: 'Page not found' },
  ],
})

const msgVariant = ref(0)

onMounted(() => {
  msgVariant.value = Math.floor(Math.random() * 4) + 1
})
</script>

<style scoped lang="scss">
#container {
  flex: 1;
  background: var(--lg-panel);
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;

  #app-logo,
  #app-logo-uwu {
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
  .home-link {
    padding: 0.5rem;
  }
}
</style>
