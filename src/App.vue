<script setup>
import { onMounted } from 'vue'
// Element Plus 기본 언어는 영어다. 날짜·페이지네이션·확인창 문구를 한국어로 통일한다.
import ko from 'element-plus/es/locale/lang/ko'
import TheHeader from '@/components/TheHeader.vue'
import { useWeatherStore } from '@/stores/weatherStore'

// 어느 주소로 처음 들어오든(대시보드·상세·비교) 실시간 관측값을 한 번 채워 둔다
const weatherStore = useWeatherStore()
onMounted(weatherStore.ensureLoaded)
</script>

<template>
  <!-- 언어팩·컴포넌트 기본 크기를 앱 전체에 한 번에 내려보낸다 -->
  <el-config-provider :locale="ko" size="default">
    <div class="app-shell">
      <TheHeader />

      <main class="route-content">
        <RouterView />
      </main>

      <el-backtop :right="24" :bottom="24" />
    </div>
  </el-config-provider>
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
