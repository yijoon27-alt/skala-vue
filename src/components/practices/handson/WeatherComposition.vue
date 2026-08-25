<script setup>
import { ref, reactive, computed, watch, watchEffect, toRaw } from 'vue'

/* ═════════════════════════════════════════════
 * Hands on — Weather Composition (교재 p.145)
 *
 * 요구사항 1~4 를 먼저 충족하고, 요구사항 5("본인만의 반응형 상태 변수,
 * Computed, Watcher를 추가한다")에 개인 응용을 몰아넣었다.
 * ═════════════════════════════════════════════ */

/* ── 요구사항 1 : 반응형 상태 정의 ── */
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', humidity: 55 },
  { id: 'city_02', name: '수원', temp: 24, status: '비', humidity: 88 },
  { id: 'city_03', name: '부산', temp: 26, status: '구름', humidity: 72 },
  { id: 'city_04', name: '제주', temp: 30, status: '흐림', humidity: 79 },
  { id: 'city_05', name: '강릉', temp: 22, status: '소나기', humidity: 91 },
  { id: 'city_06', name: '대구', temp: 34, status: '맑음', humidity: 41 },
  { id: 'city_07', name: '인천', temp: 23, status: '안개', humidity: 85 },
  { id: 'city_08', name: '춘천', temp: 19, status: '맑음', humidity: 60 },
])

/* ── 요구사항 2 : 검색어로 필터링한 computed 배열 ── */
const filteredWeatherList = computed(() => {
  filterRuns++
  const q = searchQuery.value.trim()
  if (!q) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(q))
})

/* ── 요구사항 3 : 반응형 변수 변화 감시 ── */
const statusBar = ref('도시를 선택하세요.')

// selectedCityInfo 감시 (watch) — 상태바 문구가 바뀔 때마다 콘솔 로그
watch(selectedCityInfo, (newCity, oldCity) => {
  statusBar.value = newCity
    ? `${newCity.name} · ${newCity.status} · ${formatTemp(newCity.temp)}`
    : '도시를 선택하세요.'
  console.log(`📍 [선택 변경] ${oldCity?.name ?? '없음'} ➡️ ${newCity?.name ?? '없음'}`)
})

// searchQuery 감시 (watchEffect) — 타이핑할 때마다 콘솔 로그
watchEffect(() => {
  console.log(`⌨️ [검색어 추적] "${searchQuery.value}" (${searchQuery.value.length}자)`)
})

const selectCity = (city) => {
  selectedCityInfo.value = city
}

/* ═════════════════════════════════════════════
 * 요구사항 5 — 개인 응용
 * ═════════════════════════════════════════════ */

/* ── ① 디바운스 검색 + onCleanup 으로 이전 요청 취소 ──
 * watchEffect 콜백의 첫 인자 onCleanup 은 "다음 실행 직전"에 호출된다.
 * 여기서 아직 날아가지 않은 요청을 취소하지 않으면, 늦게 도착한 옛날 응답이
 * 최신 결과를 덮어쓰는 사고가 난다. 실제 API 라면 clearTimeout 자리에
 * AbortController.abort() 가 들어간다. */
const searchPhase = ref('idle') // idle | pending | done
const searchResultText = ref('-')

/* ⚠️ 집계 값을 reactive 로 두고 watchEffect 안에서 started++ 하면 무한 루프가 된다.
 *    ++ 는 "읽고 나서 쓰는" 연산이라 그 값이 감시 목록에 등록되기 때문이다.
 *    그래서 실제 카운터는 일반 객체로 두고, 화면용 ref 에는 복사본만 넣는다.
 *    (ref 에 대입만 하고 읽지는 않으므로 의존성이 생기지 않는다.) */
const rawStats = { started: 0, cancelled: 0, completed: 0 }
const requestStats = ref({ ...rawStats })
const publishStats = () => {
  requestStats.value = { ...rawStats }
}

watchEffect((onCleanup) => {
  const query = searchQuery.value.trim()
  if (!query) {
    searchPhase.value = 'idle'
    searchResultText.value = '-'
    return
  }

  rawStats.started++
  publishStats()
  searchPhase.value = 'pending'

  const timer = setTimeout(() => {
    rawStats.completed++
    publishStats()
    searchPhase.value = 'done'
    searchResultText.value = `"${query}" 조회 완료 · ${filteredWeatherList.value.length}개 지역`
  }, 400)

  onCleanup(() => {
    clearTimeout(timer)
    rawStats.cancelled++
    publishStats()
  })
})

/* ── ② 쓰기 가능한 computed (getter / setter) — 온도 단위 전환 ──
 * computed 는 기본이 읽기 전용이지만 { get, set } 을 넘기면 v-model 을 걸 수 있다.
 * 내부 상태는 boolean 하나로 두고, 화면에는 '섭씨'/'화씨' 라는 말로 오간다. */
const isFahrenheit = ref(false)
const unitLabel = computed({
  get: () => (isFahrenheit.value ? '화씨' : '섭씨'),
  set: (label) => {
    isFahrenheit.value = label === '화씨'
  },
})
function formatTemp(celsius) {
  return isFahrenheit.value ? `${Math.round((celsius * 9) / 5 + 32)}°F` : `${celsius}°C`
}

/* ── ③ Multi-Source watch 로 중복 조회 차단 ──
 * 감시자를 따로 두면 두 값이 같은 순간에 바뀔 때 콜백이 두 번 돌아 API 도 두 번 나간다.
 * 배열로 묶으면 Vue 가 같은 tick 의 변경을 모아 한 번만 실행한다. */
const sortKey = ref('temp-desc')
const statusFilter = ref('전체')
const fetchCount = reactive({ separate: 0, combined: 0 })

watch(sortKey, () => fetchCount.separate++)
watch(statusFilter, () => fetchCount.separate++)
watch([sortKey, statusFilter], () => fetchCount.combined++)

const changeBothAtOnce = () => {
  // 한 번의 클릭 = 같은 tick 안에서 두 조건을 동시에 바꾼다
  sortKey.value = sortKey.value === 'temp-desc' ? 'temp-asc' : 'temp-desc'
  statusFilter.value = statusFilter.value === '전체' ? '맑음' : '전체'
}
const resetFetchCount = () => {
  fetchCount.separate = 0
  fetchCount.combined = 0
}

/* ── ④ 즐겨찾기 deep watch + 스냅샷으로 변경 이력 남기기 ──
 * deep 감시에서는 newVal 과 oldVal 이 같은 객체라 "무엇이 무엇으로" 를 알 수 없다.
 * 직접 뜬 스냅샷과 대조하면 과거를 살릴 수 있다.
 * ⚠️ structuredClone 은 Proxy 를 복사하지 못하므로 toRaw() 로 원본을 꺼내야 한다. */
const favorites = ref({})
const favoriteLog = ref([])
let favoriteSnapshot = structuredClone(toRaw(favorites.value))

watch(
  favorites,
  (newVal) => {
    const names = new Set([...Object.keys(newVal), ...Object.keys(favoriteSnapshot)])
    names.forEach((name) => {
      if (Boolean(newVal[name]) !== Boolean(favoriteSnapshot[name])) {
        favoriteLog.value.unshift({
          id: `${name}-${Date.now()}-${Math.random()}`,
          text: `${name} 즐겨찾기 ${newVal[name] ? '추가' : '해제'}`,
        })
      }
    })
    favoriteSnapshot = structuredClone(toRaw(newVal))
  },
  { deep: true },
)

const toggleFavorite = (city) => {
  favorites.value[city.name] = !favorites.value[city.name]
}
const favoriteCount = computed(() => Object.values(favorites.value).filter(Boolean).length)

/* ── ⑤ computed 3단 체인 + 재연산 계기판 ──
 * 검색 → 상태 필터 → 정렬 → 통계 순으로 단계를 나누면, 앞 단계의 결과가 그대로일 때
 * 뒷 단계는 다시 계산되지 않는다. 그 캐싱을 화면에서 확인할 수 있게 실행 횟수를 센다.
 * 카운터는 반드시 일반 변수여야 한다 — computed 안에서 ref 를 바꾸면 무한 루프가 된다. */
let filterRuns = 0
let conditionRuns = 0
let sortRuns = 0
let statRuns = 0

const STATUS_OPTIONS = ['전체', '맑음', '비', '구름', '흐림', '소나기', '안개']

const conditionFilteredList = computed(() => {
  conditionRuns++
  if (statusFilter.value === '전체') return filteredWeatherList.value
  return filteredWeatherList.value.filter((city) => city.status === statusFilter.value)
})

const sortedList = computed(() => {
  sortRuns++
  const list = conditionFilteredList.value
  switch (sortKey.value) {
    case 'temp-asc':
      return list.toSorted((a, b) => a.temp - b.temp)
    case 'name':
      return list.toSorted((a, b) => a.name.localeCompare(b.name))
    case 'humidity-desc':
      return list.toSorted((a, b) => b.humidity - a.humidity)
    default:
      return list.toSorted((a, b) => b.temp - a.temp)
  }
})

const stats = computed(() => {
  statRuns++
  const list = sortedList.value
  if (list.length === 0) return null
  const temps = list.map((c) => c.temp)
  return {
    count: list.length,
    avg: Math.round(temps.reduce((sum, t) => sum + t, 0) / temps.length),
    max: Math.max(...temps),
    min: Math.min(...temps),
  }
})

let renderRuns = 0
const trackRender = () => ++renderRuns
const readRuns = () => ({
  render: renderRuns,
  filter: filterRuns,
  condition: conditionRuns,
  sort: sortRuns,
  stat: statRuns,
})

/* ── 온도 구간별 배지 ── */
const tempBadge = (temp) => {
  if (temp >= 33) return { label: '폭염', cls: 'hot' }
  if (temp >= 28) return { label: '더움', cls: 'warm' }
  if (temp >= 23) return { label: '적당', cls: 'mild' }
  return { label: '선선', cls: 'cool' }
}
</script>

<template>
  <div class="weather-app">
    <header class="app-header">
      <h2>실시간 지역 날씨</h2>
      <div class="header-controls">
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="도시 이름을 검색하세요"
        />
        <select v-model="unitLabel" class="unit-select">
          <option value="섭씨">섭씨 °C</option>
          <option value="화씨">화씨 °F</option>
        </select>
      </div>
      <p class="status-bar">{{ statusBar }}</p>
    </header>

    <!-- 검색 상태 (디바운스) -->
    <section class="search-status" :class="searchPhase">
      <span v-if="searchPhase === 'idle'">검색어를 입력하면 지역 정보를 조회합니다.</span>
      <span v-else-if="searchPhase === 'pending'">조회 중…</span>
      <span v-else>{{ searchResultText }}</span>
      <span class="req-stats">
        요청 {{ requestStats.started }} · 취소 {{ requestStats.cancelled }} · 완료
        {{ requestStats.completed }}
      </span>
    </section>

    <!-- 조회 조건 -->
    <section class="filter-bar">
      <label>
        정렬
        <select v-model="sortKey">
          <option value="temp-desc">기온 높은 순</option>
          <option value="temp-asc">기온 낮은 순</option>
          <option value="humidity-desc">습도 높은 순</option>
          <option value="name">이름 순</option>
        </select>
      </label>
      <label>
        날씨
        <select v-model="statusFilter">
          <option v-for="option in STATUS_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <button class="btn-ghost" @click="changeBothAtOnce">정렬 + 날씨 동시 변경</button>
      <span class="counter-chip">
        조회 요청 — 개별 감시 <strong>{{ fetchCount.separate }}</strong> · 묶음 감시
        <strong>{{ fetchCount.combined }}</strong>
      </span>
      <button class="btn-ghost small" @click="resetFetchCount">초기화</button>
    </section>

    <!-- 통계 -->
    <section v-if="stats" class="stat-row">
      <div class="stat">
        <span class="stat-label">지역</span><span class="stat-num">{{ stats.count }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">평균</span
        ><span class="stat-num">{{ formatTemp(stats.avg) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">최고</span
        ><span class="stat-num">{{ formatTemp(stats.max) }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">최저</span
        ><span class="stat-num">{{ formatTemp(stats.min) }}</span>
      </div>
      <div class="stat fav">
        <span class="stat-label">즐겨찾기</span><span class="stat-num">{{ favoriteCount }}</span>
      </div>
    </section>

    <!-- 요구사항 4 : 검색 결과 3분기 -->
    <section class="result-area">
      <p v-if="!searchQuery.trim()" class="result-hint">전체 지역을 표시하고 있습니다.</p>
      <p v-else-if="sortedList.length > 0" class="result-hint">
        "{{ searchQuery }}" 검색 결과 {{ sortedList.length }}개 지역
      </p>
      <p v-else class="result-empty">"{{ searchQuery }}" 와 일치하는 도시가 없습니다.</p>

      <div v-if="sortedList.length > 0" class="card-grid">
        <article
          v-for="city in sortedList"
          :key="city.id"
          class="city-card"
          :class="{ selected: selectedCityInfo?.id === city.id }"
          @click="selectCity(city)"
        >
          <div class="card-top">
            <h3>{{ city.name }}</h3>
            <button
              class="fav-btn"
              :class="{ on: favorites[city.name] }"
              @click.stop="toggleFavorite(city)"
            >
              {{ favorites[city.name] ? '★' : '☆' }}
            </button>
          </div>
          <p class="temp">{{ formatTemp(city.temp) }}</p>
          <p class="meta">{{ city.status }} · 습도 {{ city.humidity }}%</p>
          <span class="badge" :class="tempBadge(city.temp).cls">
            {{ tempBadge(city.temp).label }}
          </span>
        </article>
      </div>
    </section>

    <!-- 즐겨찾기 변경 이력 -->
    <section class="history">
      <h3>즐겨찾기 변경 이력</h3>
      <p v-if="favoriteLog.length === 0" class="empty">아직 변경 이력이 없습니다.</p>
      <p v-for="entry in favoriteLog" :key="entry.id" class="history-item">{{ entry.text }}</p>
    </section>

    <!-- 계산 캐싱 계기판 -->
    <section class="gauge-row" :data-render="trackRender()">
      <div class="gauge">
        <span class="gauge-label">화면 렌더</span
        ><span class="gauge-num">{{ readRuns().render }}</span>
      </div>
      <div class="gauge">
        <span class="gauge-label">검색 필터</span
        ><span class="gauge-num">{{ readRuns().filter }}</span>
      </div>
      <div class="gauge">
        <span class="gauge-label">날씨 필터</span
        ><span class="gauge-num">{{ readRuns().condition }}</span>
      </div>
      <div class="gauge">
        <span class="gauge-label">정렬</span><span class="gauge-num">{{ readRuns().sort }}</span>
      </div>
      <div class="gauge">
        <span class="gauge-label">통계</span><span class="gauge-num">{{ readRuns().stat }}</span>
      </div>
    </section>

    <!-- 기능 목록 -->
    <footer class="feature-list">
      <div class="feature-col">
        <h4>✅ 기본 기능</h4>
        <ul>
          <li><strong>반응형 상태 관리</strong> — 검색어 · 선택 도시 · 지역 날씨 배열</li>
          <li><strong>검색 도시 필터</strong> — 도시 이름을 포함하는 항목만 계산된 배열로 유지</li>
          <li><strong>선택 도시 감시</strong> — 상태바 문구가 바뀔 때마다 콘솔 기록</li>
          <li><strong>검색어 자동 추적</strong> — 타이핑할 때마다 콘솔 기록</li>
          <li><strong>검색 결과 3분기</strong> — 전체 표시 · 일치 결과 · 결과 없음 안내</li>
        </ul>
      </div>
      <div class="feature-col">
        <h4>✨ 추가 기능</h4>
        <ul>
          <li>
            <strong>디바운스 조회</strong> — 400ms 지연 + 이전 요청 자동 취소 (요청/취소/완료 집계)
          </li>
          <li><strong>온도 단위 전환</strong> — 섭씨 ↔ 화씨를 계산된 속성 하나로 양방향 처리</li>
          <li><strong>조건 묶음 감시</strong> — 정렬·날씨를 동시에 바꿔도 조회는 한 번만</li>
          <li>
            <strong>즐겨찾기 변경 이력</strong> — 스냅샷 대조로 "무엇이 어떻게" 바뀌었는지 기록
          </li>
          <li><strong>3단 계산 체인</strong> — 검색 → 필터 → 정렬 → 통계 + 재계산 횟수 계기판</li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.weather-app {
  max-width: 1000px;
  margin: 0 auto;
  font-family: inherit;
}
.app-header {
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #42b883, #35495e);
  color: #fff;
}
.app-header h2 {
  margin: 0 0 12px;
  color: #fff;
}
.header-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.search-input {
  flex: 1 1 240px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
}
.unit-select {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}
.status-bar {
  margin: 12px 0 0;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgb(255 255 255 / 18%);
  font-size: 14px;
}
.search-status {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #f4f6f7;
  border-left: 4px solid #bdc3c7;
  font-size: 13px;
}
.search-status.pending {
  border-left-color: #e67e22;
  background-color: #fdf3e3;
}
.search-status.done {
  border-left-color: #42b883;
  background-color: #eafaf1;
}
.req-stats {
  font-family: monospace;
  color: #566573;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 8px;
  background-color: #f8f9f9;
  font-size: 14px;
}
.filter-bar select {
  margin-left: 6px;
  padding: 6px 10px;
  border: 1px solid #d5d8dc;
  border-radius: 6px;
}
.counter-chip {
  margin-left: auto;
  padding: 5px 12px;
  border-radius: 14px;
  background-color: #eaf2f8;
  border: 1px solid #aed6f1;
  font-size: 13px;
}
.btn-ghost {
  padding: 6px 14px;
  border: 1px solid #42b883;
  border-radius: 6px;
  background-color: #fff;
  color: #2d8659;
  font-size: 13px;
  cursor: pointer;
}
.btn-ghost.small {
  padding: 5px 10px;
  border-color: #bdc3c7;
  color: #7f8c8d;
  font-size: 12px;
}
.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.stat {
  flex: 1 1 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f4f6f7;
}
.stat.fav {
  background-color: #fef5e7;
}
.stat-label {
  font-size: 12px;
  color: #666;
}
.stat-num {
  font-size: 22px;
  font-weight: bold;
  font-family: monospace;
}
.result-area {
  margin-top: 18px;
}
.result-hint {
  margin: 0 0 10px;
  font-size: 14px;
  color: #566573;
}
.result-empty {
  margin: 0;
  padding: 30px;
  border: 2px dashed #d5d8dc;
  border-radius: 10px;
  text-align: center;
  color: #7f8c8d;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}
.city-card {
  position: relative;
  padding: 16px;
  border: 2px solid #e5e8e8;
  border-radius: 10px;
  background-color: #fff;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}
.city-card:hover {
  transform: translateY(-3px);
  border-color: #42b883;
}
.city-card.selected {
  border-color: #42b883;
  background-color: #eafaf1;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-top h3 {
  margin: 0;
  font-size: 17px;
}
.fav-btn {
  padding: 2px 6px;
  border: none;
  background: none;
  color: #bdc3c7;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}
.fav-btn.on {
  color: #f39c12;
}
.temp {
  margin: 10px 0 4px;
  font-size: 28px;
  font-weight: bold;
  font-family: monospace;
}
.meta {
  margin: 0 0 10px;
  font-size: 13px;
  color: #7f8c8d;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.badge.hot {
  background-color: #c0392b;
}
.badge.warm {
  background-color: #e67e22;
}
.badge.mild {
  background-color: #42b883;
}
.badge.cool {
  background-color: #2980b9;
}
.history {
  margin-top: 20px;
  padding: 14px;
  border-radius: 8px;
  background-color: #fbfcfc;
  border: 1px solid #e5e8e8;
}
.history h3 {
  margin: 0 0 8px;
  font-size: 15px;
}
.history-item {
  margin: 4px 0;
  padding: 4px 10px;
  border-left: 3px solid #f39c12;
  font-size: 13px;
}
.empty {
  margin: 4px 0;
  color: #95a5a6;
  font-size: 13px;
}
.gauge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}
.gauge {
  flex: 1 1 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background-color: #f4f6f7;
  border: 1px solid #e5e8e8;
}
.gauge-label {
  font-size: 11px;
  color: #7f8c8d;
}
.gauge-num {
  font-size: 20px;
  font-weight: bold;
  font-family: monospace;
}
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 2px dashed #d5d8dc;
}
.feature-col {
  flex: 1 1 300px;
}
.feature-col h4 {
  margin: 0 0 8px;
  font-size: 14px;
}
.feature-col ul {
  margin: 0;
  padding-left: 18px;
}
.feature-col li {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.7;
  color: #566573;
}
</style>
