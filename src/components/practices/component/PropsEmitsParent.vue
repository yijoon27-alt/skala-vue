<script setup>
import { ref } from 'vue'
import PropsEmitsChild from './PropsEmitsChild.vue'

const message = ref('Parent 초기 메시지')
const updateCount = ref(0)

const handleUpdateRequest = (newValue) => {
  message.value = newValue
  updateCount.value++
}
</script>

<template>
  <div class="practice-section">
    <h2>Props & Emits</h2>
    <div class="parent-container">
      <h2>상위 컴포넌트 (Parent)</h2>
      <p>
        현재 로컬 데이터(State): <strong>{{ message }}</strong>
      </p>
      <p>자식 요청으로 갱신된 횟수: {{ updateCount }}</p>
      <PropsEmitsChild :parent-data="message" @update-request="handleUpdateRequest" />
    </div>
  </div>
</template>

<style scoped>
.parent-container {
  margin: 0 auto;
  padding: 20px;
  border: 2px solid #2ecc71;
  border-radius: 8px;
  background-color: #f8f9fa;
}
</style>
