<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findWeatherCity } from '@/data/weather'

const route = useRoute()
const router = useRouter()
const cityData = computed(() => findWeatherCity(String(route.params.cityId)))

const goDashboard = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <section class="detail-container">
    <template v-if="cityData">
      <p class="eyebrow">OBSERVATION {{ cityData.observedAt }}</p>
      <h1>{{ cityData.fullName }}</h1>
      <p class="weather-status">{{ cityData.status }} · {{ cityData.temp }}°C</p>

      <dl class="observation-grid">
        <div>
          <dt>체감 온도</dt>
          <dd>{{ cityData.feelsLike }}°C</dd>
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
      </dl>

      <div class="actions">
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

.weather-status {
  margin: 12px 0 24px;
  font-size: 28px;
  font-weight: 700;
}

.observation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  gap: 10px;
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
