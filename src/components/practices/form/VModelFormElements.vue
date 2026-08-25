<script setup>
import { ref, computed } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.107~109) — Form 요소별 v-model 매핑
 * ───────────────────────────────────────────── */
const comment = ref('')
const isAgreed = ref(false) // 단일 체크박스는 Boolean
const favoriteFruits = ref([]) // 다중 체크박스는 반드시 배열([])로 시작!
const gender = ref('')
const selectedCar = ref('')

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — 교재 p.107 표가 다루지 않는 4가지
 *
 * 교재 p.107 표는 Form 태그 5종의 "ref 초기값 타입"만 정리해 두고,
 *   - value 속성을 빠뜨리면 어떻게 되는지
 *   - 체크박스가 true/false 말고 다른 값을 담을 수 있는지
 *   - select 에 여러 개를 고르거나 객체를 담을 수 있는지
 * 는 다루지 않는다. 실무 폼에서 바로 부딪히는 것들이라 직접 확인한다.
 * ───────────────────────────────────────────── */

/* ① value 속성 누락 버그 — 표는 "value 속성 값이 배열에 쌓임"이라 했지만
 *    value 를 안 쓰면 Vue 내부의 두 코드 경로가 서로 다른 값을 본다.
 *      · change 핸들러 : getValue(el)      → el.value  = "on" (브라우저 기본값)
 *      · setChecked()  : vnode.props.value → undefined
 *    배열에 "on" 을 넣어 놓고 undefined 를 찾으니, 체크하자마자 Vue가 도로 꺼 버린다. */
const buggyPicks = ref([])
const correctPicks = ref([])

/* ② true-value / false-value — 표는 단일 체크박스를 Boolean 이라 단정하지만
 *    실제 API는 'Y'/'N' 이나 1/0 을 요구하는 경우가 훨씬 많다. */
const marketingYN = ref('N')
const pushFlag = ref(0)

/* ③ select multiple + 객체 바인딩 — 표에 아예 없는 두 가지 */
const skills = ref([]) // multiple 은 배열로 받는다
const planList = [
  { code: 'basic', name: 'Basic', price: 0 },
  { code: 'pro', name: 'Pro', price: 9900 },
  { code: 'team', name: 'Team', price: 29000 },
]
const selectedPlan = ref(null) // 문자열이 아니라 객체가 통째로 담긴다

/* ④ 서버로 실제 전송될 페이로드 미리보기 */
const payload = computed(() => ({
  comment: comment.value,
  isAgreed: isAgreed.value,
  favoriteFruits: favoriteFruits.value,
  gender: gender.value,
  selectedCar: selectedCar.value,
  marketingYN: marketingYN.value,
  pushFlag: pushFlag.value,
  skills: skills.value,
  planCode: selectedPlan.value?.code ?? null,
  planPrice: selectedPlan.value?.price ?? null,
}))
</script>

<template>
  <div class="practice-section">
    <!-- ───────── 교재 원본 (p.108~109) ───────── -->
    <h2>모든 HTML Form 요소와 v-model 매핑</h2>

    <div>
      <h3>1) Textarea (장문 텍스트)</h3>
      <textarea v-model="comment" placeholder="의견을 남겨주세요"></textarea>
      <p>
        데이터 상태: <span>{{ comment }}</span>
      </p>
    </div>

    <div>
      <h3>2) 단일 Checkbox (동의 여부)</h3>
      <label> <input type="checkbox" v-model="isAgreed" /> 약관에 동의합니다. </label>
      <p>
        데이터 상태: <span>{{ isAgreed }}</span>
      </p>
    </div>

    <div>
      <h3>3) 다중 Checkbox (복수 선택 -&gt; 배열에 저장)</h3>
      <label><input type="checkbox" value="사과" v-model="favoriteFruits" /> 사과</label> &nbsp;
      <label><input type="checkbox" value="바나나" v-model="favoriteFruits" /> 바나나</label> &nbsp;
      <label><input type="checkbox" value="딸기" v-model="favoriteFruits" /> 딸기</label>
      <p>
        데이터 상태 (배열): <span>{{ favoriteFruits }}</span>
      </p>
    </div>

    <div>
      <h3>4) Radio (단일 선택)</h3>
      <label><input type="radio" value="남성" v-model="gender" /> 남성</label> &nbsp;
      <label><input type="radio" value="여성" v-model="gender" /> 여성</label>
      <p>
        데이터 상태: <span>{{ gender }}</span>
      </p>
    </div>

    <div>
      <h3>5) Select (드롭다운 선택)</h3>
      <select v-model="selectedCar">
        <option value="">-- 선택하세요 --</option>
        <option value="tesla">테슬라</option>
        <option value="hyundai">현대자동차</option>
        <option value="bmw">BMW</option>
      </select>
      <p>
        데이터 상태: <span>{{ selectedCar }}</span>
      </p>
    </div>

    <hr class="divider" />

    <!-- ───────── 🔧 개인 응용 ───────── -->
    <section class="custom">
      <h3>🔧 개인 응용 : 교재 p.107 표가 다루지 않는 4가지</h3>
      <p class="desc">
        p.107 표는 Form 태그 5종의 <strong>ref 초기값 타입</strong>만 정리한다. 실무 폼을 만들면
        바로 부딪히는 아래 네 가지는 표에도 예제에도 없어서 직접 확인해 봤다.
      </p>

      <!-- ① -->
      <h4>① <code>value</code> 속성을 빠뜨린 다중 체크박스 — 3개가 서로를 지운다</h4>
      <div class="side-by-side">
        <div class="demo-box danger">
          <strong>❌ value 없음</strong>
          <div class="checks">
            <label><input type="checkbox" v-model="buggyPicks" /> 사과</label>
            <label><input type="checkbox" v-model="buggyPicks" /> 바나나</label>
            <label><input type="checkbox" v-model="buggyPicks" /> 딸기</label>
          </div>
          <p class="state">{{ buggyPicks }}</p>
          <p class="note">
            체크해도 표시가 도로 꺼진다 · 셋 다 눌러도 데이터는 <code>["on"]</code> 하나
          </p>
        </div>
        <div class="demo-box safe">
          <strong>✅ value 있음</strong>
          <div class="checks">
            <label><input type="checkbox" value="사과" v-model="correctPicks" /> 사과</label>
            <label><input type="checkbox" value="바나나" v-model="correctPicks" /> 바나나</label>
            <label><input type="checkbox" value="딸기" v-model="correctPicks" /> 딸기</label>
          </div>
          <p class="state">{{ correctPicks }}</p>
          <p class="note">체크한 순서대로 배열에 쌓인다</p>
        </div>
      </div>
      <p class="hint">
        💡 원인을 <code>@vue/runtime-dom</code> 의 <code>vModelCheckbox</code> 에서 찾았다. 값을
        <strong>넣을 때</strong>와 체크 표시를 <strong>되돌릴 때</strong> 서로 다른 곳을 본다.
      </p>
      <pre class="src">
// ① change 핸들러 — 배열에 넣는 값
const elementValue = getValue(el)   // el.value → "on" (브라우저 기본값)
assign(modelValue.concat(elementValue))

// ② setChecked() — 체크 표시를 되돌릴 때 찾는 값
checked = looseIndexOf(value, vnode.props.value) &gt; -1
//                            ^^^^^^^^^^^^^^^^^ value 속성이 없으면 undefined</pre
      >
      <p class="hint warn">
        ⚠️ 배열에는 <code>"on"</code> 을 넣어 놓고 <code>undefined</code> 를 찾으니 항상
        <code>-1</code> 이다. 그래서 <strong>체크하는 순간 Vue가 표시를 도로 꺼 버린다.</strong> 더
        나쁜 건 두 번째 체크박스부터다 — 배열에 <code>"on"</code> 이 이미 있어서 상태가 안 바뀌고,
        상태가 안 바뀌니 리렌더도 안 일어나 <strong>체크 표시만 켜진 채로 남는다.</strong> 결국
        화면과 데이터가 완전히 따로 논다. 순수 HTML 폼에서는 <code>name</code> 별로 전송돼 티도 안
        나던 실수인데, v-model 배열에서는 곧바로 데이터 손실이 된다.
      </p>

      <!-- ② -->
      <h4>
        ② <code>true-value</code> / <code>false-value</code> — 체크박스가 Boolean이 아니어도 된다
      </h4>
      <div class="demo-box plain">
        <label>
          <input type="checkbox" v-model="marketingYN" true-value="Y" false-value="N" />
          마케팅 수신 동의 (서버가 'Y'/'N' 을 요구하는 경우)
        </label>
        <p class="state">marketingYN = "{{ marketingYN }}" ({{ typeof marketingYN }})</p>
        <label>
          <input type="checkbox" v-model="pushFlag" :true-value="1" :false-value="0" />
          푸시 알림 (서버가 1/0 을 요구하는 경우)
        </label>
        <p class="state">pushFlag = {{ pushFlag }} ({{ typeof pushFlag }})</p>
      </div>
      <p class="hint">
        💡 p.107 표는 단일 체크박스를 <code>ref(false)</code> Boolean 으로 못박지만, 실제로는
        <code>true-value</code> / <code>false-value</code> 로 <strong>아무 값이나</strong> 담을 수
        있다. 숫자·객체를 넣으려면 <code>:true-value="1"</code> 처럼 <strong>v-bind</strong>를 써야
        한다. 안 그러면 문자열 <code>"1"</code> 이 들어간다.
      </p>

      <!-- ③ -->
      <h4>③ <code>select multiple</code> 과 객체 바인딩 — 표에 없는 두 가지</h4>
      <div class="side-by-side">
        <div class="demo-box plain">
          <strong>multiple → 배열</strong>
          <select v-model="skills" multiple size="4">
            <option value="vue">Vue</option>
            <option value="react">React</option>
            <option value="spring">Spring</option>
            <option value="sql">SQL</option>
          </select>
          <p class="note">Ctrl(⌘) + 클릭으로 여러 개 선택</p>
          <p class="state">{{ skills }}</p>
        </div>
        <div class="demo-box plain">
          <strong>:value 로 객체 통째로</strong>
          <select v-model="selectedPlan">
            <option :value="null">-- 요금제 선택 --</option>
            <option v-for="plan in planList" :key="plan.code" :value="plan">
              {{ plan.name }}
            </option>
          </select>
          <p class="state">{{ selectedPlan ?? 'null' }}</p>
          <p v-if="selectedPlan" class="note">
            월 {{ selectedPlan.price.toLocaleString() }}원 — 문자열 code 를 다시 찾을 필요가 없다
          </p>
        </div>
      </div>
      <p class="hint">
        💡 <code>value="tesla"</code> 처럼 <strong>문자열</strong>을 쓰면 선택 후에 원본 객체를 다시
        <code>find()</code> 로 찾아와야 한다. <code>:value="plan"</code> 으로
        <strong>객체를 그대로</strong> 바인딩하면 그 과정이 사라진다. 대신 초기값을
        <code>ref('')</code> 가 아니라 <code>ref(null)</code> 로 두어야 "선택 안 함"과 타입이
        맞는다.
      </p>

      <!-- ④ -->
      <h4>④ 서버로 전송될 페이로드 실시간 미리보기</h4>
      <pre class="payload">{{ JSON.stringify(payload, null, 2) }}</pre>
      <p class="hint">
        💡 v-model을 하나씩 보면 그냥 값이지만, 모아 놓고 보면 <strong>API 요청 본문</strong> 그
        자체다. 타입이 어긋난 필드(체크박스가 <code>"on"</code>, 숫자가 문자열)를 이 단계에서
        잡아내는 습관을 들이려고 만들었다.
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
.side-by-side {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}
.demo-box {
  flex: 1 1 250px;
  padding: 14px;
  border-radius: 6px;
}
.demo-box.safe {
  border: 2px solid #42b883;
  background-color: #eafaf3;
}
.demo-box.danger {
  border: 2px solid #e74c3c;
  background-color: #fdedec;
}
.demo-box.plain {
  border: 2px solid #bdc3c7;
  background-color: #f8f9f9;
}
.checks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 8px 0;
}
.state {
  margin: 8px 0 4px;
  padding: 6px 8px;
  background-color: #2c3e50;
  border-radius: 4px;
  color: #ecf0f1;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
}
.note {
  margin: 4px 0 0;
  font-size: 12px;
  color: #666;
}
.src {
  margin: 10px 0;
  padding: 12px;
  background-color: #2c3e50;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}
.payload {
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
.hint.warn {
  background-color: #fdedec;
  border-left-color: #e74c3c;
}
</style>
