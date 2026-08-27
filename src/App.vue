<script setup>
import { onMounted } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import { useWeatherStore } from '@/stores/weatherStore'

// 어느 주소로 처음 들어오든(대시보드·상세·비교) 실시간 관측값을 한 번 채워 둔다
const weatherStore = useWeatherStore()
onMounted(weatherStore.ensureLoaded)
</script>

<template>
  <div class="app-shell">
    <TheHeader />

    <main class="route-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f4f7fb;
}

.route-content {
  width: min(920px, 100%);
  margin: 0 auto;
  padding: 24px 20px 48px;
}
</style>
