import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue, { Options } from '@vitejs/plugin-vue'

const vuePluginConfig: Options = {
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('iconify-'),
    },
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glsl', '**/*.ico', '**/*.ttf'],
  plugins: [vue(vuePluginConfig)],
  build: {
    sourcemap: true,
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
    },
  },
})
