<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const { format, formatDelta } = useTemperature()

const validCityId = (value, fallback) =>
  typeof value === 'string' && weatherStore.findCity(value) ? value : fallback

const leftCityId = ref(validCityId(route.query.left, 'city_01'))
const rightCityId = ref(validCityId(route.query.right, 'city_02'))

const leftCity = computed(() => weatherStore.findCity(leftCityId.value))
const rightCity = computed(() => weatherStore.findCity(rightCityId.value))
// 기온 "차이" 는 formatDelta 로 표시한다. 교재 p.212 샘플의 절대 온도 변환식(+32)을
// 그대로 쓰면 4℃ 차이가 화씨에서 39℉ 로 나온다 (정답은 7.2℉).
const temperatureGap = computed(() => Math.abs(leftCity.value.temp - rightCity.value.temp))

watch(
  [leftCityId, rightCityId],
  ([left, right]) => {
    if (route.query.left === left && route.query.right === right) return
    router.replace({ name: 'WeatherCompare', query: { left, right } })
  },
  { immediate: true },
)

const swapCities = () => {
  const previousLeft = leftCityId.value
  leftCityId.value = rightCityId.value
  rightCityId.value = previousLeft
}
</script>

<template>
  <section class="compare-container">
    <header>
      <div>
        <p class="eyebrow">SHAREABLE COMPARISON</p>
        <h1>도시 날씨 비교</h1>
      </div>
      <button type="button" @click="swapCities">⇄ 위치 바꾸기</button>
    </header>

    <div class="selectors">
      <label>
        첫 번째 도시
        <select v-model="leftCityId">
          <option v-for="city in weatherStore.cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
      </label>
      <label>
        두 번째 도시
        <select v-model="rightCityId">
          <option v-for="city in weatherStore.cities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
      </label>
    </div>

    <div class="comparison-grid">
      <article v-for="city in [leftCity, rightCity]" :key="city.id">
        <h2>{{ city.name }}</h2>
        <p class="temperature">{{ format(city.temp) }}</p>
        <dl>
          <div>
            <dt>날씨</dt>
            <dd>{{ city.status }}</dd>
          </div>
          <div>
            <dt>체감</dt>
            <dd>{{ format(city.feelsLike) }}</dd>
          </div>
          <div>
            <dt>습도</dt>
            <dd>{{ city.humidity }}%</dd>
          </div>
          <div>
            <dt>풍속</dt>
            <dd>{{ city.wind }}m/s</dd>
          </div>
        </dl>
        <RouterLink :to="{ name: 'WeatherDetail', params: { cityId: city.id } }">
          {{ city.name }} 상세보기
        </RouterLink>
      </article>
    </div>

    <p class="comparison-note">
      두 도시의 현재 기온 차이는 <strong>{{ formatDelta(temperatureGap) }}</strong
      >입니다. 선택한 도시는 URL 쿼리에 저장됩니다.
    </p>
  </section>
</template>

<style scoped>
.compare-container {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

header,
.selectors,
.comparison-grid,
dl div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

header {
  align-items: center;
}

.eyebrow {
  margin: 0;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

h1 {
  margin: 4px 0 0;
}

button,
select {
  padding: 9px 12px;
  border: 1px solid #b2bec3;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

.selectors {
  margin: 24px 0 14px;
}

label,
select {
  width: 100%;
}

label {
  color: #636e72;
  font-size: 13px;
  font-weight: 700;
}

select {
  display: block;
  margin-top: 6px;
  color: #2d3436;
}

.comparison-grid article {
  flex: 1;
  padding: 20px;
  border-radius: 10px;
  background: #f4f7fb;
}

.comparison-grid h2,
.comparison-grid dl,
.comparison-grid dd {
  margin: 0;
}

.temperature {
  margin: 8px 0 16px;
  font-size: 36px;
  font-weight: 700;
}

dl div {
  padding: 8px 0;
  border-bottom: 1px solid #dfe6e9;
}

dd {
  font-weight: 700;
}

article a {
  display: inline-block;
  margin-top: 16px;
  color: #6c5ce7;
  font-weight: 700;
}

.comparison-note {
  margin: 18px 0 0;
  padding: 12px;
  border-left: 4px solid #6c5ce7;
  background: #f1efff;
}

@media (max-width: 640px) {
  .selectors,
  .comparison-grid {
    flex-direction: column;
  }
}
</style>
