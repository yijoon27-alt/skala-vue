import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const UNIT_SYMBOLS = { celsius: '℃', fahrenheit: '℉' }

export const useConfigStore = defineStore(
  'config',
  () => {
    // 1. State
    const unit = ref('celsius') // 교재 지정 — 초기값 celsius
    const favoritesOnly = ref(false) // 대시보드에서 즐겨찾기 도시만 보기
    const actionLog = ref([]) // 설정 변경 이력 ($onAction 이 채운다)

    // 2. Getters
    const unitSymbol = computed(() => UNIT_SYMBOLS[unit.value]) // 교재 지정 — ℃ / ℉
    const isFahrenheit = computed(() => unit.value === 'fahrenheit')
    const unitLabel = computed(() => (isFahrenheit.value ? '화씨' : '섭씨'))

    // 3. Actions
    function toggleUnit() {
      // 교재 지정 — celsius ↔ fahrenheit 스위칭
      unit.value = isFahrenheit.value ? 'celsius' : 'fahrenheit'
    }

    function setUnit(nextUnit) {
      if (UNIT_SYMBOLS[nextUnit]) unit.value = nextUnit
    }

    function toggleFavoritesOnly() {
      favoritesOnly.value = !favoritesOnly.value
    }

    function resetConfig() {
      unit.value = 'celsius'
      favoritesOnly.value = false
    }

    function clearActionLog() {
      actionLog.value = []
    }

    return {
      unit,
      favoritesOnly,
      actionLog,
      unitSymbol,
      isFahrenheit,
      unitLabel,
      toggleUnit,
      setUnit,
      toggleFavoritesOnly,
      resetConfig,
      clearActionLog,
    }
  },
  {
    persist: { key: 'skala-weather-config', paths: ['unit', 'favoritesOnly'] },
    trackActions: { keys: ['unit', 'favoritesOnly'] },
  },
)
