<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <section class="not-found">
    <p class="error-code">404</p>
    <h1>페이지를 찾을 수 없습니다.</h1>
    <p>
      요청 경로 <code>{{ route.fullPath }}</code
      >와 일치하는 화면이 없습니다.
    </p>
    <button type="button" @click="router.push({ name: 'WeatherHome' })">
      날씨 대시보드로 이동
    </button>
  </section>
</template>

<style scoped>
.not-found {
  padding: 56px 24px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

.error-code {
  margin: 0;
  color: #6c5ce7;
  font-size: 64px;
  font-weight: 700;
}

code {
  color: #c0392b;
}

button {
  padding: 10px 14px;
  border: 0;
  border-radius: 6px;
  background: #6c5ce7;
  color: #fff;
  cursor: pointer;
}
</style>
