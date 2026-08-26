import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { weatherCities } from '@/data/weather'

export const useFavoriteStore = defineStore(
  'favorite',
  () => {
    // 1. State
    const ids = ref([])

    // 2. Getters
    const count = computed(() => ids.value.length)
    const isFavorite = computed(() => (cityId) => ids.value.includes(cityId))
    const favoriteCities = computed(() =>
      weatherCities.filter((city) => ids.value.includes(city.id)),
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
