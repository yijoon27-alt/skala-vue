<script setup>
import { ref, computed, onMounted, useTemplateRef } from 'vue'
import StyleChildCard from './StyleChildCard.vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.114) — 자바스크립트 방은 비어 있다.
 * ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — scoped 를 "설명" 말고 "증거"로 확인하기
 *
 * 교재 p.113은 scoped 를 "다른 컴포넌트에는 영향을 주지 않는다"고 문장으로만 설명하고,
 * p.114 예제는 컴포넌트가 하나뿐이라 정작 그 격리가 일어나는 장면이 없다.
 * 또 Vue 3의 핵심 스타일 기능인 `:deep()` 과 CSS `v-bind()` 는 교재에 아예 없다.
 *
 *  ① 같은 클래스명(.title)을 쓰는 자식 컴포넌트를 두고 격리를 눈으로 확인
 *  ② scoped 가 실제로 어떻게 구현되는지 — data-v- 해시 속성을 DOM에서 직접 읽어 표시
 *  ③ :deep() — scoped 상태로 자식 내부까지 스타일을 넣는 방법
 *  ④ CSS v-bind() — JS 상태를 CSS가 직접 참조 (교재 미수록)
 * ───────────────────────────────────────────── */

// ② data-v- 해시를 DOM에서 직접 읽는다
const probeEl = useTemplateRef('probeEl')
const scopeId = ref('(측정 중…)')
onMounted(() => {
  const found = [...(probeEl.value?.attributes ?? [])]
    .map((a) => a.name)
    .filter((n) => n.startsWith('data-v-'))
  scopeId.value = found.length ? found.join(' ') : '(scoped 속성 없음)'
})

// ③ :deep() 적용 on/off
const deepOn = ref(false)

// ④ CSS v-bind() 로 넘길 상태
const themeColor = ref('#42b883')
const radiusPx = ref(8)
const paddingPx = ref(20)
const cardRadius = computed(() => `${radiusPx.value}px`)
const cardPadding = computed(() => `${paddingPx.value}px`)
</script>

<template>
  <div class="practice-section">
    <!-- ───────── 교재 원본 (p.114) ───────── -->
    <h2>Scoped 스타일 및 외부 CSS 활용</h2>
    <p class="title">이 글자는 이 컴포넌트 내부에서만 빨간색이 됩니다.</p>
    <button class="btn-external">외부 CSS에서 불러온 버튼 스타일</button>

    <hr class="divider" />

    <!-- ───────── 🔧 개인 응용 ───────── -->
    <section class="custom">
      <h3>🔧 개인 응용 : scoped 를 "설명" 말고 "증거"로 확인하기</h3>
      <p class="desc">
        교재 p.113은 scoped 를 <strong>"다른 컴포넌트에는 영향을 주지 않는다"</strong>고 문장으로만
        설명하고, p.114 예제는 컴포넌트가 하나뿐이라 정작 그 격리가 일어나는 장면이 없다. 자식
        컴포넌트를 하나 만들어 <strong>같은 클래스명</strong>을 쓰게 하고, 격리가 실제로 어떻게
        구현되는지까지 확인한다.
      </p>

      <!-- ① -->
      <h4>① 같은 <code>.title</code> 클래스, 다른 색 — 격리의 실물</h4>
      <div class="side-by-side">
        <div class="demo-box">
          <strong>부모(이 컴포넌트)</strong>
          <p class="title">부모의 .title — 위 교재 예제와 같은 빨간색</p>
        </div>
        <div class="demo-box">
          <strong>자식 컴포넌트</strong>
          <StyleChildCard />
        </div>
      </div>
      <p class="hint">
        💡 두 컴포넌트가 <strong>똑같이 <code>.title</code></strong> 을 쓰는데 색이 다르다. 순수
        CSS였다면 나중에 로드된 쪽이 이겨서 한쪽이 오염됐을 것이다. 반면 위 교재 예제의
        <code>.btn-external</code> 은 <code>scoped</code> 없는 <code>&lt;style&gt;</code> 에서
        <code>@import</code> 된 것이라 <strong>프로젝트 전역</strong>에 퍼진다. 같은 파일 안에서도
        두 블록의 성격이 완전히 다르다.
      </p>

      <!-- ② -->
      <h4>② scoped 는 어떻게 구현되는가 — <code>data-v-</code> 해시</h4>
      <p ref="probeEl" class="probe-line">이 문단에 붙은 속성을 마운트 직후 직접 읽었다 →</p>
      <p class="state">{{ scopeId }}</p>
      <p class="hint">
        💡 <code>scoped</code> 는 마법이 아니라 <strong>속성 선택자</strong>다. 빌드 시 이
        컴포넌트의 모든 엘리먼트에 위 해시 속성이 붙고, CSS 규칙은
        <code>.title[data-v-xxxxxxx]</code> 로 다시 쓰인다. 해시가 컴포넌트마다 달라서 같은
        클래스명이어도 서로 안 걸린다. <strong>런타임 격리가 아니라 컴파일 타임 치환</strong>이다.
      </p>

      <!-- ③ -->
      <h4>③ <code>:deep()</code> — scoped 를 유지한 채 자식 안쪽 건드리기</h4>
      <div class="demo-box" :class="{ 'deep-on': deepOn }">
        <label class="switch">
          <input type="checkbox" v-model="deepOn" />
          <code>:deep(.card-body)</code> 적용
        </label>
        <StyleChildCard />
      </div>
      <p class="hint">
        💡 <code>scoped</code> 상태에서 <code>.card-body { … }</code> 라고 쓰면
        <strong>아무 일도 일어나지 않는다.</strong> 자식 엘리먼트에는 부모의 해시가 안 붙기
        때문이다. <code>:deep(.card-body)</code> 를 쓰면 선택자가
        <code>[data-v-부모] .card-body</code> 로 바뀌어 자식 내부까지 닿는다. UI 라이브러리(p.231
        단원)의 내부 마크업을 커스터마이징할 때 반드시 쓰게 되는 문법인데 교재 p.113에는 없다.
      </p>

      <!-- ④ -->
      <h4>④ CSS <code>v-bind()</code> — JS 상태를 CSS가 직접 읽는다 (교재 미수록)</h4>
      <div class="controls">
        <label>
          테마 색상
          <input type="color" v-model="themeColor" />
          <code>{{ themeColor }}</code>
        </label>
        <label>
          모서리 <input type="range" v-model.number="radiusPx" min="0" max="40" />
          <code>{{ cardRadius }}</code>
        </label>
        <label>
          여백 <input type="range" v-model.number="paddingPx" min="4" max="48" />
          <code>{{ cardPadding }}</code>
        </label>
      </div>
      <div class="live-card">
        <strong>이 카드의 색·모서리·여백은 CSS 안에서 v-bind() 로 바인딩돼 있다</strong>
        <p>슬라이더를 움직이면 <code>:style</code> 없이도 즉시 반응한다.</p>
      </div>
      <pre class="src">
/* &lt;style scoped&gt; 안에서 그대로 */
.live-card {
  background-color: v-bind(themeColor);
  border-radius:    v-bind(cardRadius);
  padding:          v-bind(cardPadding);
}</pre
      >
      <p class="hint">
        💡 <code>v-bind()</code> 는 컴파일 시 <strong>CSS 변수</strong>로 바뀌고, 값이 변할 때 Vue가
        그 변수만 갱신한다 — 개발 모드에서는 <code>--263c18ce-themeColor</code> 처럼 이름이 남지만
        <code>npm run build</code> 후에는 <code>--e2130de8</code> 로 완전히 해시된다(직접 빌드해서
        확인). 인라인 <code>:style</code> 과 달리
        <strong
          >가상 선택자(<code>:hover</code>, <code>::before</code>)와 미디어 쿼리 안에서도 쓸 수
          있다.</strong
        >
        단, 숫자만 넘기면 CSS가 해석하지 못하므로 <code>computed</code> 로 <code>"8px"</code> 처럼
        <strong>단위를 붙여서</strong> 넘겨야 한다 — 이걸 몰라서 <code>radius</code> 가 안 먹는 걸
        한참 들여다봤다.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* ───────── 교재 원본 (p.114) — 내 방 전용 타이틀 디자인 ───────── */
.title {
  color: #ff7675;
  font-weight: bold;
  font-size: 18px;
}

/* ───────── 🔧 개인 응용 ───────── */
.divider {
  margin: 25px 0;
  border: none;
  border-top: 2px dashed #ccc;
}
.custom h3 {
  color: #42b883;
}
.custom h4 {
  margin-top: 22px;
}
.desc {
  color: #555;
  font-size: 14px;
  line-height: 1.7;
}
.side-by-side {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.demo-box {
  flex: 1 1 250px;
  padding: 14px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  background-color: #f8f9f9;
}

/* ③ :deep() — 켜졌을 때만 자식 내부 .card-body 에 도달한다 */
.demo-box.deep-on :deep(.card-body) {
  padding: 6px 8px;
  border-radius: 4px;
  background-color: #42b883;
  color: #fff;
  font-weight: bold;
}
.switch {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
}
.probe-line {
  margin: 8px 0 4px;
  font-size: 13px;
  color: #555;
}
.state {
  margin: 0;
  padding: 6px 8px;
  background-color: #2c3e50;
  border-radius: 4px;
  color: #ecf0f1;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 12px;
  font-size: 13px;
}
.controls label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ④ CSS v-bind() — JS 상태를 CSS가 직접 참조한다 */
.live-card {
  background-color: v-bind(themeColor);
  border-radius: v-bind(cardRadius);
  padding: v-bind(cardPadding);
  color: #fff;
  transition: all 0.15s ease;
}
.live-card p {
  margin: 6px 0 0;
  font-size: 13px;
}
.src {
  margin-top: 10px;
  padding: 12px;
  background-color: #2c3e50;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
.hint {
  margin-top: 10px;
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.8;
}
</style>

<style>
/* ⚠️ 교재 p.114 — 외부 스타일 파일을 이 컴포넌트 안으로 가져온다.
   scoped 가 없는 블록이라 .btn-external 은 프로젝트 전역에 적용된다. */
@import '@/assets/challenge.css';
</style>
