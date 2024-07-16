import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue, { Options } from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl';

const vuePluginConfig: Options = {
  template: {
    compilerOptions: {
      isCustomElement: tag => tag.startsWith('iconify-')
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glsl', '**/*.jpg', '**/*.ico', '**/*.ttf'],
  plugins: [
    vue(vuePluginConfig),
    //VueDevTools(),
    glsl()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  }
})
