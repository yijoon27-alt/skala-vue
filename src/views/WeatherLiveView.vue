<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { weatherCities } from '@/data/weather'
import {
  fetchAirPollution,
  fetchAllCities,
  fetchAllCitiesInSequence,
  fetchCurrent,
  fetchForecast,
  fetchUnknownEndpoint,
  fetchWithBrokenKey,
  hasApiKey,
} from '@/api/openWeather'
import { fetchCrossCheck } from '@/api/openMeteo'
import { clearRequestLog, requestLog } from '@/api/http'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const weatherStore = useWeatherStore()
const { format, formatDelta } = useTemperature()

/* ─────────── 병렬 조회 vs 순차 조회 ─────────── */
const benchmark = ref({ parallel: 0, sequence: 0, running: '' })

const runBenchmark = async (mode) => {
  benchmark.value.running = mode
  const startedAt = performance.now()
  try {
    await (mode === 'parallel'
      ? fetchAllCities(weatherCities)
      : fetchAllCitiesInSequence(weatherCities))
    benchmark.value[mode] = Math.round(performance.now() - startedAt)
  } catch {
    benchmark.value[mode] = 0
  } finally {
    benchmark.value.running = ''
  }
}

const speedUp = computed(() => {
  const { parallel, sequence } = benchmark.value
  return parallel && sequence ? (sequence / parallel).toFixed(1) : ''
})

/* ─────────── 도시 상세 — 4개 API 동시 호출 + 이전 요청 취소 ─────────── */
const selectedCity = ref(weatherCities[0])
const detail = ref(null)
const detailError = ref('')
const isDetailLoading = ref(false)
const canceledCount = ref(0)
let activeController = null

const selectCity = async (city) => {
  selectedCity.value = city

  // 이전 도시 응답이 늦게 도착해 화면을 덮어쓰는 것을 막는다
  activeController?.abort()
  const controller = new AbortController()
  activeController = controller
  const config = { signal: controller.signal }

  isDetailLoading.value = true
  detailError.value = ''

  try {
    detail.value = await axios
      .all([
        fetchCurrent(city, config),
        fetchForecast(city, config),
        fetchAirPollution(city, config),
        fetchCrossCheck(city, config),
      ])
      .then(axios.spread((current, forecast, air, cross) => ({ current, forecast, air, cross })))
  } catch (error) {
    // 취소는 실패가 아니다 — 화면 에러로 올리지 않고 횟수만 센다
    if (error.kind === 'canceled') {
      canceledCount.value += 1
      return
    }
    detail.value = null
    detailError.value = error.message ?? '데이터를 가져오지 못했습니다.'
  } finally {
    if (activeController === controller) isDetailLoading.value = false
  }
}

const tempGap = computed(() => {
  if (!detail.value) return 0
  return detail.value.cross.temp - detail.value.current.temp
})

// 막대는 0℃ 기준이 아니라 구간의 최저~최고 사이에서 그려야 차이가 눈에 보인다
const slotBarWidth = (temp) => {
  const temps = detail.value.forecast.slots.map((slot) => slot.temp)
  const min = Math.min(...temps)
  const span = Math.max(...temps) - min || 1
  return `${20 + ((temp - min) / span) * 80}%`
}

/* ─────────── 인터셉터의 에러 표준화 확인 ─────────── */
const failureDemo = ref('')

const runFailure = async (kind) => {
  failureDemo.value = ''
  try {
    await (kind === 'key' ? fetchWithBrokenKey(selectedCity.value) : fetchUnknownEndpoint())
    failureDemo.value = '예상과 달리 요청이 성공했습니다.'
  } catch (error) {
    failureDemo.value = `${error.kind} · HTTP ${error.status} → ${error.message}`
  }
}

onMounted(async () => {
  await weatherStore.ensureLoaded()
  if (hasApiKey) await selectCity(selectedCity.value)
})
</script>

<template>
  <section class="live-view">
    <header class="page-heading">
      <div>
        <p class="eyebrow">LIVE OBSERVATION</p>
        <h1>실시간 관측</h1>
      </div>
      <div class="sync-box">
        <span :class="['badge', weatherStore.isLive ? 'on' : 'off']">
          {{ weatherStore.sourceLabel }}
        </span>
        <button type="button" :disabled="weatherStore.isLoading" @click="weatherStore.syncAll()">
          {{ weatherStore.isLoading ? '갱신 중…' : '지금 갱신' }}
        </button>
      </div>
    </header>

    <p v-if="!hasApiKey" class="notice">
      API 키가 설정되지 않아 저장된 샘플 값으로 동작합니다.
      <code>.env.example</code> 을 <code>.env</code> 로 복사한 뒤 키를 채우면 실시간으로 바뀝니다.
    </p>
    <p v-else-if="weatherStore.errorMessage" class="notice">{{ weatherStore.errorMessage }}</p>

    <article class="panel">
      <h2>동시 조회 vs 순차 조회</h2>
      <p class="lead">
        도시 {{ weatherCities.length }}곳의 현재 날씨와 예보를 가져오려면 요청이
        {{ weatherCities.length * 2 }}건 필요합니다. 한꺼번에 보내는 방식과 하나씩 기다리는 방식의
        실제 소요 시간을 비교합니다.
      </p>
      <div class="button-row">
        <button
          type="button"
          :disabled="!!benchmark.running || !hasApiKey"
          @click="runBenchmark('parallel')"
        >
          동시에 보내기
        </button>
        <button
          type="button"
          :disabled="!!benchmark.running || !hasApiKey"
          @click="runBenchmark('sequence')"
        >
          하나씩 보내기
        </button>
      </div>
      <dl class="metric-grid">
        <div>
          <dt>동시 조회</dt>
          <dd>{{ benchmark.parallel ? `${benchmark.parallel}ms` : '—' }}</dd>
        </div>
        <div>
          <dt>순차 조회</dt>
          <dd>{{ benchmark.sequence ? `${benchmark.sequence}ms` : '—' }}</dd>
        </div>
        <div>
          <dt>속도 차이</dt>
          <dd>{{ speedUp ? `${speedUp}배` : '—' }}</dd>
        </div>
      </dl>
    </article>

    <article class="panel">
      <h2>도시별 상세 관측</h2>
      <p class="lead">
        도시를 고르면 현재 날씨 · 예보 · 대기질 · 교차 검증 4개 요청이 동시에 나갑니다. 빠르게 다른
        도시를 누르면 이전 요청은 취소됩니다.
      </p>
      <div class="button-row">
        <button
          v-for="city in weatherCities"
          :key="city.id"
          type="button"
          :class="['chip', { on: selectedCity.id === city.id }]"
          :disabled="!hasApiKey"
          @click="selectCity(city)"
        >
          {{ city.name }}
        </button>
        <span v-if="canceledCount" class="cancel-count">취소된 요청 {{ canceledCount }}건</span>
      </div>

      <p v-if="isDetailLoading" class="lead">불러오는 중…</p>
      <p v-else-if="detailError" class="error">{{ detailError }}</p>

      <template v-if="detail && !isDetailLoading">
        <div class="detail-grid">
          <div class="detail-card">
            <h3>현재 관측</h3>
            <p class="big">{{ format(detail.current.temp) }}</p>
            <p>{{ detail.current.status }} · 체감 {{ format(detail.current.feelsLike) }}</p>
            <p class="muted">
              습도 {{ detail.current.humidity }}% · 풍속 {{ detail.current.wind }}m/s ·
              {{ detail.current.observedAt }} 기준
            </p>
          </div>

          <div class="detail-card">
            <h3>대기질</h3>
            <p class="big">{{ detail.air.aqiLabel }}</p>
            <p>지수 {{ detail.air.aqi }} / 5</p>
            <p class="muted">
              미세먼지 {{ detail.air.pm10 }}㎍/㎥ · 초미세먼지 {{ detail.air.pm25 }}㎍/㎥
            </p>
          </div>

          <div class="detail-card">
            <h3>다른 기관 값과 대조</h3>
            <p class="big">{{ format(detail.cross.temp) }}</p>
            <p>
              차이 {{ tempGap > 0 ? '+' : '' }}{{ formatDelta(tempGap) }} ·
              {{ detail.cross.status }}
            </p>
            <p class="muted">
              풍속 {{ detail.cross.wind }}m/s · 습도 {{ detail.cross.humidity }}% ·
              {{ detail.cross.observedAt }} 기준
            </p>
          </div>
        </div>

        <h3 class="section-title">앞으로 24시간</h3>
        <ul class="forecast">
          <li v-for="slot in detail.forecast.slots" :key="slot.time">
            <span class="slot-time">{{ slot.time }}</span>
            <span class="bar" :style="{ width: slotBarWidth(slot.temp) }"></span>
            <span class="slot-temp">{{ format(slot.temp) }}</span>
            <span class="slot-pop" :class="{ wet: slot.pop >= 40 }">☔ {{ slot.pop }}%</span>
          </li>
        </ul>
      </template>
    </article>

    <article class="panel">
      <h2>통신 실패 처리</h2>
      <p class="lead">
        실패 원인은 화면에서 구분되어야 합니다. 아래 버튼은 일부러 잘못된 요청을 보내 상태 코드가
        어떤 안내 문구로 바뀌는지 확인합니다.
      </p>
      <div class="button-row">
        <button type="button" @click="runFailure('key')">잘못된 키로 호출</button>
        <button type="button" @click="runFailure('path')">없는 주소로 호출</button>
      </div>
      <p v-if="failureDemo" class="error">{{ failureDemo }}</p>
    </article>

    <article class="panel">
      <h2>통신 기록</h2>
      <p class="lead">모든 요청이 공통 계층을 지나며 자동으로 기록됩니다.</p>
      <table v-if="requestLog.length" class="log-table">
        <thead>
          <tr>
            <th>제공자</th>
            <th>요청 주소</th>
            <th>상태</th>
            <th>소요</th>
            <th>결과</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in requestLog" :key="entry.id" :class="{ failed: !entry.ok }">
            <td>{{ entry.provider }}</td>
            <td>{{ entry.url }}</td>
            <td>{{ entry.status || '-' }}</td>
            <td>{{ entry.elapsed }}ms</td>
            <td>{{ entry.message }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="lead">아직 기록이 없습니다.</p>
      <button v-if="requestLog.length" type="button" class="ghost" @click="clearRequestLog">
        기록 비우기
      </button>
    </article>

    <section class="feature-summary">
      <h2>✅ 기본 기능</h2>
      <p>실시간 날씨 조회 · 예보 조회 · 대기질 조회 · 통신 실패 처리</p>
      <h2>✨ 추가 기능</h2>
      <p>
        <strong>공통 통신 계층</strong>(키·단위·언어 자동 주입) ·
        <strong>상태 코드별 안내 문구 변환</strong> · <strong>동시 조회 성능 비교</strong> ·
        <strong>이전 요청 취소</strong> · <strong>다른 기관 데이터와 교차 검증</strong> ·
        <strong>통신 실패 시 샘플 데이터로 자동 전환</strong>
      </p>
    </section>
  </section>
</template>

<style scoped>
.live-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  color: #6c5ce7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

h1,
h2,
h3,
p {
  margin: 0;
}

.sync-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.badge.on {
  background: #e5f7ee;
  color: #1e8449;
}

.badge.off {
  background: #fdf0e3;
  color: #b7791f;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border: 1px solid #dfe6e9;
  border-radius: 12px;
  background: #fff;
}

.lead,
.muted {
  color: #636e72;
  font-size: 14px;
}

.notice {
  padding: 12px 14px;
  border-left: 4px solid #b7791f;
  background: #fdf6e7;
  color: #7d5a10;
  font-size: 14px;
}

.button-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  background: #2d3436;
  color: #fff;
  cursor: pointer;
}

button:disabled {
  background: #b2bec3;
  cursor: not-allowed;
}

.chip {
  background: #f1f2f6;
  color: #2d3436;
}

.chip.on {
  background: #6c5ce7;
  color: #fff;
  font-weight: 700;
}

.ghost {
  align-self: flex-start;
  background: #f1f2f6;
  color: #2d3436;
}

.cancel-count {
  color: #b7791f;
  font-size: 13px;
  font-weight: 700;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 0;
}

.metric-grid div,
.detail-card {
  padding: 14px;
  border-radius: 8px;
  background: #f4f7fb;
}

dt {
  color: #636e72;
  font-size: 13px;
}

dd {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 700;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-card h3 {
  color: #636e72;
  font-size: 13px;
}

.big {
  margin: 6px 0;
  font-size: 24px;
  font-weight: 700;
}

.section-title {
  font-size: 15px;
}

.forecast {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.forecast li {
  display: grid;
  grid-template-columns: 52px 1fr 64px 74px;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.bar {
  height: 10px;
  min-width: 4px;
  border-radius: 999px;
  background: #74b9ff;
}

.slot-temp {
  font-weight: 700;
  text-align: right;
}

.slot-pop {
  color: #636e72;
  text-align: right;
}

.slot-pop.wet {
  color: #0984e3;
  font-weight: 700;
}

.error {
  color: #c0392b;
  font-weight: 700;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.log-table th,
.log-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #eef1f4;
  text-align: left;
}

.log-table tr.failed td {
  color: #c0392b;
}

.feature-summary {
  padding: 15px;
  border-left: 4px solid #6c5ce7;
  background: #f4f2ff;
}

.feature-summary h2:not(:first-child) {
  margin-top: 14px;
}

@media (max-width: 720px) {
  .metric-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
