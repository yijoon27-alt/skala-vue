<script setup>
import { ref, computed } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.106) — v-model 과 그 내부 원리
 * ───────────────────────────────────────────── */
const text1 = ref('') // v-model용 변수
const text2 = ref('') // 원리 이해용 변수

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — "v-model 은 정말 :value + @input 인가?"
 *
 * 교재 p.106은 v-model을 `:value` + `@input` 의 축약이라고 설명하고 끝난다.
 * 그런데 한글을 입력해 보면 두 방식의 결과가 **다르게** 나온다.
 *
 * 실제 Vue 소스(@vue/runtime-dom, vModelText)를 열어 보면
 *   addEventListener(el, 'input', (e) => {
 *     if (e.target.composing) return     // ← 교재에 없는 한 줄
 *     el[assignKey](castValue(el.value, trim, number))
 *   })
 *   addEventListener(el, 'compositionstart', onCompositionStart)  // composing = true
 *   addEventListener(el, 'compositionend',   onCompositionEnd)    // composing = false
 * 라는 IME(한글/일본어/중국어) 조합 가드가 들어 있다.
 *
 * 아래에서는 입력창 하나에 모든 이벤트를 직접 걸어,
 * 같은 타이핑에 대해 두 방식이 어떻게 갈라지는지 동시에 관측한다.
 * (교재 p.116 Hands-on 요구사항 3번이 "한글 처리는 :value/@input" 이라고 지정한 이유이기도 하다)
 * ───────────────────────────────────────────── */

const manualValue = ref('') // 교재 방식: input 이벤트마다 무조건 반영
const modelValue = ref('') // v-model 재현: composing 중이면 건너뜀
const isComposing = ref(false)
const inputCount = ref(0) // input 이벤트 발생 횟수
const skippedCount = ref(0) // v-model이 무시한 횟수

const imeLogs = ref([])
let logSeq = 0

function log(type, detail) {
  imeLogs.value.unshift({ id: ++logSeq, type, detail })
  if (imeLogs.value.length > 12) imeLogs.value.pop()
}

function onInput(e) {
  inputCount.value++
  manualValue.value = e.target.value // ① 가드 없음 (교재 p.106 방식)

  if (e.target.composing) {
    skippedCount.value++ // ② Vue v-model 은 여기서 return
    log('skip', `조합 중이라 v-model은 무시 — 화면엔 "${e.target.value}"`)
    return
  }
  modelValue.value = e.target.value
  log('input', `반영됨 → "${e.target.value}"`)
}

function onCompositionStart(e) {
  e.target.composing = true
  isComposing.value = true
  log('start', 'compositionstart — 한글 조합 시작')
}

function onCompositionEnd(e) {
  e.target.composing = false
  isComposing.value = false
  log('end', `compositionend — 글자 확정 "${e.target.value}"`)
  onInput(e) // Vue도 compositionend 직후 input을 다시 발생시킨다
}

const resetIme = () => {
  manualValue.value = ''
  modelValue.value = ''
  inputCount.value = 0
  skippedCount.value = 0
  imeLogs.value = []
}

// 두 값이 갈라진 순간을 강조하기 위한 계산 속성
const isDiverged = computed(() => manualValue.value !== modelValue.value)

const logStyle = {
  start: { label: 'composition', color: '#8e44ad' },
  end: { label: 'confirmed', color: '#16a085' },
  input: { label: 'input', color: '#2980b9' },
  skip: { label: 'SKIPPED', color: '#c0392b' },
}
</script>

<template>
  <div class="practice-section">
    <!-- ───────── 교재 원본 (p.106) ───────── -->
    <h2>v-model 양방향 데이터 바인딩</h2>

    <h3>1) v-model 축약 문법 (양방향)</h3>
    <input type="text" v-model="text1" placeholder="여기에 입력하세요" />
    <p>
      입력된 값: <strong>{{ text1 }}</strong>
    </p>

    <h3>2) v-model의 내부 작동 원리 (단방향 + 이벤트)</h3>
    <input
      type="text"
      :value="text2"
      @input="(e) => (text2 = e.target.value)"
      placeholder="원리 파악용 입력창"
    />
    <p>
      입력된 값: <strong>{{ text2 }}</strong>
    </p>

    <hr class="divider" />

    <!-- ───────── 🔧 개인 응용 ───────── -->
    <section class="custom">
      <h3>🔧 개인 응용 : v-model 은 정말 <code>:value</code> + <code>@input</code> 인가?</h3>
      <p class="desc">
        교재 p.106은 두 방식이 같다고 설명한다. 위의 두 입력창에 <strong>영어</strong>를 치면 실제로
        똑같다. 그런데 <strong>한글</strong>을 쳐 보면 결과가 갈린다. 아래 입력창 하나에
        <code>input</code> · <code>compositionstart</code> · <code>compositionend</code> 를 전부
        걸어 두고, 같은 타이핑에 대해 두 방식이 어떻게 달라지는지 동시에 관측한다.
      </p>

      <div class="ime-input-row">
        <input
          type="text"
          class="ime-input"
          placeholder="여기에 '한글' 이라고 쳐 보세요"
          @input="onInput"
          @compositionstart="onCompositionStart"
          @compositionend="onCompositionEnd"
        />
        <span class="badge" :class="isComposing ? 'on' : 'off'">
          {{ isComposing ? '조합 중 (composing = true)' : '대기 (composing = false)' }}
        </span>
        <button class="reset" @click="resetIme">초기화</button>
      </div>

      <div class="compare" :class="{ diverged: isDiverged }">
        <div class="compare-col">
          <h4>① 교재 방식 <code>:value</code> + <code>@input</code></h4>
          <p class="val">"{{ manualValue }}"</p>
          <p class="meta">
            글자 수 <strong>{{ manualValue.length }}</strong> · input 이벤트
            <strong>{{ inputCount }}</strong> 회 모두 반영
          </p>
        </div>
        <div class="compare-col">
          <h4>② 실제 <code>v-model</code> (조합 가드 있음)</h4>
          <p class="val">"{{ modelValue }}"</p>
          <p class="meta">
            글자 수 <strong>{{ modelValue.length }}</strong> ·
            <strong class="skip-n">{{ skippedCount }}</strong> 회는 조합 중이라 무시됨
          </p>
        </div>
      </div>
      <p v-if="isDiverged" class="diverge-msg">
        ⚡ 지금 두 값이 서로 다릅니다 — 조합이 끝나지 않은 글자가 ①에만 들어가 있습니다.
      </p>

      <h4>이벤트 로그 (최근 12건)</h4>
      <ul class="log-list">
        <li v-for="entry in imeLogs" :key="entry.id">
          <span class="log-badge" :style="{ backgroundColor: logStyle[entry.type].color }">
            {{ logStyle[entry.type].label }}
          </span>
          <span class="log-msg">{{ entry.detail }}</span>
        </li>
        <li v-if="imeLogs.length === 0" class="log-empty">
          한글을 입력하면 이벤트가 기록됩니다. (영어만 치면 skip 로그가 안 나옵니다)
        </li>
      </ul>

      <p class="hint">
        💡 <strong>알게 된 점</strong> — <code>v-model</code>은 단순한 축약이 아니다.
        <code>@vue/runtime-dom</code> 의 <code>vModelText</code> 안에는
        <code>if (e.target.composing) return</code> 이라는 한 줄이 더 있다. 한글은 자음·모음이
        조합되는 동안에도 <code>input</code> 이벤트가 계속 발생하는데, 이때 상태를 갱신하면 Vue가
        입력창을 다시 그리면서 <strong>조합 중인 글자가 깨진다.</strong> 그래서 v-model은 조합이
        끝날 때까지 기다린다.
      </p>
      <p class="hint warn">
        ⚠️ 반대로 <strong>검색어 자동완성</strong>처럼 조합 중인 글자까지 실시간으로 받아야 하는
        기능은 <code>v-model</code>로는 만들 수 없다. 교재 p.116 Hands-on 요구사항 3번이 굳이
        <code>:value</code> + <code>@input</code> 으로 한글 검색을 만들라고 한 이유가 이것이다.
      </p>
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
  line-height: 1.7;
}
.ime-input-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 15px 0;
}
.ime-input {
  flex: 1 1 260px;
  padding: 8px 10px;
  font-size: 15px;
  border: 2px solid #42b883;
  border-radius: 6px;
}
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.badge.on {
  background-color: #8e44ad;
}
.badge.off {
  background-color: #95a5a6;
}
.reset {
  margin-left: auto;
}
.compare {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f4f6f7;
  transition: background-color 0.2s;
}
.compare.diverged {
  background-color: #fdf3e3;
}
.compare-col {
  flex: 1 1 240px;
}
.compare-col h4 {
  margin: 0 0 6px;
  font-size: 14px;
}
.val {
  margin: 0;
  padding: 8px 10px;
  min-height: 38px;
  background-color: #fff;
  border-radius: 4px;
  font-size: 17px;
  font-family: monospace;
  word-break: break-all;
}
.meta {
  margin: 6px 0 0;
  font-size: 12px;
  color: #666;
}
.skip-n {
  color: #c0392b;
}
.diverge-msg {
  margin: 8px 0 0;
  font-size: 13px;
  font-weight: bold;
  color: #d35400;
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
  padding: 3px 0;
  font-size: 13px;
  color: #ecf0f1;
}
.log-badge {
  flex: 0 0 auto;
  min-width: 90px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  color: #fff;
}
.log-msg {
  flex: 1;
}
.log-empty {
  justify-content: center;
  color: #95a5a6;
}
.hint {
  margin-top: 12px;
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.8;
}
.hint.warn {
  background-color: #fdedec;
  border-left-color: #e74c3c;
}
</style>
