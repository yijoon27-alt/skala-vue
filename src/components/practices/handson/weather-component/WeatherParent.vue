<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherDetailModal from './WeatherDetailModal.vue'
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
const selectedCityId = ref('')
const favoriteIds = ref([])
const activeIndex = ref(-1)
const detailCity = ref(null)

const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]
const HANGUL_FIRST = 0xac00
const HANGUL_LAST = 0xd7a3
const CHO_STRIDE = 588

const isCompleteHangul = (code) => code >= HANGUL_FIRST && code <= HANGUL_LAST
const isJamo = (character) => /[ㄱ-ㅎ]/.test(character)

const chosungOf = (character) => {
  const code = character.charCodeAt(0)
  if (!isCompleteHangul(code)) return null
  return CHOSUNG[Math.floor((code - HANGUL_FIRST) / CHO_STRIDE)]
}

const hangulMatch = (name, query) => {
  if (!query || name.includes(query)) return true

  for (let start = 0; start + query.length <= name.length; start++) {
    let matched = true
    for (let index = 0; index < query.length; index++) {
      const queryCharacter = query[index]
      const nameCharacter = name[start + index]
      if (queryCharacter === nameCharacter) continue
      if (isJamo(queryCharacter) && chosungOf(nameCharacter) === queryCharacter) continue
      matched = false
      break
    }
    if (matched) return true
  }
  return false
}

const withParticle = (word, withBatchim, withoutBatchim) => {
  const code = word.at(-1)?.charCodeAt(0) ?? 0
  if (!isCompleteHangul(code)) return `${word}${withBatchim}`
  return `${word}${(code - HANGUL_FIRST) % 28 === 0 ? withoutBatchim : withBatchim}`
}

const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => hangulMatch(city.name, query))
})

const isChosungQuery = computed(() => /^[ㄱ-ㅎ]+$/.test(searchQuery.value.trim()))
const activeCityName = computed(() => filteredWeatherList.value[activeIndex.value]?.name ?? '')

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

const toggleFavorite = (cityId) => {
  favoriteIds.value = favoriteIds.value.includes(cityId)
    ? favoriteIds.value.filter((id) => id !== cityId)
    : [...favoriteIds.value, cityId]
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

const openModal = (city) => {
  detailCity.value = city
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
        :is-chosung-query="isChosungQuery"
        :active-city-name="activeCityName"
        @update-query="updateSearchQuery"
        @move-highlight="moveHighlight"
        @select-highlight="selectHighlight"
        @reset-query="resetSearch"
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
        v-for="(city, index) in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :is-favorite="favoriteIds.includes(city.id)"
        :is-highlighted="activeIndex === index"
        :is-selected="selectedCityId === city.id"
        @select-card="selectCity"
        @click-detail="showDetail"
        @open-modal="openModal"
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
      <p>초성 검색 · 키보드 탐색 · 상세 모달 · Named Slot · 요약 컴포넌트 · 즐겨찾기</p>
    </section>

    <WeatherDetailModal v-if="detailCity" :city="detailCity" @close="detailCity = null" />
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
