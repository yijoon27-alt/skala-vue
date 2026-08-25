<script setup>
import { ref } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.102) — .prevent / .stop
 * ───────────────────────────────────────────── */
const handleLink = () => {
  alert('수식어 덕분에 네이버로 이동하지 않고 함수만 실행됩니다!')
}
const handleBox = () => {
  alert('부모 박스가 클릭되었습니다!')
}
const handleChild1 = () => {
  alert('1번 자식 클릭!')
}
const handleChild2 = () => {
  alert('2번 자식(나만 켜짐) 클릭!')
}

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — 교재가 빠뜨린 .once 와 .self 채우기
 * p.101 표에는 .prevent / .stop / .once / .self 4가지가 정리돼 있는데,
 * p.102 예제 코드에는 .prevent 와 .stop 두 개만 있다.
 * 나머지 2개를 직접 구현하고, alert 대신 화면 로그로 결과를 남긴다.
 * (alert은 브라우저를 멈춰 세워 여러 이벤트의 순서를 관찰할 수 없다)
 * ───────────────────────────────────────────── */
const logs = ref([])
let logSeq = 0

function log(message) {
  logs.value.unshift({
    id: ++logSeq,
    message,
    time: new Date().toLocaleTimeString('ko-KR'),
  })
  if (logs.value.length > 8) logs.value.pop()
}

const clearLogs = () => (logs.value = [])

// .once — 최초 1회만 실행되고 리스너가 제거된다
const submitCount = ref(0)
const onSurveySubmit = () => {
  submitCount.value++
  log(`[.once] 설문 제출 처리됨 (총 ${submitCount.value}회) — 이제 더 눌러도 반응 없음`)
}
const onNormalSubmit = () => {
  log('[수식어 없음] 제출 처리됨 — 누를 때마다 계속 실행됨')
}

// .self — e.target === e.currentTarget 일 때만 실행
const onSelfBox = () => log('[.self] 부모 박스를 "직접" 클릭했을 때만 실행됨')
const onNormalBox = () => log('[수식어 없음] 자식을 눌러도 버블링으로 부모까지 실행됨')
const onInnerClick = () => log('  └ 자식 버튼 클릭됨')

const resetOnce = () => {
  submitCount.value = 0
  clearLogs()
  // .once 리스너를 되살리려면 요소 자체를 새로 그려야 한다 (:key 변경)
  onceKey.value++
}
const onceKey = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>이벤트 수식어(Modifiers) 학습</h2>

    <!-- 교재 원본 (p.102) -->
    <h3>1) .prevent (기본 동작 막기)</h3>
    <a href="https://www.naver.com" @click.prevent="handleLink">네이버 링크</a>
    <br />
    <h3>2) .stop (이벤트 버블링 막기)</h3>
    <div @click="handleBox" style="padding: 20px; background-color: #eee">
      <p>부모 영역 (클릭 시 alert 발동)</p>
      <button @click="handleChild1">버블링 발생 버튼</button>
      <button @click.stop="handleChild2">버블링 차단 버튼</button>
    </div>

    <hr class="divider" />

    <!-- 🔧 개인 응용 -->
    <section class="custom">
      <h3>🔧 개인 응용 : 교재가 빠뜨린 .once 와 .self</h3>
      <p class="desc">
        p.101 표에는 수식어가 <strong>4가지</strong>(<code>.prevent</code> <code>.stop</code>
        <code>.once</code> <code>.self</code>) 정리돼 있지만, p.102 예제에는 앞의 2개만 있다. 나머지
        2개를 직접 만들어 확인한다. 결과는 <code>alert</code> 대신 화면 로그로 남긴다 —
        <strong>alert은 브라우저를 멈춰 세워 이벤트 순서를 관찰할 수 없기 때문이다.</strong>
      </p>

      <h4>3) .once — 딱 한 번만 실행</h4>
      <div class="demo-box">
        <button :key="onceKey" @click.once="onSurveySubmit">
          ✅ .once 적용 (설문 제출 · 1회만)
        </button>
        <button @click="onNormalSubmit">❌ 수식어 없음 (계속 실행)</button>
        <button class="reset" @click="resetOnce">되살리기</button>
      </div>
      <p class="hint">
        💡 <code>.once</code>는 실행 후 <strong>리스너 자체가 제거된다.</strong> 좋아요 버튼 중복
        클릭이나 결제 버튼 이중 제출을 막을 때 쓴다. 한 번 소모되면 되살릴 방법이 없어서, 위
        "되살리기"는 <code>:key</code>를 바꿔 <strong>버튼을 통째로 새로 그리는</strong> 방식을
        썼다.
      </p>

      <h4>4) .self — 자기 자신을 직접 클릭했을 때만</h4>
      <div class="side-by-side">
        <div class="self-box safe" @click.self="onSelfBox">
          <strong>✅ @click.self</strong>
          <p>회색 여백을 눌러야 실행</p>
          <button @click="onInnerClick">자식 버튼</button>
        </div>
        <div class="self-box danger" @click="onNormalBox">
          <strong>❌ @click (수식어 없음)</strong>
          <p>자식을 눌러도 실행됨</p>
          <button @click="onInnerClick">자식 버튼</button>
        </div>
      </div>
      <p class="hint">
        💡 <code>.self</code>는 내부적으로 <code>e.target === e.currentTarget</code> 을 검사한다.
        모달의 <strong>바깥 배경을 눌렀을 때만 닫기</strong>를 구현할 때 쓰는 수식어다. 없으면 모달
        내용을 클릭해도 창이 닫혀 버린다.
      </p>

      <h4>이벤트 로그 (최근 8건)</h4>
      <button @click="clearLogs">로그 지우기</button>
      <ul class="log-list">
        <li v-for="entry in logs" :key="entry.id">
          <span class="log-msg">{{ entry.message }}</span>
          <span class="log-time">{{ entry.time }}</span>
        </li>
        <li v-if="logs.length === 0" class="log-empty">
          아직 발생한 이벤트가 없습니다. 위 버튼들을 눌러 보세요.
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
.demo-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.reset {
  margin-left: auto;
}
.side-by-side {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}
.self-box {
  flex: 1 1 240px;
  padding: 20px;
  border-radius: 6px;
  cursor: pointer;
}
.self-box p {
  font-size: 13px;
  color: #666;
}
.self-box.safe {
  border: 2px solid #42b883;
  background-color: #eafaf3;
}
.self-box.danger {
  border: 2px solid #e74c3c;
  background-color: #fdedec;
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
.log-msg {
  flex: 1;
  white-space: pre-wrap;
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
