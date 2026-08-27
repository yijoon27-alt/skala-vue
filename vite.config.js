import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(() => ({
  // 호스팅마다 앱이 놓이는 위치가 다르다.
  //   GitHub Pages : https://<user>.github.io/<repo>/  → asset 경로에 저장소 이름이 붙어야 한다
  //   Vercel       : https://<project>.vercel.app/     → 루트라 접두사를 붙이면 asset 이 404 난다
  // 그래서 접두사를 코드에 박지 않고 빌드 환경변수로 받는다.
  // GitHub Actions 워크플로만 VITE_BASE_PATH='/skala-vue/' 를 넣어 주고,
  // Vercel·로컬 개발 서버는 값이 없어 기본값 '/' 를 쓴다.
  base: process.env.VITE_BASE_PATH || '/',
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
