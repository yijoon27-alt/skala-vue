<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <section class="content-card">
    <p class="eyebrow">ABOUT</p>
    <h1>SKALA Weather 소개</h1>
    <p>
      Vue 3와 Vue Router로 만든 클라이언트 사이드 날씨 대시보드입니다. 페이지를 새로 요청하지 않고
      URL과 함께 화면을 전환합니다.
    </p>

    <ul>
      <li><code>RouterLink</code>를 통한 SPA 내비게이션</li>
      <li><code>/weather/:cityId</code> 동적 경로 상세 페이지</li>
      <li>지연 로딩 View와 Catch-all 404 화면</li>
      <li>쿼리 문자열로 검색·비교 상태 복원</li>
    </ul>

    <button type="button" @click="router.push({ name: 'WeatherHome' })">
      메인 대시보드로 돌아가기
    </button>
  </section>
</template>

<style scoped>
.content-card {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
  line-height: 1.7;
}

.eyebrow {
  margin: 0;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

h1 {
  margin-top: 4px;
}

li {
  margin-bottom: 6px;
}

code {
  padding: 2px 5px;
  border-radius: 4px;
  background: #f1efff;
  color: #5f4bc6;
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
