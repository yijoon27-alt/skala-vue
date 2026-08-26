<script setup>
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

const selectCard = () => {
  emit('select-card', `${props.cityItem.name}이(가) 선택되었습니다.`)
}
</script>

<template>
  <article class="weather-card" @click="selectCard">
    <div>
      <h3>{{ cityItem.name }} · {{ cityItem.status }}</h3>
      <p>현재 기온 {{ cityItem.temp }}°C · 습도 {{ cityItem.humidity }}%</p>
      <span :class="['badge', cityItem.temp >= 25 ? 'hot' : 'cool']">
        {{ cityItem.temp >= 25 ? '🔥 더움' : '❄️ 선선함' }}
      </span>
    </div>
    <div class="card-actions">
      <button
        type="button"
        :aria-pressed="isFavorite"
        @click.stop="emit('toggle-favorite', cityItem.id)"
      >
        {{ isFavorite ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
      </button>
      <button type="button" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
        상세보기
      </button>
    </div>
  </article>
</template>

<style scoped>
.weather-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
  padding: 14px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}

h3,
p {
  margin: 0 0 8px;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.hot {
  background: #e74c3c;
}

.cool {
  background: #3498db;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  padding: 6px 10px;
  cursor: pointer;
}
</style>
