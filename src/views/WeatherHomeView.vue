<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/practices/handson/weather-component/BaseDashboardCard.vue'
import SearchBar from '@/components/practices/handson/weather-component/SearchBar.vue'
import WeatherCard from '@/components/practices/handson/weather-component/WeatherCard.vue'
import WeatherSummary from '@/components/practices/handson/weather-component/WeatherSummary.vue'
import { hangulMatch, withParticle } from '@/utils/hangul'
import { useConfigStore } from '@/stores/configStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useWeatherStore } from '@/stores/weatherStore'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const favoriteStore = useFavoriteStore()
// 실시간 관측값(실패 시 샘플 값)을 한곳에서 받는다
const weatherStore = useWeatherStore()

const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 도시를 검색해 보세요.')
const selectedCityId = ref('')
const activeIndex = ref(-1)

const routeSearch = () => (typeof route.query.search === 'string' ? route.query.search : '')

const restoreSearchFromRoute = () => {
  const query = routeSearch()
  if (searchQuery.value !== query) searchQuery.value = query
}

onMounted(restoreSearchFromRoute)
watch(() => route.query.search, restoreSearchFromRoute)

watch(searchQuery, (newQuery) => {
  if (newQuery === routeSearch()) return
  router.replace({
    name: 'WeatherHome',
    query: newQuery ? { search: newQuery } : {},
  })
})

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  const source = weatherStore.cities
  const searched = query ? source.filter((city) => hangulMatch(city.name, query)) : source
  // configStore(필터 설정) + favoriteStore(즐겨찾기 목록) 두 스토어가 여기서 합쳐진다
  if (!configStore.favoritesOnly) return searched
  return searched.filter((city) => favoriteStore.isFavorite(city.id))
})

const isChosungQuery = computed(() => /^[ㄱ-ㅎ]+$/.test(searchQuery.value.trim()))
const activeCityName = computed(() => filteredWeatherList.value[activeIndex.value]?.name ?? '')
const briefingCityId = computed(
  () => selectedCityId.value || filteredWeatherList.value[0]?.id || 'city_01',
)

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

const updateSearchQuery = (value) => {
  searchQuery.value = value
  activeIndex.value = -1
}

const moveHighlight = (delta) => {
  const count = filteredWeatherList.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + delta + count) % count
}

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${withParticle(city.name, '이', '가')} 선택되었습니다.`
  activeIndex.value = filteredWeatherList.value.findIndex((item) => item.id === city.id)
}

const selectHighlight = () => {
  const city = filteredWeatherList.value[activeIndex.value] ?? filteredWeatherList.value[0]
  if (city) selectCity(city)
}

const resetSearch = () => {
  searchQuery.value = ''
  activeIndex.value = -1
  selectedCityInfo.value = '검색을 초기화했습니다.'
}

const handleDetailJump = (city) => {
  router.push(`/weather/${city.id}`)
}
</script>

<template>
  <section class="dashboard-wrapper">
    <header class="page-heading">
      <div>
        <p class="eyebrow">WEATHER DASHBOARD</p>
        <h1>지역별 날씨</h1>
      </div>
      <div class="page-actions">
        <el-tag :type="weatherStore.isLive ? 'success' : 'warning'" effect="light" round>
          {{ weatherStore.sourceLabel }}
        </el-tag>
        <RouterLink
          :to="{
            name: 'WeatherBriefing',
            params: { cityId: briefingCityId },
            query: { activity: 'commute' },
          }"
        >
          생활 날씨 브리핑
        </RouterLink>
        <RouterLink :to="{ name: 'WeatherLive' }">실시간 관측</RouterLink>
        <RouterLink :to="{ name: 'WeatherCompare' }">도시 비교하기 →</RouterLink>
      </div>
    </header>

    <el-alert
      v-if="weatherStore.errorMessage"
      class="fallback-alert"
      type="warning"
      show-icon
      :closable="false"
      title="실시간 관측값을 불러오지 못했습니다"
      :description="`${weatherStore.errorMessage} 저장된 샘플 값으로 표시 중입니다.`"
    />

    <BaseDashboardCard>
      <template #header><h2>도시 검색</h2></template>
      <SearchBar
        :current-query="searchQuery"
        :result-count="filteredWeatherList.length"
        :is-chosung-query="isChosungQuery"
        :active-city-name="activeCityName"
        @update-query="updateSearchQuery"
        @move-highlight="moveHighlight"
        @select-highlight="selectHighlight"
        @reset-query="resetSearch"
      />
      <template #footer>
        <small>검색어는 URL에 저장되어 새로고침 후에도 복원됩니다.</small>
      </template>
    </BaseDashboardCard>

    <WeatherSummary :summary="summary" :favorite-count="favoriteStore.count" />

    <BaseDashboardCard>
      <template #header>
        <div class="list-header">
          <h2>지역별 날씨 현황</h2>
          <label>
            <input
              type="checkbox"
              :checked="configStore.favoritesOnly"
              @change="configStore.toggleFavoritesOnly"
            />
            즐겨찾기만 보기
          </label>
        </div>
      </template>
      <el-skeleton v-if="weatherStore.isLoading" :rows="4" animated />

      <WeatherCard
        v-for="(city, index) in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :is-favorite="favoriteStore.isFavorite(city.id)"
        :is-highlighted="activeIndex === index"
        :is-selected="selectedCityId === city.id"
        detail-label="상세보기"
        :show-panel-action="false"
        @select-card="selectCity"
        @click-detail="handleDetailJump"
        @toggle-favorite="favoriteStore.toggle"
      />
      <el-empty
        v-if="filteredWeatherList.length === 0 && !weatherStore.isLoading"
        :description="
          configStore.favoritesOnly
            ? '즐겨찾기한 도시가 없습니다. 필터를 해제하거나 ☆ 를 눌러 추가하세요.'
            : '검색 결과와 일치하는 도시가 없습니다.'
        "
      />
      <template #footer
        ><p class="status-bar">{{ selectedCityInfo }}</p></template
      >
    </BaseDashboardCard>

    <section class="feature-summary">
      <h2>✅ 기본 기능</h2>
      <p>
        RouterView 페이지 렌더링 · 동적 상세 경로 · Programmatic Navigation · 실시간 날씨 API 연동
      </p>
      <h2>✨ 추가 기능</h2>
      <p>
        초성 검색 · 키보드 탐색 · URL 상태 복원 · 두 도시 비교 · 목적별 생활 날씨 브리핑 · 온도 단위
        전환 · 즐겨찾기 저장 · 설정 변경 이력 · 실시간 날씨 연동 · UI 라이브러리 적용
      </p>
    </section>
  </section>
</template>

<style scoped>
.dashboard-wrapper {
  width: min(720px, 100%);
  margin: 0 auto;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.page-heading a {
  color: #6c5ce7;
  font-weight: 700;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.eyebrow {
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1,
h2,
p {
  margin: 0;
}

.status-bar {
  color: #2d3436;
  font-weight: 700;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list-header label {
  color: #636e72;
  font-size: 14px;
}

.fallback-alert {
  margin-bottom: 16px;
}

.feature-summary {
  padding: 15px;
  border-left: 4px solid #6c5ce7;
  background: #f4f2ff;
}

.feature-summary h2:not(:first-child) {
  margin-top: 14px;
}
</style>
