<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const router = useRouter()
const favoriteStore = useFavoriteStore()
const weatherStore = useWeatherStore()
const { format } = useTemperature()

const cityData = computed(() => weatherStore.findCity(String(route.params.cityId)))
// 대기질은 좌표가 같아도 엔드포인트가 달라 따로 받아온다 (상세 화면에서만 필요)
const airData = computed(() => weatherStore.findAir(String(route.params.cityId)))

watch(
  () => route.params.cityId,
  (cityId) => weatherStore.loadAir(String(cityId)),
  {
    immediate: true,
  },
)

const goDashboard = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <section class="detail-container">
    <template v-if="cityData">
      <p class="eyebrow">OBSERVATION {{ cityData.observedAt }}</p>
      <h1>{{ cityData.fullName }}</h1>
      <p class="weather-status">{{ cityData.status }} · {{ format(cityData.temp) }}</p>
      <p class="source-line">
        {{ cityData.source === 'live' ? '실시간 관측값' : '샘플 값' }}
        <span v-if="airData">
          · 대기질 {{ airData.aqiLabel }} (미세먼지 {{ airData.pm10 }}㎍/㎥)</span
        >
      </p>

      <dl class="observation-grid">
        <div>
          <dt>체감 온도</dt>
          <dd>{{ format(cityData.feelsLike) }}</dd>
        </div>
        <div>
          <dt>습도</dt>
          <dd>{{ cityData.humidity }}%</dd>
        </div>
        <div>
          <dt>풍속</dt>
          <dd>{{ cityData.wind }}m/s</dd>
        </div>
        <div>
          <dt>강수 확률</dt>
          <dd>{{ cityData.precipitation }}%</dd>
        </div>
        <div v-if="airData">
          <dt>초미세먼지</dt>
          <dd>{{ airData.pm25 }}㎍/㎥</dd>
        </div>
      </dl>

      <div class="actions">
        <button
          type="button"
          :class="['favorite', { on: favoriteStore.isFavorite(cityData.id) }]"
          :aria-pressed="favoriteStore.isFavorite(cityData.id)"
          @click="favoriteStore.toggle(cityData.id)"
        >
          {{ favoriteStore.isFavorite(cityData.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
        </button>
        <button type="button" @click="router.back()">← 이전 페이지</button>
        <button type="button" @click="goDashboard">메인 대시보드</button>
        <RouterLink
          :to="{
            name: 'WeatherBriefing',
            params: { cityId: cityData.id },
            query: { activity: 'commute' },
          }"
        >
          생활 날씨 브리핑
        </RouterLink>
        <RouterLink :to="{ name: 'WeatherLive' }">실시간 관측</RouterLink>
        <RouterLink
          :to="{
            name: 'WeatherCompare',
            query: { left: cityData.id, right: cityData.id === 'city_01' ? 'city_02' : 'city_01' },
          }"
        >
          이 도시 비교하기
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <p class="error-code">UNKNOWN CITY</p>
      <h1>해당 도시의 기상 데이터가 없습니다.</h1>
      <p>주소의 도시 코드를 확인해 주세요.</p>
      <button type="button" @click="goDashboard">메인 대시보드로 이동</button>
    </template>
  </section>
</template>

<style scoped>
.detail-container {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.eyebrow,
.error-code {
  margin: 0 0 8px;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

h1 {
  margin: 0;
}

.source-line {
  margin: 0 0 24px;
  color: #636e72;
  font-size: 13px;
}

.weather-status {
  margin: 12px 0 4px;
  font-size: 28px;
  font-weight: 700;
}

.observation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: 0 0 24px;
}

.observation-grid div {
  padding: 16px;
  border-radius: 8px;
  background: #f4f7fb;
}

dt {
  color: #636e72;
  font-size: 13px;
}

dd {
  margin: 6px 0 0;
  font-size: 20px;
  font-weight: 700;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.favorite.on {
  background: #b7791f;
}

button,
.actions a {
  padding: 9px 12px;
  border: 0;
  border-radius: 6px;
  background: #2d3436;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
}

@media (max-width: 640px) {
  .observation-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
