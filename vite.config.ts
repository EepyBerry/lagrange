import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue, { Options } from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

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
  plugins: [vue(vuePluginConfig), visualizer()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'vue-accessible-color-picker', '@unhead/vue', 'vue-i18n'],
          three: ['three', 'three-custom-shader-material'],
          export: ['pako', 'jszip', 'file-saver'],
        },
      },
    },
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
