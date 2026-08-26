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
})

const emit = defineEmits(['update-query'])

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
        placeholder="검색할 도시 이름 입력"
        @input="updateQuery"
      />
      <button v-if="currentQuery" type="button" @click="emit('update-query', '')">초기화</button>
    </div>
    <p>
      검색어: <strong>{{ currentQuery || '전체' }}</strong> · {{ resultCount }}개 지역
    </p>
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
</style>
