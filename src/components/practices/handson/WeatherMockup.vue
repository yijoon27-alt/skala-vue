<script setup>
import { ref, computed, nextTick, useTemplateRef } from 'vue'

/* ═════════════════════════════════════════════
 * Hands on — Weather Mockup (교재 p.116)
 *
 * 교재 요구사항 5가지를 모두 충족하고, 각 요구사항이 멈춘 지점에서
 * 개인 응용 ⑩~⑭ 를 이어 붙였다.
 * ═════════════════════════════════════════════ */

/* ── 요구사항 1·5 : 날씨 데이터 배열 ──
 * 교재 원본 3개(서울·수원·부산)는 그대로 두고, 요구사항 5번에 따라
 * 5개 도시와 humidity / pm10 / feelsLike / hourly 필드를 직접 추가했다.
 * hourly 는 배열 안의 배열이라 중첩 v-for 로 렌더한다. */
const HOURS = ['06시', '09시', '12시', '15시', '18시', '21시', '24시', '03시']

const weatherList = ref([
  // 교재 원본 데이터
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    humidity: 55,
    pm10: 42,
    feelsLike: 31,
    hourly: [22, 25, 28, 30, 29, 26, 24, 23],
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    humidity: 88,
    pm10: 21,
    feelsLike: 26,
    hourly: [20, 22, 24, 25, 24, 22, 21, 20],
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    humidity: 72,
    pm10: 35,
    feelsLike: 29,
    hourly: [23, 24, 26, 27, 27, 25, 24, 23],
  },
  // 🔧 개인 응용 — 직접 추가한 도시
  {
    id: 'city_04',
    name: '제주',
    temp: 30,
    status: '흐림',
    humidity: 79,
    pm10: 18,
    feelsLike: 34,
    hourly: [26, 28, 30, 31, 30, 29, 28, 27],
  },
  {
    id: 'city_05',
    name: '강릉',
    temp: 22,
    status: '소나기',
    humidity: 91,
    pm10: 15,
    feelsLike: 24,
    hourly: [19, 20, 22, 23, 22, 21, 20, 19],
  },
  {
    id: 'city_06',
    name: '대구',
    temp: 34,
    status: '맑음',
    humidity: 41,
    pm10: 96,
    feelsLike: 38,
    hourly: [27, 30, 34, 36, 35, 32, 30, 28],
  },
  {
    id: 'city_07',
    name: '인천',
    temp: 23,
    status: '안개',
    humidity: 85,
    pm10: 158,
    feelsLike: 25,
    hourly: [20, 21, 23, 24, 23, 22, 21, 20],
  },
  {
    id: 'city_08',
    name: '춘천',
    temp: 19,
    status: '맑음',
    humidity: 60,
    pm10: 28,
    feelsLike: 19,
    hourly: [14, 16, 19, 21, 20, 17, 15, 14],
  },
])

/* ── 요구사항 4 : 상세보기 (교재 원본 그대로) ── */
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

/* ═════════════════════════════════════════════
 * 🔧 개인 응용 ⑩ — 한글 초성 검색
 *
 * 교재 요구사항 3은 "입력한 도시명을 출력한다" 까지만 요구한다.
 * 실제 검색으로 만들고, 나아가 초성 검색(ㅅㅇ → 서울)까지 구현한다.
 *
 * 완성형 한글은 0xAC00 부터 (초성 19 × 중성 21 × 종성 28) 순서로 배열돼 있다.
 *   초성 index = (code - 0xAC00) / 588      (588 = 21 × 28)
 *   종성 index = (code - 0xAC00) % 28       (0 이면 받침 없음)
 * 이 두 줄로 초성 추출과 조사 판별이 모두 해결된다.
 *
 * ⚠️ 초성 검색은 v-model 로는 원리상 불가능하다.
 *    "ㅅ" 은 아직 조합이 끝나지 않은 글자라 v-model 의 조합 가드가 삼켜 버린다.
 *    요구사항 3이 굳이 :value + @input 을 지정한 이유가 이것이다.
 *    (p.106 개인 응용 ⑥ 에서 확인한 `if (e.target.composing) return`)
 * ═════════════════════════════════════════════ */
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
const CHO_STRIDE = 588 // 중성 21 × 종성 28

const isCompleteHangul = (code) => code >= HANGUL_FIRST && code <= HANGUL_LAST

/** 한 글자의 초성 — "서" → "ㅅ" (완성형 한글이 아니면 null) */
function chosungOf(ch) {
  const code = ch.charCodeAt(0)
  if (!isCompleteHangul(code)) return null
  return CHOSUNG[Math.floor((code - HANGUL_FIRST) / CHO_STRIDE)]
}

/** 문자열을 초성으로 변환 — "서울" → "ㅅㅇ" (화면 표시용) */
const toChosung = (text) => [...text].map((ch) => chosungOf(ch) ?? ch).join('')

/** 조합이 끝나지 않은 낱자음 여부 — "ㅅ" true, "서" false */
const isJamo = (ch) => /[ㄱ-ㅎ]/.test(ch)

/**
 * 한글 검색 매칭 — 글자 단위로 미끄러뜨리며 비교한다.
 * 질의 글자가 낱자음이면 이름 글자의 "초성"과 비교하고, 완성된 글자면 글자끼리 비교한다.
 *   "ㅅㅇ" vs 서울 → ㅅ=초성(서), ㅇ=초성(울)  ✅
 *   "서"   vs 수원 → 서 ≠ 수, 낱자음도 아님    ❌  ← 초성으로만 비교하면 여기서 오탐이 난다
 *   "강ㄹ" vs 강릉 → 강=강, ㄹ=초성(릉)        ✅  (한글 조합 중에 실제로 나오는 형태)
 */
function hangulMatch(name, query) {
  if (!query) return true
  if (name.includes(query)) return true
  for (let start = 0; start + query.length <= name.length; start++) {
    let matched = true
    for (let i = 0; i < query.length; i++) {
      const q = query[i]
      const n = name[start + i]
      if (q === n) continue
      if (isJamo(q) && chosungOf(n) === q) continue
      matched = false
      break
    }
    if (matched) return true
  }
  return false
}

/** 받침 유무로 조사를 고른다 — 서울"이" / 제주"가" */
function withParticle(word, withBatchim, withoutBatchim) {
  const code = word.at(-1)?.charCodeAt(0) ?? 0
  if (!isCompleteHangul(code)) return `${word}${withBatchim}`
  const hasBatchim = (code - HANGUL_FIRST) % 28 !== 0
  return `${word}${hasBatchim ? withBatchim : withoutBatchim}`
}

const keyword = ref('')
const isChosungQuery = computed(() => /^[ㄱ-ㅎ]+$/.test(keyword.value.trim()))

// 요구사항 3 — v-model 이 아니라 :value + @input 으로 직접 처리한다
function onSearchInput(e) {
  keyword.value = e.target.value
  activeIndex.value = -1 // 검색어가 바뀌면 키보드 선택도 초기화
}

const filteredList = computed(() => {
  const query = keyword.value.trim()
  if (!query) return weatherList.value
  return weatherList.value.filter((city) => hangulMatch(city.name, query))
})

/* ═════════════════════════════════════════════
 * 🔧 개인 응용 ⑪ — 키보드 네비게이션 (.up / .down / .enter / .esc)
 *
 * 교재 p.103~104 에는 키보드·시스템·마우스 수식어가 표로 정리돼 있는데
 * 예제 코드가 하나도 없다. (p.102 예제는 .prevent / .stop 뿐)
 * 게다가 p.103 표는 .up / .down 의 활용 예시를
 * "자동완성 검색어 목록에서 화살표로 리스트 이동할 때" 라고 적어 두었다 —
 * 지금 만들고 있는 도시 검색이 정확히 그 상황이라 그대로 구현했다.
 * ═════════════════════════════════════════════ */
const activeIndex = ref(-1)

function moveActive(delta) {
  const count = filteredList.value.length
  if (count === 0) return
  activeIndex.value = (activeIndex.value + delta + count) % count
}

function selectActive() {
  const city = filteredList.value[activeIndex.value] ?? filteredList.value[0]
  if (city) selectCity(city)
}

function resetSearch() {
  keyword.value = ''
  activeIndex.value = -1
  statusMessage.value = '검색을 초기화했습니다. (Esc)'
}

/* ═════════════════════════════════════════════
 * 🔧 개인 응용 ⑫ — 온도 구간을 데이터로 분리
 *
 * 교재 요구사항 2는 25도 기준 2단계이고 "조건은 다르게 해도 된다"고 허용한다.
 * 그런데 v-else-if 다단계 자체는 이미 VIfSample(p.79)에서 다뤘으므로,
 * 단계를 늘리는 것만으로는 응용이 되지 않는다.
 * 조건문 체인을 걷어내고 **구간 테이블 + find()** 로 바꿔 데이터 주도로 만든다.
 * 기준값은 기상청 폭염·한파 특보 기준을 따랐다.
 * ═════════════════════════════════════════════ */
const TEMP_BANDS = [
  { min: 35, emoji: '🥵', label: '폭염경보', color: '#c0392b', note: '기상청 폭염경보 기준' },
  { min: 33, emoji: '🔥', label: '폭염주의보', color: '#e74c3c', note: '기상청 폭염주의보 기준' },
  { min: 28, emoji: '☀️', label: '더움', color: '#e67e22', note: '' },
  { min: 25, emoji: '🌤️', label: '조금 더움', color: '#f39c12', note: '' },
  { min: 15, emoji: '🍃', label: '선선함', color: '#27ae60', note: '' },
  { min: 5, emoji: '🧥', label: '쌀쌀함', color: '#2980b9', note: '' },
  { min: -12, emoji: '❄️', label: '추움', color: '#8e44ad', note: '' },
  {
    min: -Infinity,
    emoji: '🥶',
    label: '한파경보',
    color: '#2c3e50',
    note: '기상청 한파경보 기준',
  },
]
const bandOf = (temp) => TEMP_BANDS.find((band) => temp >= band.min)

const PM_GRADES = [
  { max: 30, label: '좋음', color: '#2980b9' },
  { max: 80, label: '보통', color: '#27ae60' },
  { max: 150, label: '나쁨', color: '#e67e22' },
  { max: Infinity, label: '매우나쁨', color: '#c0392b' },
]
const pmGradeOf = (pm10) => PM_GRADES.find((grade) => pm10 <= grade.max)

/* ═════════════════════════════════════════════
 * 🔧 개인 응용 ⑬ — 정렬 · 집계 · 시간대별 예보
 * ═════════════════════════════════════════════ */
const SORT_OPTIONS = [
  { key: 'default', label: '기본순' },
  { key: 'tempDesc', label: '기온 높은순' },
  { key: 'tempAsc', label: '기온 낮은순' },
  { key: 'pmAsc', label: '미세먼지 좋은순' },
  { key: 'name', label: '가나다순' },
]
const sortKey = ref('default')

const visibleList = computed(() => {
  const list = filteredList.value
  switch (sortKey.value) {
    case 'tempDesc':
      return list.toSorted((a, b) => b.temp - a.temp)
    case 'tempAsc':
      return list.toSorted((a, b) => a.temp - b.temp)
    case 'pmAsc':
      return list.toSorted((a, b) => a.pm10 - b.pm10)
    case 'name':
      return list.toSorted((a, b) => a.name.localeCompare(b.name, 'ko'))
    default:
      return list
  }
})

const stats = computed(() => {
  const list = visibleList.value
  if (list.length === 0) return null
  const total = list.reduce((sum, city) => sum + city.temp, 0)
  return {
    count: list.length,
    avg: (total / list.length).toFixed(1),
    hottest: list.reduce((a, b) => (b.temp > a.temp ? b : a)),
    coldest: list.reduce((a, b) => (b.temp < a.temp ? b : a)),
  }
})

// 시간대별 막대 그래프 높이 (전체 데이터의 최저~최고를 0~100%로 정규화)
const HOURLY_MIN = 10
const HOURLY_MAX = 40
const barHeight = (temp) =>
  `${Math.round(((temp - HOURLY_MIN) / (HOURLY_MAX - HOURLY_MIN)) * 100)}%`

/* ═════════════════════════════════════════════
 * 요구사항 4 — 카드 선택 상태바
 * 🔧 개인 응용 : 교재 문구는 "{도시}이 선택되었습니다." 로 조사가 "이" 고정이다.
 *    받침이 없는 "제주"는 "제주이"가 되어 어색하므로 위 withParticle() 로 처리한다.
 * ═════════════════════════════════════════════ */
const selectedId = ref('')
const statusMessage = ref('도시 카드를 클릭하거나, 검색창에서 ↑ ↓ 로 이동해 보세요.')

function selectCity(city) {
  selectedId.value = city.id
  statusMessage.value = `${withParticle(city.name, '이', '가')} 선택되었습니다.`
  activeIndex.value = visibleList.value.findIndex((item) => item.id === city.id)
}

/* ═════════════════════════════════════════════
 * 🔧 개인 응용 ⑭ — window.alert 대신 커스텀 모달
 *
 * 요구사항 4는 window.alert 을 지정하므로 교재 버튼은 그대로 남겨 두고,
 * 옆에 모달 버전을 나란히 두어 비교한다.
 *   · 배경(Dim) 클릭으로 닫기 → @click.self   (p.101 표의 활용 예시 그대로)
 *   · Esc 로 닫기            → @keydown.esc  (p.103 표, 교재에 예제 없음)
 * ═════════════════════════════════════════════ */
const modalCity = ref(null)
const modalRef = useTemplateRef('modalRef')

function openModal(city) {
  modalCity.value = city
  nextTick(() => modalRef.value?.focus()) // Esc 를 받으려면 포커스가 필요하다
}
const closeModal = () => (modalCity.value = null)
</script>

<template>
  <div class="weather-app">
    <header class="app-header">
      <h2>🌤️ 지역별 날씨 현황</h2>
      <p class="subtitle">Vue 3 · 지역별 날씨 대시보드</p>
    </header>

    <!-- ───────── 요구사항 3 : 한글 검색 (:value + @input) ─────────
         🔧 개인 응용 ⑩ 초성 검색 · ⑪ 키보드 네비게이션이 여기에 통합돼 있다 -->
    <section class="search-bar">
      <input
        type="text"
        class="search-input"
        :value="keyword"
        placeholder="도시 검색 — 초성도 됩니다 (예: ㅅㅇ, ㅂㅅ)"
        @input="onSearchInput"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter="selectActive"
        @keydown.esc="resetSearch"
      />
      <span v-if="isChosungQuery" class="chosung-badge">초성 검색 모드</span>
      <button v-if="keyword" class="btn-ghost" @click="resetSearch">지우기</button>
    </section>

    <p class="search-echo">
      <!-- 요구사항 3 — 입력한 도시명 출력 -->
      입력한 검색어: <strong>{{ keyword || '(없음)' }}</strong>
      <span v-if="keyword" class="echo-sub">
        → 초성 <code>{{ toChosung(keyword) }}</code> · {{ visibleList.length }}개 일치
      </span>
      <span class="kbd-help">↑ ↓ 이동 · Enter 선택 · Esc 초기화</span>
    </p>

    <!-- ───────── 요구사항 4 : 상태바 ───────── -->
    <p class="status-bar">{{ statusMessage }}</p>

    <!-- ───────── 🔧 개인 응용 ⑬ : 집계 대시보드 + 정렬 ───────── -->
    <section v-if="stats" class="dashboard">
      <div class="stat">
        <span class="stat-label">표시 중</span>
        <strong>{{ stats.count }}개 도시</strong>
      </div>
      <div class="stat">
        <span class="stat-label">평균 기온</span>
        <strong>{{ stats.avg }}°</strong>
      </div>
      <div class="stat">
        <span class="stat-label">가장 더움</span>
        <strong>{{ stats.hottest.name }} {{ stats.hottest.temp }}°</strong>
      </div>
      <div class="stat">
        <span class="stat-label">가장 선선</span>
        <strong>{{ stats.coldest.name }} {{ stats.coldest.temp }}°</strong>
      </div>
      <label class="sort-box">
        정렬
        <select v-model="sortKey">
          <option v-for="opt in SORT_OPTIONS" :key="opt.key" :value="opt.key">
            {{ opt.label }}
          </option>
        </select>
      </label>
    </section>

    <!-- ───────── 요구사항 1 : v-for + :key="id" ───────── -->
    <section class="card-grid">
      <article
        v-for="(city, index) in visibleList"
        :key="city.id"
        class="card"
        :class="{ selected: city.id === selectedId, active: index === activeIndex }"
        :style="{ '--band': bandOf(city.temp).color }"
        @click="selectCity(city)"
      >
        <header class="card-head">
          <h3>{{ city.name }}</h3>
          <span class="temp">{{ city.temp }}°</span>
        </header>

        <p class="card-status">
          {{ city.status }}
          <span class="feels">체감 {{ city.feelsLike }}°</span>
        </p>

        <!-- ───────── 요구사항 2 : 조건부 렌더링 ─────────
             교재 원본 2단계 (25도 기준) -->
        <p v-if="city.temp >= 25" class="label-hot">🔥 더움 (25도 이상)</p>
        <p v-else class="label-cool">❄️ 선선함 (25도 미만)</p>

        <!-- 🔧 개인 응용 ⑫ : 조건문 대신 구간 테이블에서 find() -->
        <p class="band-chip">
          {{ bandOf(city.temp).emoji }} {{ bandOf(city.temp).label }}
          <span v-if="bandOf(city.temp).note" class="band-note">
            {{ bandOf(city.temp).note }}
          </span>
        </p>

        <!-- 🔧 개인 응용 ⑬ : 중첩 v-for — 시간대별 기온 -->
        <div class="sparkline">
          <div
            v-for="(temp, i) in city.hourly"
            :key="HOURS[i]"
            class="bar-wrap"
            :title="`${HOURS[i]} · ${temp}°`"
          >
            <div
              class="bar"
              :style="{ height: barHeight(temp), '--band': bandOf(temp).color }"
            ></div>
            <span class="bar-hour">{{ HOURS[i].slice(0, 2) }}</span>
          </div>
        </div>

        <dl class="detail-list">
          <div>
            <dt>습도</dt>
            <dd>{{ city.humidity }}%</dd>
          </div>
          <div>
            <dt>미세먼지</dt>
            <dd :style="{ color: pmGradeOf(city.pm10).color }">
              {{ city.pm10 }} ({{ pmGradeOf(city.pm10).label }})
            </dd>
          </div>
        </dl>

        <!-- 요구사항 4 : 버블링 없이(.stop) 상세보기 -->
        <footer class="card-foot">
          <button class="btn-alert" @click.stop="showDetail(city.name, city.status)">
            알림창으로 보기
          </button>
          <button class="btn-modal" @click.stop="openModal(city)">상세보기</button>
        </footer>
      </article>

      <p v-if="visibleList.length === 0" class="empty">
        "{{ keyword }}" 와 일치하는 도시가 없습니다.
      </p>
    </section>

    <!-- ───────── 🔧 개인 응용 ⑭ : 커스텀 모달 ───────── -->
    <div
      v-if="modalCity"
      ref="modalRef"
      class="modal-backdrop"
      tabindex="-1"
      @click.self="closeModal"
      @keydown.esc="closeModal"
    >
      <div class="modal" :style="{ '--band': bandOf(modalCity.temp).color }">
        <header class="modal-head">
          <h3>{{ modalCity.name }}</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </header>
        <p class="modal-temp">
          {{ modalCity.temp }}° <span>{{ modalCity.status }}</span>
        </p>
        <p class="modal-band">
          {{ bandOf(modalCity.temp).emoji }} {{ bandOf(modalCity.temp).label }}
        </p>
        <dl class="modal-detail">
          <div>
            <dt>체감온도</dt>
            <dd>{{ modalCity.feelsLike }}°</dd>
          </div>
          <div>
            <dt>습도</dt>
            <dd>{{ modalCity.humidity }}%</dd>
          </div>
          <div>
            <dt>미세먼지</dt>
            <dd>{{ modalCity.pm10 }} ({{ pmGradeOf(modalCity.pm10).label }})</dd>
          </div>
        </dl>
        <p class="modal-hint">회색 배경을 클릭하거나 <kbd>Esc</kbd> 를 눌러 닫을 수 있습니다.</p>
      </div>
    </div>

    <!-- ───────── 구현 정리 ───────── -->
    <section class="spec">
      <h3>✅ 기본 기능 체크리스트</h3>
      <ul class="check-list">
        <li><strong>도시 카드 목록</strong> — 날씨 데이터를 카드로 반복 출력하고 고유 id로 관리</li>
        <li><strong>기온별 라벨</strong> — 25도를 기준으로 더움 / 선선함을 자동 구분</li>
        <li><strong>한글 검색</strong> — 한글 입력을 실시간으로 받아 처리하고 입력값을 표시</li>
        <li><strong>카드 선택</strong> — 클릭한 도시를 상태바에 표시</li>
        <li><strong>상세보기</strong> — 카드 선택과 겹치지 않도록 이벤트 전파를 차단</li>
        <li>
          <strong>날씨 데이터</strong> — 도시 8곳 · 기온 / 습도 / 미세먼지 / 체감온도 / 시간대별
          예보
        </li>
      </ul>

      <h3>✨ 추가 기능</h3>
      <p class="spec-sub">기본 기능 위에 직접 설계해서 얹은 부분입니다.</p>
      <ul class="plus-list">
        <li>
          <strong>한글 초성 검색</strong> — <code>ㅅㅇ</code> 만 입력해도 서울·수원이 검색됩니다.
          완성형 한글의 코드값을 분해해 초성을 뽑고, <strong>글자 단위로 비교</strong>해
          <code>서</code> 가 수원·부산까지 잡는 오탐을 막았습니다. 한글을 조합하는 도중에 나오는
          <code>강ㄹ</code> 같은 형태도 강릉에 매칭됩니다.
        </li>
        <li>
          <strong>조사 자동 처리</strong> — 받침 유무를 판별해 "서울<u>이</u> 선택되었습니다" /
          "제주<u>가</u> 선택되었습니다" 를 알아서 골라 씁니다.
        </li>
        <li>
          <strong>키보드 네비게이션</strong> — <kbd>↑</kbd> <kbd>↓</kbd> 로 카드 이동,
          <kbd>Enter</kbd> 로 선택, <kbd>Esc</kbd> 로 검색 초기화.
        </li>
        <li>
          <strong>온도 구간 8단계</strong> — 기상청 폭염·한파 특보 기준으로 구간을 나누고, 구간별
          색을 카드 전체에 반영합니다.
        </li>
        <li>
          <strong>시간대별 기온 그래프</strong> — 카드마다 3시간 간격 예보를 막대그래프로 그리고,
          막대마다 해당 온도의 구간 색을 입혔습니다.
        </li>
        <li>
          <strong>정렬 · 집계</strong> — 기온 / 미세먼지 / 가나다 4가지 정렬과 평균·최고·최저 자동
          계산.
        </li>
        <li>
          <strong>미세먼지 등급</strong> — 수치에 따라 좋음 / 보통 / 나쁨 / 매우나쁨을 색으로
          구분합니다.
        </li>
        <li>
          <strong>상세 모달</strong> — 배경 클릭 또는 <kbd>Esc</kbd> 로 닫히는 모달. 알림창과 달리
          화면을 멈추지 않습니다.
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.weather-app {
  max-width: 1100px;
  margin: 0 auto;
  font-size: 14px;
}
.app-header h2 {
  margin-bottom: 2px;
}
.subtitle {
  margin: 0 0 8px;
  color: #7f8c8d;
  font-size: 13px;
}

/* ───── 검색 ───── */
.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.search-input {
  flex: 1 1 280px;
  padding: 10px 12px;
  font-size: 15px;
  border: 2px solid #42b883;
  border-radius: 8px;
}
.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgb(66 184 131 / 20%);
}
.chosung-badge {
  padding: 4px 10px;
  border-radius: 12px;
  background-color: #8e44ad;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}
.btn-ghost {
  padding: 6px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  background: none;
  cursor: pointer;
}
.search-echo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  font-size: 13px;
  color: #555;
}
.echo-sub {
  color: #8e44ad;
}
.kbd-help {
  margin-left: auto;
  color: #95a5a6;
  font-size: 12px;
}
.status-bar {
  margin: 0 0 16px;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #2c3e50;
  color: #ecf0f1;
  font-weight: bold;
}

/* ───── 대시보드 ───── */
.dashboard {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: #f4f6f7;
}
.stat {
  display: flex;
  flex-direction: column;
}
.stat-label {
  color: #7f8c8d;
  font-size: 11px;
}
.sort-box {
  margin-left: auto;
  font-size: 13px;
}

/* ───── 카드 ───── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-left: 6px solid var(--band);
  border-radius: 10px;
  background-color: #fff;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgb(0 0 0 / 10%);
}
.card.selected {
  border-color: var(--band);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--band) 25%, transparent);
}
.card.active {
  outline: 3px dashed #8e44ad;
  outline-offset: 2px;
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.card-head h3 {
  margin: 0;
  font-size: 20px;
}
.temp {
  color: var(--band);
  font-size: 26px;
  font-weight: bold;
}
.card-status {
  margin: 4px 0 10px;
  color: #555;
}
.feels {
  margin-left: 8px;
  color: #95a5a6;
  font-size: 12px;
}
.label-hot,
.label-cool {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: bold;
}
.label-hot {
  color: #e74c3c;
}
.label-cool {
  color: #2980b9;
}
.band-chip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  padding: 5px 10px;
  border-radius: 12px;
  background-color: color-mix(in srgb, var(--band) 12%, transparent);
  color: var(--band);
  font-size: 12px;
  font-weight: bold;
}
.band-note {
  color: #7f8c8d;
  font-weight: normal;
}

/* ───── 시간대별 막대 (중첩 v-for) ───── */
.sparkline {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 64px;
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 6px;
  background-color: #f8f9f9;
}
.bar-wrap {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}
.bar {
  width: 100%;
  min-height: 3px;
  border-radius: 3px 3px 0 0;
  background-color: var(--band);
}
.bar-hour {
  margin-top: 3px;
  color: #95a5a6;
  font-size: 9px;
}

.detail-list {
  display: flex;
  gap: 18px;
  margin: 0 0 12px;
  font-size: 12px;
}
.detail-list dt {
  color: #95a5a6;
}
.detail-list dd {
  margin: 0;
  font-weight: bold;
}
.card-foot {
  display: flex;
  gap: 8px;
}
.card-foot button {
  flex: 1;
  padding: 7px 6px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.btn-alert {
  border: 1px solid #bdc3c7 !important;
  background-color: #ecf0f1;
}
.btn-modal {
  background-color: var(--band);
  color: #fff;
  font-weight: bold;
}
.empty {
  grid-column: 1 / -1;
  padding: 40px;
  color: #95a5a6;
  text-align: center;
}

/* ───── 모달 ───── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: rgb(0 0 0 / 55%);
}
.modal-backdrop:focus {
  outline: none;
}
.modal {
  width: 100%;
  max-width: 380px;
  padding: 22px;
  border-top: 6px solid var(--band);
  border-radius: 12px;
  background-color: #fff;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-head h3 {
  margin: 0;
  font-size: 22px;
}
.btn-close {
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}
.modal-temp {
  margin: 8px 0 4px;
  color: var(--band);
  font-size: 38px;
  font-weight: bold;
}
.modal-temp span {
  color: #555;
  font-size: 16px;
  font-weight: normal;
}
.modal-band {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: bold;
}
.modal-detail {
  margin: 0 0 14px;
}
.modal-detail div {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}
.modal-detail dt {
  color: #7f8c8d;
}
.modal-detail dd {
  margin: 0;
  font-weight: bold;
}
.modal-hint {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
  line-height: 1.7;
}
kbd {
  padding: 1px 5px;
  border: 1px solid #bdc3c7;
  border-radius: 3px;
  background-color: #ecf0f1;
  font-size: 11px;
}

/* ───── 구현 정리 ───── */
.spec {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 2px dashed #ccc;
}
.spec h3 {
  margin-bottom: 6px;
  color: #42b883;
  font-size: 15px;
}
.spec-sub {
  margin: 0 0 8px;
  color: #7f8c8d;
  font-size: 12px;
}
.check-list,
.plus-list {
  margin: 0 0 26px;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.9;
}
.check-list li,
.plus-list li {
  margin-bottom: 6px;
}
.check-list li strong,
.plus-list li strong {
  color: #2c3e50;
}
.check-list {
  list-style: '✅  ';
}
</style>
