import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weatherCities } from '@/data/weather'
import { fetchAirPollution, fetchAllCities, hasApiKey } from '@/api/openWeather'

/**
 * 실시간 관측 스토어
 *
 * 화면은 Mock 인지 실시간인지 신경 쓰지 않고 이 스토어의 cities 만 읽는다.
 * 통신이 성공하면 실시간 값이 Mock 위에 덮이고, 실패하면 Mock 이 그대로 남아
 * 대시보드가 빈 화면이 되지 않는다(Graceful Degradation).
 */
export const useWeatherStore = defineStore('weather', () => {
  // 1. State
  const liveById = ref({}) // cityId → 실시간 관측값
  const airById = ref({}) // cityId → 대기질 (별도 엔드포인트)
  const status = ref(hasApiKey ? 'idle' : 'nokey') // idle | loading | live | fallback | nokey
  const errorMessage = ref('')
  const lastSyncedAt = ref('')
  const lastElapsed = ref(0)

  // 2. Getters
  const cities = computed(() =>
    weatherCities.map((base) => {
      const live = liveById.value[base.id]
      return live ? { ...base, ...live, source: 'live' } : { ...base, source: 'mock' }
    }),
  )

  const isLive = computed(() => status.value === 'live')
  const isLoading = computed(() => status.value === 'loading')

  const sourceLabel = computed(() => {
    if (status.value === 'live') return `실시간 · ${lastSyncedAt.value} 기준`
    if (status.value === 'loading') return '실시간 데이터 불러오는 중…'
    if (status.value === 'nokey') return '샘플 데이터 (API 키 미설정)'
    if (status.value === 'fallback') return '샘플 데이터 (실시간 연결 실패)'
    return '샘플 데이터'
  })

  // 3. Actions
  function findCity(cityId) {
    return cities.value.find((city) => city.id === cityId) ?? null
  }

  function findAir(cityId) {
    return airById.value[cityId] ?? null
  }

  async function syncAll(config = {}) {
    if (!hasApiKey) {
      status.value = 'nokey'
      errorMessage.value = 'API 키가 없어 저장된 샘플 값을 표시합니다.'
      return
    }
    if (status.value === 'loading') return

    status.value = 'loading'
    const startedAt = performance.now()

    try {
      const results = await fetchAllCities(weatherCities, config)
      liveById.value = Object.fromEntries(
        results.map((result, index) => [weatherCities[index].id, result]),
      )
      lastSyncedAt.value = new Date().toTimeString().slice(0, 5)
      lastElapsed.value = Math.round(performance.now() - startedAt)
      errorMessage.value = ''
      status.value = 'live'
    } catch (error) {
      // 인터셉터가 만들어 준 문구를 그대로 화면에 쓴다
      errorMessage.value = error.message ?? '실시간 데이터를 가져오지 못했습니다.'
      status.value = 'fallback'
    }
  }

  /** 앱 진입 시 한 번만 — 라우트를 오갈 때마다 다시 호출하지 않는다 */
  async function ensureLoaded() {
    if (status.value === 'idle') await syncAll()
  }

  async function loadAir(cityId) {
    if (!hasApiKey || airById.value[cityId]) return
    const city = weatherCities.find((item) => item.id === cityId)
    if (!city) return

    try {
      airById.value = { ...airById.value, [cityId]: await fetchAirPollution(city) }
    } catch {
      // 대기질은 부가 정보다. 실패해도 본문 관측값 표시를 막지 않는다
    }
  }

  return {
    liveById,
    airById,
    status,
    errorMessage,
    lastSyncedAt,
    lastElapsed,
    cities,
    isLive,
    isLoading,
    sourceLabel,
    findCity,
    findAir,
    syncAll,
    ensureLoaded,
    loadAir,
  }
})
