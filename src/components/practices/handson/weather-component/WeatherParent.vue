<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherSummary from './WeatherSummary.vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 55 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 88 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 72 },
  { id: 'city_04', name: '제주', temp: 30, status: '흐림', humidity: 79 },
  { id: 'city_05', name: '강릉', temp: 22, status: '소나기', humidity: 91 },
])

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 도시를 검색해 보세요.')
const favoriteIds = ref([])

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(query))
})

const summary = computed(() => {
  const list = filteredWeatherList.value
  if (!list.length) return { count: 0, average: 0, hottest: '-' }

  const hottest = list.reduce((result, city) => (city.temp > result.temp ? city : result))
  return {
    count: list.length,
    average: Math.round(list.reduce((sum, city) => sum + city.temp, 0) / list.length),
    hottest: hottest.name,
  }
})

watch(selectedCityInfo, (newInfo) => {
  console.log(`[선택 변경] ${newInfo}`)
})

watchEffect(() => {
  console.log(`[검색 추적] "${searchQuery.value}"`)
})

const toggleFavorite = (cityId) => {
  favoriteIds.value = favoriteIds.value.includes(cityId)
    ? favoriteIds.value.filter((id) => id !== cityId)
    : [...favoriteIds.value, cityId]
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <main class="dashboard-wrapper">
    <h1>지역별 날씨 대시보드</h1>

    <BaseDashboardCard>
      <template #header>
        <h2>도시 검색</h2>
      </template>
      <SearchBar
        :current-query="searchQuery"
        :result-count="filteredWeatherList.length"
        @update-query="(value) => (searchQuery = value)"
      />
      <template #footer>
        <small>검색 조건과 날씨 데이터는 부모 컴포넌트가 관리합니다.</small>
      </template>
    </BaseDashboardCard>

    <WeatherSummary :summary="summary" :favorite-count="favoriteIds.length" />

    <BaseDashboardCard>
      <template #header>
        <h2>지역별 날씨 현황</h2>
      </template>
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :is-favorite="favoriteIds.includes(city.id)"
        @select-card="(message) => (selectedCityInfo = message)"
        @click-detail="showDetail"
        @toggle-favorite="toggleFavorite"
      />
      <p v-if="filteredWeatherList.length === 0" class="empty">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
      <template #footer>
        <p class="status-bar">{{ selectedCityInfo }}</p>
      </template>
    </BaseDashboardCard>

    <section class="feature-summary">
      <h2>✅ 기본 기능</h2>
      <p>컴포넌트 분리 · Props 하향 전달 · Emits 상향 전달 · Slot 레이아웃 주입</p>
      <h2>✨ 추가 기능</h2>
      <p>Named Slot 영역 · 날씨 요약 컴포넌트 · 즐겨찾기 Props/Emit 왕복</p>
    </section>
  </main>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(720px, 100%);
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

h2,
p {
  margin: 0;
}

.status-bar {
  color: #2d3436;
  font-weight: 700;
}

.empty {
  padding: 20px;
  color: #c0392b;
  text-align: center;
}

.feature-summary {
  padding: 15px;
  border-left: 4px solid #6c5ce7;
  background: #f4f2ff;
}

.feature-summary h2:not(:first-child) {
  margin-top: 14px;
}

@media (max-width: 560px) {
  .dashboard-wrapper {
    padding: 10px;
  }
}
</style>
