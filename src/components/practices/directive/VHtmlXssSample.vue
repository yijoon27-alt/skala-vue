<script setup>
import { ref } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.75) — v-html의 XSS 취약점 재현
 * ───────────────────────────────────────────── */
const inputValue = ref('')
const message = ref('')

function showMessage() {
  message.value = inputValue.value
}

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — "그래서 어떻게 막는데?"
 * 교재는 v-html이 위험하다는 것까지만 보여주고 대책은 다루지 않는다.
 * 정제(sanitize) 로직을 직접 구현해 [원본 vs 정제 후]를 나란히 비교한다.
 * ───────────────────────────────────────────── */

// 통째로 걷어낼 위험 태그
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base', 'form']

// 클릭 한 번으로 공격을 재현해 볼 수 있는 대표 페이로드
const payloads = [
  {
    id: 'onerror',
    label: '① img onerror (가장 흔한 수법)',
    code: `<img src="x" onerror="this.replaceWith('☠️ XSS 코드가 실행되었습니다!')" />`,
  },
  {
    id: 'jsurl',
    label: '② javascript: 링크',
    code: `<a href="javascript:document.title='해킹됨'">눌러보세요</a>`,
  },
  {
    id: 'script',
    label: '③ script 태그 (실행 안 됨)',
    code: `<script>document.title = '해킹됨'<\/script>`,
  },
]

const attackInput = ref('')
const rawOutput = ref('')
const safeOutput = ref('')
const removedLog = ref([])
const isSubmitted = ref(false)

/**
 * 문자열을 실제 DOM으로 파싱한 뒤 위험 요소만 제거하고 다시 문자열로 되돌린다.
 * DOMParser로 만든 문서는 화면에 붙지 않으므로 파싱 과정에서 코드가 실행되지 않는다.
 */
function sanitize(dirty) {
  const removed = []
  const doc = new DOMParser().parseFromString(dirty, 'text/html')

  // 1) 위험 태그 자체를 제거
  doc.body.querySelectorAll(DANGEROUS_TAGS.join(',')).forEach((el) => {
    removed.push(`<${el.tagName.toLowerCase()}> 태그를 통째로 제거`)
    el.remove()
  })

  // 2) 남은 태그에서 이벤트 핸들러 속성(on*)과 javascript: URL을 제거
  doc.body.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toLowerCase()
    // 순회 도중 속성을 지우므로 배열로 복사해 두고 돈다
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const value = attr.value.replace(/\s/g, '').toLowerCase()

      if (name.startsWith('on')) {
        removed.push(`<${tag}>의 ${attr.name}="..." 이벤트 속성을 제거`)
        el.removeAttribute(attr.name)
      } else if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
        removed.push(`<${tag}>의 ${attr.name}="javascript:..." 를 차단`)
        el.removeAttribute(attr.name)
      }
    }
  })

  return { html: doc.body.innerHTML, removed }
}

function runComparison() {
  rawOutput.value = attackInput.value
  const result = sanitize(attackInput.value)
  safeOutput.value = result.html
  removedLog.value = result.removed
  isSubmitted.value = true
}

function usePayload(code) {
  attackInput.value = code
  runComparison()
}

function reset() {
  attackInput.value = ''
  rawOutput.value = ''
  safeOutput.value = ''
  removedLog.value = []
  isSubmitted.value = false
  document.title = 'skala-vue'
}
</script>

<template>
  <div class="practice-section">
    <h2>v-html XSS 학습</h2>

    <!-- 교재 원본 (p.75) -->
    <input v-model="inputValue" placeholder="내용을 입력하세요" />
    <button @click="showMessage">확인</button>
    <div v-html="message"></div>

    <hr class="divider" />

    <!-- 🔧 개인 응용 -->
    <section class="custom">
      <h3>🔧 개인 응용 : sanitize로 XSS 막기</h3>
      <p class="desc">
        교재는 v-html이 뚫린다는 것까지만 보여준다. 같은 입력을
        <strong>정제 없이</strong> 넣었을 때와 <strong>정제 후</strong> 넣었을 때를 나란히 비교한다.
      </p>

      <h4>1) 공격 문자열 골라보기</h4>
      <div class="payload-buttons">
        <button v-for="p in payloads" :key="p.id" @click="usePayload(p.code)">
          {{ p.label }}
        </button>
      </div>

      <h4>2) 직접 입력해보기</h4>
      <input v-model="attackInput" class="attack-input" placeholder="HTML을 입력해 보세요" />
      <button @click="runComparison">비교 실행</button>
      <button @click="reset">초기화</button>

      <template v-if="isSubmitted">
        <div class="compare">
          <div class="panel danger">
            <h4>❌ 정제 없이 v-html</h4>
            <div class="output" v-html="rawOutput"></div>
          </div>
          <div class="panel safe">
            <h4>✅ sanitize 후 v-html</h4>
            <div class="output" v-html="safeOutput"></div>
          </div>
        </div>

        <h4>3) sanitize가 걷어낸 것</h4>
        <ul v-if="removedLog.length" class="removed">
          <li v-for="(log, index) in removedLog" :key="index">{{ log }}</li>
        </ul>
        <p v-else class="none">제거된 항목이 없습니다. (위험 요소가 없는 안전한 입력)</p>
      </template>

      <p class="note">
        💡 ③번 <code>&lt;script&gt;</code>는 정제 없이도 실행되지 않는다. v-html은 내부적으로
        <code>innerHTML</code>을 쓰는데, 이렇게 삽입된 script 태그는 브라우저 명세상 실행되지 않기
        때문이다. 공격자가 굳이 <code>onerror</code> 같은 이벤트 속성을 파고드는 이유가 이것이다.
        <br />
        💡 실무에서는 직접 구현하지 않고 <strong>DOMPurify</strong> 같은 검증된 라이브러리를 쓴다.
        가장 확실한 방어는 <strong>v-html을 안 쓰는 것</strong>이다.
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
}
.payload-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.attack-input {
  width: 100%;
  max-width: 460px;
  margin-bottom: 8px;
}
.compare {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin: 15px 0;
}
.panel {
  flex: 1 1 260px;
  border-radius: 6px;
  padding: 12px;
}
.panel h4 {
  margin: 0 0 8px;
}
.panel.danger {
  border: 2px solid #e74c3c;
  background-color: #fdedec;
}
.panel.safe {
  border: 2px solid #42b883;
  background-color: #eafaf3;
}
.output {
  min-height: 40px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  word-break: break-all;
}
.removed li {
  color: #c0392b;
  font-size: 14px;
}
.none {
  color: #777;
  font-size: 14px;
}
.note {
  margin-top: 15px;
  padding: 12px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.7;
}
</style>
