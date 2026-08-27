<script setup>
const myRegion = `Suwon`
const regionGreeting = `웰컴 투 ${myRegion}`

// 빌드 모드에 따라 주입되는 환경 변수
const currentApiUrl = import.meta.env.VITE_API_URL
const currentMode = import.meta.env.MODE

console.log('현재 주입된 API 서버 주소:', currentApiUrl)
console.log('현재 빌드 모드:', currentMode)
</script>

<template>
  <div class="practice-section">
    <h2>빌드 환경 변수</h2>
    <p>{{ regionGreeting }}</p>
    <p>현재 빌드 모드: {{ currentMode }}</p>
    <p>연동 API 엔드포인트: {{ currentApiUrl ?? '(설정 없음)' }}</p>
  </div>
</template>
