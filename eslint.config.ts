import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from 'eslint-config-prettier/flat';
import pluginOxlint from 'eslint-plugin-oxlint';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

export default defineConfigWithVueTs(
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),
  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
  skipFormatting,
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'ban-ts-comment': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn'],
    },
  },
);
