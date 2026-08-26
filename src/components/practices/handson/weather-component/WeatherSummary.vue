<script setup>
import { useTemperature } from '@/composables/useTemperature'

const { format } = useTemperature()

defineProps({
  summary: {
    type: Object,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <section class="summary-grid">
    <div>
      <strong>{{ summary.count }}</strong
      ><span>표시 지역</span>
    </div>
    <div>
      <strong>{{ format(summary.average) }}</strong
      ><span>평균 기온</span>
    </div>
    <div>
      <strong>{{ summary.hottest }}</strong
      ><span>가장 더운 지역</span>
    </div>
    <div>
      <strong>{{ favoriteCount }}</strong
      ><span>즐겨찾기</span>
    </div>
  </section>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.summary-grid div {
  padding: 12px;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  background: #fff;
  text-align: center;
}

strong,
span {
  display: block;
}

span {
  margin-top: 4px;
  color: #636e72;
  font-size: 12px;
}
</style>
