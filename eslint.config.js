import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  // 커스텀 규칙 — 배열 아래쪽일수록 앞선 규칙을 덮어쓰므로 skipFormatting 바로 앞에 둔다
  {
    name: 'app/custom-rules',
    rules: {
      eqeqeq: ['error', 'always'], // 느슨한 비교(==)를 금지하고 === 를 강제한다
      'no-console': 'off', // 개발 편의를 위해 console.log 허용
    },
  },

  skipFormatting,
])
