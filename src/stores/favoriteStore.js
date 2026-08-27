import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'

export const useFavoriteStore = defineStore(
  'favorite',
  () => {
    // 1. State
    const ids = ref([])

    // 2. Getters
    const count = computed(() => ids.value.length)
    const isFavorite = computed(() => (cityId) => ids.value.includes(cityId))
    // 즐겨찾기 목록에도 실시간 관측값이 그대로 보이도록 weatherStore 를 거친다
    const favoriteCities = computed(() =>
      useWeatherStore().cities.filter((city) => ids.value.includes(city.id)),
    )

    // 3. Actions
    function toggle(cityId) {
      ids.value = ids.value.includes(cityId)
        ? ids.value.filter((id) => id !== cityId)
        : [...ids.value, cityId]
    }

    function remove(cityId) {
      ids.value = ids.value.filter((id) => id !== cityId)
    }

    function clear() {
      ids.value = []
    }

    return { ids, count, isFavorite, favoriteCities, toggle, remove, clear }
  },
  {
    persist: { key: 'skala-weather-favorites', paths: ['ids'] },
  },
)
