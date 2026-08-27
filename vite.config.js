import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages 는 https://<user>.github.io/<repo>/ 하위에서 서비스되므로
  // 빌드 산출물의 asset 경로에 저장소 이름이 붙어야 한다.
  // 개발 서버(command === 'serve')는 그대로 '/' 를 써서 localhost:3000/ 으로 접속한다.
  base: command === 'build' ? '/skala-vue/' : '/',
  plugins: [vue(), vueDevTools()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
