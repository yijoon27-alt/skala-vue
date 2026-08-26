<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findWeatherCity, weatherCities } from '@/data/weather'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const router = useRouter()

// 판단 임계값(체감 31℃ / 5℃ 등)은 원본 섭씨로 두고, 화면 문구에 찍히는 숫자만 변환한다
const { format } = useTemperature()

const activities = [
  {
    id: 'commute',
    label: '출퇴근',
    icon: '🚌',
    description: '이동 중 비·바람·더위 영향을 확인합니다.',
  },
  {
    id: 'exercise',
    label: '야외 운동',
    icon: '🏃',
    description: '체감온도와 습도를 중심으로 운동 부담을 판단합니다.',
  },
  {
    id: 'laundry',
    label: '빨래',
    icon: '🧺',
    description: '강수확률과 습도로 실외 건조 여부를 판단합니다.',
  },
  {
    id: 'travel',
    label: '여행',
    icon: '🧳',
    description: '이동과 야외 일정에 영향을 주는 조건을 종합합니다.',
  },
]

const activityRules = {
  commute: [
    {
      points: 2,
      test: (city) => city.precipitation >= 60,
      title: '우산을 꼭 챙기세요.',
      detail: (city) => `강수확률이 ${city.precipitation}%라 출퇴근길에 비가 올 가능성이 높습니다.`,
    },
    {
      points: 1,
      test: (city) => city.wind >= 6,
      title: '강한 바람을 조심하세요.',
      detail: (city) => `풍속 ${city.wind}m/s로 접이식 우산이 뒤집히거나 물건이 날릴 수 있습니다.`,
    },
    {
      points: 1,
      test: (city) => city.feelsLike >= 31,
      title: '더위 대비가 필요합니다.',
      detail: (city, fmt) =>
        `체감온도 ${fmt(city.feelsLike)}로 물을 챙기고 이동 중 그늘을 이용하세요.`,
    },
    {
      points: 1,
      test: (city) => city.humidity >= 85,
      title: '습한 이동 환경을 고려하세요.',
      detail: (city) =>
        `습도 ${city.humidity}%로 대중교통과 도보 이동 시 더 답답하게 느낄 수 있습니다.`,
    },
  ],
  exercise: [
    {
      points: 2,
      test: (city) => city.feelsLike >= 31,
      title: '고강도 야외 운동을 줄이세요.',
      detail: (city, fmt) =>
        `체감온도 ${fmt(city.feelsLike)}에서는 실내 운동이나 더 선선한 시간대가 좋습니다.`,
    },
    {
      points: 1,
      test: (city) => city.humidity >= 80,
      title: '휴식과 수분 보충을 늘리세요.',
      detail: (city) => `습도 ${city.humidity}%에서는 땀이 잘 증발하지 않아 신체 부담이 커집니다.`,
    },
    {
      points: 2,
      test: (city) => city.precipitation >= 50,
      title: '실내 운동으로 변경하세요.',
      detail: (city) =>
        `강수확률 ${city.precipitation}%로 노면이 미끄럽고 시야가 나빠질 수 있습니다.`,
    },
    {
      points: 1,
      test: (city) => city.wind >= 7,
      title: '바람의 영향을 확인하세요.',
      detail: (city) => `풍속 ${city.wind}m/s로 자전거·러닝 시 균형을 잃지 않도록 주의하세요.`,
    },
  ],
  laundry: [
    {
      points: 3,
      test: (city) => city.precipitation >= 40,
      title: '실내 건조를 추천합니다.',
      detail: (city) => `강수확률 ${city.precipitation}%로 외출 중 빨래가 젖을 위험이 있습니다.`,
    },
    {
      points: 2,
      test: (city) => city.humidity >= 75,
      title: '건조 시간이 길어질 수 있습니다.',
      detail: (city) => `습도 ${city.humidity}%로 제습기나 선풍기를 함께 사용하는 편이 좋습니다.`,
    },
    {
      points: 1,
      test: (city) => ['비', '소나기'].includes(city.status),
      title: '현재 강수 상태입니다.',
      detail: (city) => `현재 날씨가 ${city.status}이므로 실외 건조는 피하세요.`,
    },
  ],
  travel: [
    {
      points: 2,
      test: (city) => city.precipitation >= 60,
      title: '실내 일정을 함께 준비하세요.',
      detail: (city) => `강수확률 ${city.precipitation}%로 야외 일정을 조정할 가능성이 있습니다.`,
    },
    {
      points: 1,
      test: (city) => city.wind >= 6,
      title: '바닷가·전망대 일정을 점검하세요.',
      detail: (city) => `풍속 ${city.wind}m/s로 개방된 관광지에서는 소지품 관리가 필요합니다.`,
    },
    {
      points: 1,
      test: (city) => city.feelsLike >= 31 || city.feelsLike <= 5,
      title: '온도에 맞는 일정을 짜세요.',
      detail: (city, fmt) =>
        `체감온도 ${fmt(city.feelsLike)}이므로 장시간 야외 일정 사이에 휴식을 넣으세요.`,
    },
    {
      points: 1,
      test: (city) => ['비', '소나기'].includes(city.status),
      title: '우천 대체 코스를 확인하세요.',
      detail: (city) =>
        `현재 ${city.status} 상태라 이동 시간과 실내 관광지를 함께 확인하는 편이 좋습니다.`,
    },
  ],
}

const cityData = computed(() => findWeatherCity(String(route.params.cityId)))

const activityId = computed({
  get: () => {
    const queryActivity = typeof route.query.activity === 'string' ? route.query.activity : ''
    return activities.some((activity) => activity.id === queryActivity) ? queryActivity : 'commute'
  },
  set: (value) => {
    router.replace({
      name: 'WeatherBriefing',
      params: { cityId: route.params.cityId },
      query: { activity: value },
    })
  },
})

watch(
  () => route.query.activity,
  () => {
    if (route.query.activity === activityId.value) return
    router.replace({
      name: 'WeatherBriefing',
      params: { cityId: route.params.cityId },
      query: { activity: activityId.value },
    })
  },
  { immediate: true },
)

const selectedActivity = computed(() =>
  activities.find((activity) => activity.id === activityId.value),
)

const evaluations = computed(() => {
  if (!cityData.value) return []
  return activityRules[activityId.value]
    .filter((rule) => rule.test(cityData.value))
    .map((rule) => ({ ...rule, detail: rule.detail(cityData.value, format) }))
})

const riskScore = computed(() => evaluations.value.reduce((sum, item) => sum + item.points, 0))

const riskLevel = computed(() => {
  if (riskScore.value >= 5) {
    return { key: 'danger', label: '일정 조정 필요', summary: '실내 대안을 우선으로 검토하세요.' }
  }
  if (riskScore.value >= 2) {
    return {
      key: 'caution',
      label: '주의 필요',
      summary: '준비물과 일정을 조금 조정하면 좋습니다.',
    }
  }
  return {
    key: 'safe',
    label: '활동하기 좋음',
    summary: '현재 관측값에서 큰 날씨 부담이 없습니다.',
  }
})

const preparationItems = computed(() => {
  if (!cityData.value) return []
  const city = cityData.value
  const items = []

  if (city.precipitation >= 40) items.push('우산')
  if (city.feelsLike >= 28) items.push('생수')
  if (city.feelsLike <= 15 || city.wind >= 5) items.push('가벼운 외투')
  if (activityId.value === 'exercise' && city.humidity >= 75) items.push('수건')
  if (activityId.value === 'laundry' && city.humidity >= 75) items.push('제습기·선풍기')
  if (!items.length) items.push('편안한 복장')

  return items
})

const changeCity = (event) => {
  router.push({
    name: 'WeatherBriefing',
    params: { cityId: event.target.value },
    query: { activity: activityId.value },
  })
}
</script>

<template>
  <section v-if="cityData" class="briefing-container">
    <header class="page-heading">
      <div>
        <p class="eyebrow">DAILY WEATHER BRIEFING</p>
        <h1>{{ cityData.name }} 생활 날씨 브리핑</h1>
      </div>
      <label>
        도시 변경
        <select :value="cityData.id" @change="changeCity">
          <option v-for="city in weatherCities" :key="city.id" :value="city.id">
            {{ city.name }}
          </option>
        </select>
      </label>
    </header>

    <nav class="activity-tabs" aria-label="활동 목적 선택">
      <button
        v-for="activity in activities"
        :key="activity.id"
        type="button"
        :class="{ active: activityId === activity.id }"
        :aria-pressed="activityId === activity.id"
        @click="activityId = activity.id"
      >
        <span aria-hidden="true">{{ activity.icon }}</span>
        {{ activity.label }}
      </button>
    </nav>

    <section :class="['risk-panel', riskLevel.key]" aria-live="polite">
      <div>
        <p>{{ selectedActivity.description }}</p>
        <h2>{{ riskLevel.label }}</h2>
        <p>{{ riskLevel.summary }}</p>
      </div>
      <strong class="score">위험 점수 {{ riskScore }}</strong>
    </section>

    <section class="guide-section">
      <h2>오늘의 행동 가이드</h2>
      <ul v-if="evaluations.length" class="guide-list">
        <li v-for="item in evaluations" :key="item.title">
          <strong>{{ item.title }}</strong>
          <p>{{ item.detail }}</p>
        </li>
      </ul>
      <div v-else class="clear-message">
        현재 날씨에서는 {{ selectedActivity.label }} 시 특별히 주의할 조건이 없습니다.
      </div>
    </section>

    <section class="weather-grid">
      <div>
        <span>현재 / 체감</span
        ><strong>{{ format(cityData.temp) }} / {{ format(cityData.feelsLike) }}</strong>
      </div>
      <div>
        <span>강수 확률</span><strong>{{ cityData.precipitation }}%</strong>
      </div>
      <div>
        <span>습도</span><strong>{{ cityData.humidity }}%</strong>
      </div>
      <div>
        <span>풍속</span><strong>{{ cityData.wind }}m/s</strong>
      </div>
    </section>

    <section class="preparation-section">
      <h2>추천 준비물</h2>
      <div class="preparation-list">
        <span v-for="item in preparationItems" :key="item">{{ item }}</span>
      </div>
    </section>

    <footer class="actions">
      <RouterLink :to="{ name: 'WeatherHome' }">← 날씨 대시보드</RouterLink>
      <RouterLink :to="{ name: 'WeatherDetail', params: { cityId: cityData.id } }">
        {{ cityData.name }} 상세 관측값
      </RouterLink>
    </footer>
    <small class="disclaimer">
      이 브리핑은 실습용 Mock Data로 생성한 생활 판단 보조 정보이며 공식 기상특보가 아닙니다.
    </small>
  </section>

  <section v-else class="invalid-city">
    <p class="eyebrow">UNKNOWN CITY</p>
    <h1>브리핑을 생성할 도시 데이터가 없습니다.</h1>
    <RouterLink :to="{ name: 'WeatherHome' }">날씨 대시보드로 이동</RouterLink>
  </section>
</template>

<style scoped>
.briefing-container,
.invalid-city {
  padding: 28px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.page-heading,
.risk-panel,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

h2,
p {
  margin: 0;
}

label {
  color: #636e72;
  font-size: 12px;
  font-weight: 700;
}

select {
  display: block;
  min-width: 130px;
  margin-top: 5px;
  padding: 8px 10px;
}

.activity-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 24px 0 16px;
}

.activity-tabs button {
  padding: 10px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.activity-tabs button.active {
  border-color: #6c5ce7;
  background: #f1efff;
  color: #5f4bc6;
  font-weight: 700;
}

.risk-panel {
  padding: 20px;
  border-left: 6px solid;
  border-radius: 8px;
}

.risk-panel h2 {
  margin: 6px 0;
}

.risk-panel.safe {
  border-color: #00b894;
  background: #eafaf6;
}

.risk-panel.caution {
  border-color: #f39c12;
  background: #fff8e8;
}

.risk-panel.danger {
  border-color: #d63031;
  background: #fff0f0;
}

.score {
  white-space: nowrap;
}

.guide-section,
.preparation-section {
  margin-top: 24px;
}

.guide-list {
  display: grid;
  gap: 10px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.guide-list li,
.clear-message {
  padding: 14px;
  border-radius: 8px;
  background: #f4f7fb;
}

.guide-list p {
  margin-top: 4px;
  color: #636e72;
}

.clear-message {
  margin-top: 12px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 24px;
}

.weather-grid div {
  padding: 14px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  text-align: center;
}

.weather-grid span,
.weather-grid strong {
  display: block;
}

.weather-grid span {
  margin-bottom: 6px;
  color: #636e72;
  font-size: 12px;
}

.preparation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.preparation-list span {
  padding: 6px 10px;
  border-radius: 16px;
  background: #2d3436;
  color: #fff;
}

.actions {
  justify-content: flex-start;
  margin-top: 28px;
}

.disclaimer {
  display: block;
  margin-top: 16px;
  color: #636e72;
}

.actions a,
.invalid-city a {
  padding: 9px 12px;
  border-radius: 6px;
  background: #6c5ce7;
  color: #fff;
  text-decoration: none;
}

.invalid-city h1 {
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .page-heading,
  .risk-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .activity-tabs,
  .weather-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
