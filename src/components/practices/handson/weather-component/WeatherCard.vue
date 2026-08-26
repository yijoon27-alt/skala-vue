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
  isHighlighted: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'open-modal', 'toggle-favorite'])

const selectCard = () => {
  emit('select-card', props.cityItem)
}
</script>

<template>
  <article
    :class="['weather-card', { highlighted: isHighlighted, selected: isSelected }]"
    @click="selectCard"
  >
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
        빠른 알림
      </button>
      <button type="button" @click.stop="emit('open-modal', cityItem)">상세 패널</button>
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

.weather-card.highlighted {
  outline: 3px solid #f1c40f;
  outline-offset: 2px;
}

.weather-card.selected {
  border-color: #6c5ce7;
  background: #f7f5ff;
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
