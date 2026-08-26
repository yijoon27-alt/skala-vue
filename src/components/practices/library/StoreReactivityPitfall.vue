<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()

// ❌ 그냥 구조 분해 — Proxy 연결이 끊겨 이 순간의 숫자로 고정된다
const { count: plainCount, doubleCount: plainDouble } = counterStore

// ✅ storeToRefs — ref 로 감싸 반응형 연결 고리를 보존한다
const { count: refCount, doubleCount: refDouble } = storeToRefs(counterStore)

// ✅ 함수(actions)는 구조 분해해도 무방하다
const { increment } = counterStore
</script>

<template>
  <div class="practice-section">
    <h2>구조 분해 할당과 storeToRefs</h2>
    <button type="button" @click="increment">숫자 1 증가 (actions 구조 분해)</button>

    <table>
      <thead>
        <tr>
          <th>접근 방식</th>
          <th>state (count)</th>
          <th>getters (doubleCount)</th>
          <th>반응형</th>
        </tr>
      </thead>
      <tbody>
        <tr class="broken">
          <td><code>const { count } = counterStore</code></td>
          <td>{{ plainCount }}</td>
          <td>{{ plainDouble }}</td>
          <td>❌ 멈춤</td>
        </tr>
        <tr>
          <td><code>storeToRefs(counterStore)</code></td>
          <td>{{ refCount }}</td>
          <td>{{ refDouble }}</td>
          <td>✅ 갱신</td>
        </tr>
        <tr>
          <td><code>counterStore.count</code> (분해 안 함)</td>
          <td>{{ counterStore.count }}</td>
          <td>{{ counterStore.doubleCount }}</td>
          <td>✅ 갱신</td>
        </tr>
      </tbody>
    </table>

    <p class="note">
      버튼을 눌러도 첫 줄만 멈춰 있다. <strong>state 뿐 아니라 getters 도 유실 대상</strong>이며,
      함수인 actions 는 구조 분해해도 정상 동작한다 (이 버튼이 그 증거다).
    </p>
  </div>
</template>

<style scoped>
table {
  margin-top: 12px;
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  padding: 8px 10px;
  border: 1px solid #dee2e6;
  text-align: left;
}

.broken td {
  background: #fff4f4;
}

.note {
  margin-top: 10px;
  color: #636e72;
}
</style>
