<script setup>
import { ref } from 'vue'
import LifecycleChild from './LifecycleChild.vue'

const isShow = ref(true)
const parentCount = ref(0)
const removedCount = ref(0)

const toggleChild = () => {
  if (isShow.value) removedCount.value++
  isShow.value = !isShow.value
}
</script>

<template>
  <div class="practice-section">
    <h2>Lifecycle Hook</h2>
    <button class="toggle-btn" @click="toggleChild">
      {{ isShow ? '🛑 실습 컴포넌트 파괴하기 (v-if="false")' : '🟢 실습 컴포넌트 다시 살리기' }}
    </button>
    <hr />
    <LifecycleChild v-if="isShow" />

    <section class="customization">
      <h3>✨ 추가 기능 — 상태 생명주기 비교</h3>
      <p>
        부모 카운트: <strong>{{ parentCount }}</strong>
        <button @click="parentCount++">부모 카운트 증가</button>
      </p>
      <p>자식 제거 횟수: {{ removedCount }}</p>
      <small>자식을 다시 만들면 자식 카운트는 0부터 시작하지만 부모 카운트는 유지됩니다.</small>
    </section>
  </div>
</template>

<style scoped>
.toggle-btn {
  width: 100%;
  margin-bottom: 15px;
  padding: 10px 15px;
  font-weight: bold;
  cursor: pointer;
}

.customization {
  margin-top: 20px;
  padding: 15px;
  border-left: 4px solid #9b59b6;
  background-color: #f8f4fb;
}

.customization button {
  margin-left: 8px;
}
</style>
