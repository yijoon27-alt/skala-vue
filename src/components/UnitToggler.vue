<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const units = [
  { value: 'celsius', symbol: '℃', label: '섭씨' },
  { value: 'fahrenheit', symbol: '℉', label: '화씨' },
]
</script>

<template>
  <div class="unit-toggler" role="group" aria-label="온도 단위">
    <button
      v-for="item in units"
      :key="item.value"
      type="button"
      :class="{ active: configStore.unit === item.value }"
      :aria-pressed="configStore.unit === item.value"
      :title="`${item.label}로 보기`"
      @click="configStore.setUnit(item.value)"
    >
      {{ item.symbol }}
    </button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
}

button {
  min-width: 40px;
  padding: 7px 10px;
  border: 0;
  background: #fff;
  color: #636e72;
  cursor: pointer;
  font-size: 14px;
}

button + button {
  border-left: 1px solid #dfe6e9;
}

button.active {
  background: #6c5ce7;
  color: #fff;
  font-weight: 700;
}
</style>
