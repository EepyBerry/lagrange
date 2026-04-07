import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue, { Options } from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

const vuePluginConfig: Options = {
  template: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("iconify-"),
    },
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.glsl", "**/*.ico", "**/*.ttf"],
  plugins: [vue(vuePluginConfig), visualizer()],
  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@core": fileURLToPath(new URL("./src/core", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vue", test: /node_modules\/[@?]vue/ },
            { name: "three", test: /node_modules\/three/ },
            { name: "dexie", test: /node_modules\/dexie/ },
            { name: "export", test: /node_modules\/(pako|file-saver|jszip)/ },
          ],
        },
        minify: true
      },
    },
  },
});
