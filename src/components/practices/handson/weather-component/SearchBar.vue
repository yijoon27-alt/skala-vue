<script setup>
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
  resultCount: {
    type: Number,
    default: 0,
  },
  isChosungQuery: {
    type: Boolean,
    default: false,
  },
  activeCityName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query', 'move-highlight', 'select-highlight', 'reset-query'])

const updateQuery = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-inner">
    <label for="city-search">도시 검색</label>
    <div class="search-row">
      <input
        id="city-search"
        type="search"
        :value="currentQuery"
        placeholder="도시명 또는 초성 입력 (예: ㅅㅇ)"
        @input="updateQuery"
        @keydown.down.prevent="emit('move-highlight', 1)"
        @keydown.up.prevent="emit('move-highlight', -1)"
        @keydown.enter.prevent="emit('select-highlight')"
        @keydown.esc="emit('reset-query')"
      />
      <button v-if="currentQuery" type="button" @click="emit('reset-query')">초기화</button>
    </div>
    <p>
      검색어: <strong>{{ currentQuery || '전체' }}</strong> · {{ resultCount }}개 지역
      <span v-if="isChosungQuery" class="mode-badge">초성 검색</span>
    </p>
    <small>
      ↑↓ 이동 · Enter 선택 · Esc 초기화
      <strong v-if="activeCityName"> · 선택 예정: {{ activeCityName }}</strong>
    </small>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.search-row {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px 10px;
}

button {
  padding: 8px 12px;
  cursor: pointer;
}

p {
  margin: 8px 0 0;
}

.mode-badge {
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #6c5ce7;
  color: #fff;
  font-size: 11px;
}
</style>
