<script setup>
import { ref, computed } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.111~112) — v-model 수식어
 * ───────────────────────────────────────────── */
const lazyText = ref('')
const age = ref('')
const userEmail = ref('')
const price = ref('')

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — "Number 타입으로 자동 형변환" 이라는 한 줄의 함정
 *
 * 교재 p.110 표는 `.number` 를 "Number 타입으로 자동 형변환" 이라고만 적어 두었다.
 * 그런데 실제 Vue 소스(@vue/shared)를 열어 보면 쓰이는 함수는 Number() 가 아니라
 *
 *   const looseToNumber = (val) => {
 *     const n = parseFloat(val)
 *     return isNaN(n) ? val : n      // ← 실패하면 "원본 문자열"이 그대로 남는다
 *   }
 *
 * 즉 `.number` 는
 *   1) parseFloat 이라서 "12abc" 를 12 로 조용히 통과시키고
 *   2) 변환에 실패하면 number 가 아니라 string 이 담긴다
 * 두 가지 함정을 동시에 갖고 있다. 검증 없이 서버로 보내면 그대로 사고다.
 * ───────────────────────────────────────────── */

// Vue 내부 looseToNumber 를 그대로 재현 (@vue/shared)
const looseToNumber = (val) => {
  const n = parseFloat(val)
  return Number.isNaN(n) ? val : n
}

const testCases = ['', '  ', '42', '0012', '12abc', 'abc', '1e3', ' 42 ', '1.50', '3.14.15', '0x10']
const conversionTable = computed(() =>
  testCases.map((raw) => {
    const loose = looseToNumber(raw)
    const strict = Number(raw)
    return {
      raw,
      loose,
      looseType: typeof loose,
      strict: Number.isNaN(strict) ? 'NaN' : strict,
      // parseFloat 결과와 Number() 결과가 어긋나면 "교재 설명과 다르게 동작하는" 케이스
      mismatch: !(typeof loose === 'number' && !Number.isNaN(strict) && loose === strict),
    }
  }),
)

// A) .number 직접 입력 관측
const numberProbe = ref('')

// B) input type="number" 는 .number 없이도 숫자가 된다
const plainNumberInput = ref('')

// C) .trim 은 "양끝"만 — 가운데 공백은 그대로
const trimProbe = ref('')
const visibleSpaces = computed(() => trimProbe.value.replace(/ /g, '␣'))
const innerSpaceCount = computed(() => (trimProbe.value.match(/ /g) || []).length)

// D) .lazy 와 한글 조합
const lazyKorean = ref('')
const eagerKorean = ref('')
</script>

<template>
  <div class="practice-section">
    <!-- ───────── 교재 원본 (p.111~112) ───────── -->
    <h2>v-model 수식어 (Modifiers) 활용</h2>

    <!-- 1) .lazy 수식어 실습 -->
    <section style="margin-bottom: 20px">
      <h3>1) .lazy 수식어 (change 이벤트 시점 반영)</h3>
      <input type="text" v-model.lazy="lazyText" placeholder="입력 후 Enter 또는 외부 클릭" />
      <p>
        실시간이 아닌 확정된 값: <strong>{{ lazyText }}</strong>
      </p>
    </section>

    <!-- 2) .number 수식어 실습 -->
    <section style="margin-bottom: 20px">
      <h3>2) .number 수식어 (Number 타입 자동 형변환)</h3>
      <input type="text" v-model.number="age" placeholder="나이를 입력하세요" />
      <p>
        입력된 값: <strong>{{ age }}</strong>
      </p>
      <p>
        데이터 타입: <strong>{{ typeof age }}</strong>
      </p>
    </section>

    <!-- 3) .trim 수식어 실습 -->
    <section>
      <h3>3) .trim 수식어 (양끝 공백 자동 제거)</h3>
      <input type="text" v-model.trim="userEmail" placeholder="앞뒤 공백을 포함해 입력해 보세요" />
      <p>
        공백 제거된 값: <strong>"{{ userEmail }}"</strong>
      </p>
      <p>
        문자열 길이: <strong>{{ userEmail.length }}</strong>
      </p>
    </section>

    <!-- 4) 수식어 체이닝 (Chaining) 실습 -->
    <section>
      <h3>4) Chaining (수식어 체이닝: .trim.number)</h3>
      <input
        type="text"
        v-model.trim.number="price"
        placeholder="공백과 숫자를 섞어 입력해 보세요"
      />
      <p>
        처리된 값: <strong>"{{ price }}"</strong>
      </p>
      <p>
        데이터 타입: <strong>{{ typeof price }}</strong>
      </p>
    </section>

    <hr class="divider" />

    <!-- ───────── 🔧 개인 응용 ───────── -->
    <section class="custom">
      <h3>🔧 개인 응용 : "Number 타입으로 자동 형변환" 이라는 한 줄의 함정</h3>
      <p class="desc">
        교재 p.110 표는 <code>.number</code> 를
        <strong>"Number 타입으로 자동 형변환"</strong> 이라고 한 줄로 정리한다. 그런데 Vue가 실제로
        쓰는 함수는 <code>Number()</code> 가 아니라 <code>parseFloat()</code> 기반의
        <code>looseToNumber()</code> 다. 이 차이 때문에
        <strong>변환이 실패해도 에러가 나지 않고, 타입이 조용히 string 으로 남는다.</strong>
      </p>
      <pre class="src">
// @vue/shared — .number 가 실제로 호출하는 함수
const looseToNumber = (val) =&gt; {
  const n = parseFloat(val)
  return isNaN(n) ? val : n   // ← 실패하면 원본 문자열이 그대로 반환된다
}</pre
      >

      <!-- A -->
      <h4>A) 직접 쳐 보기 — 타입이 입력에 따라 바뀐다</h4>
      <div class="probe">
        <input type="text" v-model.number="numberProbe" placeholder="12abc / abc / 0x10 …" />
        <span class="type-badge" :class="typeof numberProbe">
          typeof = {{ typeof numberProbe }}
        </span>
      </div>
      <p class="state">값: {{ JSON.stringify(numberProbe) }}</p>

      <h4>B) 변환 결과 대조표 — <code>looseToNumber()</code> vs <code>Number()</code></h4>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>입력 문자열</th>
              <th>.number 결과 (parseFloat)</th>
              <th>결과 타입</th>
              <th>Number() 였다면</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in conversionTable" :key="row.raw" :class="{ warn: row.mismatch }">
              <td class="mono">{{ JSON.stringify(row.raw) }}</td>
              <td class="mono">{{ JSON.stringify(row.loose) }}</td>
              <td>
                <span class="type-badge small" :class="row.looseType">{{ row.looseType }}</span>
              </td>
              <td class="mono dim">{{ row.strict }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="hint warn">
        ⚠️ 노란 줄이 <strong>교재 설명과 어긋나는 케이스</strong>다. <code>"12abc"</code> 는 에러
        없이 <code>12</code> 로 통과하고, <code>"abc"</code> 는 숫자가 아니라
        <strong>문자열 그대로</strong> 남는다. <code>""</code> 도 <code>0</code>이 아니라 빈
        문자열이다. 그래서 <code>.number</code> 를 썼다는 이유로 타입을 믿으면 안 되고, 서버로
        보내기 전에 <code>typeof</code> 검사를 따로 해야 한다.
      </p>

      <!-- C -->
      <h4>C) <code>&lt;input type="number"&gt;</code> 에는 <code>.number</code> 가 필요 없다</h4>
      <div class="probe">
        <input type="number" v-model="plainNumberInput" placeholder="수식어 없이 v-model 만" />
        <span class="type-badge" :class="typeof plainNumberInput">
          typeof = {{ typeof plainNumberInput }}
        </span>
      </div>
      <p class="hint">
        💡 Vue 소스의 <code>vModelText</code> 안에는
        <code>const castToNumber = number || vnode.props?.type === 'number'</code> 라는 줄이 있다.
        <strong><code>type="number"</code> 면 수식어 없이도 자동으로 숫자 변환이 걸린다.</strong>
        교재 p.110 표에는 없는 내용이라, <code>type="number" v-model.number</code> 처럼 중복해서
        쓰는 코드를 흔히 보게 된다.
      </p>

      <!-- D -->
      <h4>D) <code>.trim</code> 은 <strong>양끝만</strong> 지운다</h4>
      <div class="probe">
        <input type="text" v-model.trim="trimProbe" placeholder="앞  가운데  뒤   처럼 쳐 보세요" />
      </div>
      <p class="state">공백을 ␣ 로 표시: "{{ visibleSpaces }}"</p>
      <p class="state">
        남아 있는 공백 <strong>{{ innerSpaceCount }}</strong> 개 · 길이
        <strong>{{ trimProbe.length }}</strong>
      </p>
      <p class="hint">
        💡 p.110 표의 "양끝 공백 제거"는 정확한 설명이지만, 실제로 Validation 오류를 내는 건
        <strong>가운데에 두 번 들어간 공백</strong>인 경우가 많다. 그건 <code>.trim</code> 으로
        해결되지 않으므로 <code>replace(/\s+/g, ' ')</code> 같은 정규화를 따로 해야 한다.
      </p>

      <!-- E -->
      <h4>E) <code>.lazy</code> 는 한글 조합 가드를 <strong>끈다</strong></h4>
      <div class="side-by-side">
        <div class="demo-box">
          <strong>v-model (기본)</strong>
          <input type="text" v-model="eagerKorean" placeholder="한글을 쳐 보세요" />
          <p class="state">"{{ eagerKorean }}"</p>
          <p class="note">조합이 끝난 글자만 반영</p>
        </div>
        <div class="demo-box">
          <strong>v-model.lazy</strong>
          <input type="text" v-model.lazy="lazyKorean" placeholder="한글 입력 후 Tab" />
          <p class="state">"{{ lazyKorean }}"</p>
          <p class="note">포커스가 빠질 때 한 번만 반영</p>
        </div>
      </div>
      <p class="hint">
        💡 Vue 소스를 보면 조합 가드가
        <code>if (!lazy) { addEventListener(el, 'compositionstart', …) }</code> 안에 들어 있다.
        <code>.lazy</code> 는 <code>change</code> 이벤트를 쓰는데, <code>change</code> 는 어차피
        한글 조합이 다 끝난 뒤에 발생하므로
        <strong>가드 자체가 필요 없어서 등록하지 않는다.</strong> p.106 개인 응용에서 본
        <code>composing</code> 플래그와 이어지는 이야기다.
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
.custom h4 {
  margin-top: 22px;
}
.desc {
  color: #555;
  font-size: 14px;
  line-height: 1.7;
}
.src {
  padding: 12px;
  background-color: #2c3e50;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
.probe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}
.probe input {
  flex: 1 1 240px;
  padding: 8px 10px;
  font-size: 15px;
  border: 2px solid #42b883;
  border-radius: 6px;
}
.type-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  background-color: #95a5a6;
}
.type-badge.number {
  background-color: #2980b9;
}
.type-badge.string {
  background-color: #c0392b;
}
.type-badge.small {
  padding: 2px 8px;
  font-size: 11px;
}
.state {
  margin: 6px 0;
  padding: 6px 8px;
  background-color: #2c3e50;
  border-radius: 4px;
  color: #ecf0f1;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  padding: 6px 10px;
  border: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #ecf0f1;
}
tr.warn {
  background-color: #fff8e1;
}
.mono {
  font-family: monospace;
}
.dim {
  color: #888;
}
.side-by-side {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.demo-box {
  flex: 1 1 240px;
  padding: 14px;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  background-color: #f8f9f9;
}
.demo-box input {
  width: 100%;
  margin-top: 8px;
  padding: 6px 8px;
  box-sizing: border-box;
}
.note {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}
.hint {
  margin-top: 10px;
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
