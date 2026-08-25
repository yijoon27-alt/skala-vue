<script setup>
import { ref } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.96) — Inline Handler vs Method Handler
 * ───────────────────────────────────────────── */
const count = ref(0)

// 메서드 핸들러 함수 정의
const showAlert = () => {
  alert('함수가 성공적으로 호출되었습니다!')
}

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — p.94 "주요 Events" 표를 실제로 붙여보기
 * 교재는 표로 8가지 이벤트를 나열만 하고 예제는 @click 하나만 다룬다.
 * 나머지 이벤트를 직접 연결해 언제 발생하는지 로그로 확인한다.
 * ───────────────────────────────────────────── */
const logs = ref([])
let logSeq = 0

function addLog(type, detail) {
  logs.value.unshift({
    id: ++logSeq,
    type,
    detail,
    time: new Date().toLocaleTimeString('ko-KR'),
  })
  // 최근 8건만 유지
  if (logs.value.length > 8) logs.value.pop()
}

const typedText = ref('')

const onInput = (e) => addLog('input', `타이핑 중: "${e.target.value}"`)
const onChange = (e) => addLog('change', `포커스 아웃 후 확정: "${e.target.value}"`)
const onKeyup = (e) => addLog('keyup', `${e.key} 키를 뗌`)
const onKeydown = (e) => addLog('keydown', `${e.key} 키를 누름`)
const onMouseenter = () => addLog('mouseenter', '마우스가 박스 안으로 들어옴')
const onMouseleave = () => addLog('mouseleave', '마우스가 박스를 벗어남')
const onSubmit = () => addLog('submit', '폼 제출됨 (.prevent로 새로고침 차단)')

const clearLogs = () => (logs.value = [])
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 핸들링 기초</h2>

    <!-- 교재 원본 (p.96) -->
    <h3>1) 인라인 연산 처리</h3>
    <p>현재 카운트: {{ count }}</p>
    <button @click="count++">1씩 증가</button>
    <br />
    <h3>2) 스크립트 함수 호출</h3>
    <button @click="showAlert">알림창 띄우기</button>

    <hr class="divider" />

    <!-- 🔧 개인 응용 -->
    <section class="custom">
      <h3>🔧 개인 응용 : 주요 이벤트 8종 직접 붙여보기</h3>
      <p class="desc">
        교재 p.94는 주요 이벤트를 표로 나열만 하고, 예제는 <code>@click</code> 하나만 다룬다. 나머지
        이벤트가 <strong>정확히 언제 발생하는지</strong> 로그로 확인한다.
      </p>

      <h4>input · change · keyup · keydown</h4>
      <form @submit.prevent="onSubmit">
        <input
          v-model="typedText"
          placeholder="여기에 타이핑 후 Tab 또는 Enter"
          @input="onInput"
          @change="onChange"
          @keyup="onKeyup"
          @keydown="onKeydown"
        />
        <button type="submit">제출 (submit)</button>
      </form>
      <p class="hint">
        💡 <code>input</code>은 <strong>글자를 칠 때마다</strong>, <code>change</code>는
        <strong>포커스가 빠질 때 한 번만</strong> 발생한다. 이 차이가 나중에 배울
        <code>v-model.lazy</code> 수식어(p.110)의 동작 원리다.
      </p>

      <h4>mouseenter · mouseleave</h4>
      <div class="hover-box" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
        이 박스 위에 마우스를 올렸다 내려보세요
      </div>

      <h4>이벤트 로그 (최근 8건)</h4>
      <button @click="clearLogs">로그 지우기</button>
      <ul class="log-list">
        <li v-for="log in logs" :key="log.id">
          <span class="badge" :class="'badge-' + log.type">{{ log.type }}</span>
          <span class="log-detail">{{ log.detail }}</span>
          <span class="log-time">{{ log.time }}</span>
        </li>
        <li v-if="logs.length === 0" class="log-empty">
          아직 발생한 이벤트가 없습니다. 위에서 조작해 보세요.
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.divider {
  margin: 25px 0;
  border: none;
  border-top: 2px dashed #ccc;
}
.custom h3 {
  color: #42b883;
}
.desc {
  color: #555;
  font-size: 14px;
}
.hover-box {
  padding: 20px;
  margin-bottom: 10px;
  background-color: #eef7f3;
  border: 2px dashed #42b883;
  border-radius: 6px;
  text-align: center;
}
.hover-box:hover {
  background-color: #d5f0e5;
}
.hint {
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.7;
}
.log-list {
  list-style: none;
  padding: 10px;
  margin-top: 8px;
  background-color: #2c3e50;
  border-radius: 6px;
  min-height: 40px;
}
.log-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: #ecf0f1;
}
.badge {
  flex-shrink: 0;
  width: 90px;
  padding: 2px 6px;
  border-radius: 4px;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: white;
  background-color: #7f8c8d;
}
.badge-input {
  background-color: #3498db;
}
.badge-change {
  background-color: #9b59b6;
}
.badge-keyup {
  background-color: #16a085;
}
.badge-keydown {
  background-color: #27ae60;
}
.badge-mouseenter,
.badge-mouseleave {
  background-color: #e67e22;
}
.badge-submit {
  background-color: #e74c3c;
}
.log-detail {
  flex: 1;
}
.log-time {
  color: #95a5a6;
  font-size: 12px;
}
.log-empty {
  color: #95a5a6;
  justify-content: center;
}
</style>
