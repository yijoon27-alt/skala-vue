<script setup>
import { ref } from 'vue'

/* ─────────────────────────────────────────────
 * 교재 원본 (p.100) — 이벤트 객체를 받는 2가지 패턴
 *  ① @click="fn"              → 첫 번째 인자로 이벤트 객체가 묵시적 전달
 *  ② @click="fn('값', $event)" → $event를 명시적으로 넘김
 * ───────────────────────────────────────────── */
const position = ref('')
const tagName = ref('')

const getOnlyEvent = (e) => {
  position.value = `좌표: X=${e.clientX}, Y=${e.clientY}`
}
const getWithParam = (name, e) => {
  tagName.value = `대상: ${name} / 클릭된 태그: ${e.target.tagName}`
}

/* ─────────────────────────────────────────────
 * 🔧 개인 응용 — p.97 속성표를 실제로 관측하기
 * 교재는 이벤트 객체 속성을 표로 12개나 정리해 두고서
 * 예제에서는 clientX / clientY / target.tagName 3개만 써 본다.
 * 나머지 속성이 어떻게 다른지 실시간으로 비교한다.
 * ───────────────────────────────────────────── */

// 1) 좌표 3종 비교 (client / page / screen)
const coords = ref(null)
const onMouseMove = (e) => {
  coords.value = {
    client: `${e.clientX}, ${e.clientY}`,
    page: `${e.pageX}, ${e.pageY}`,
    screen: `${e.screenX}, ${e.screenY}`,
  }
}

// 2) target vs currentTarget — 부모에 리스너를 걸었을 때의 차이
const targetInfo = ref(null)
const onParentClick = (e) => {
  targetInfo.value = {
    target: e.target.tagName,
    currentTarget: e.currentTarget.tagName,
    type: e.type,
    same: e.target === e.currentTarget,
  }
}

// 3) 키보드 — e.key vs e.code, 조합키 상태
const keyInfo = ref(null)
const onKeyDown = (e) => {
  keyInfo.value = {
    key: e.key,
    code: e.code,
    shift: e.shiftKey,
    ctrl: e.ctrlKey,
    alt: e.altKey,
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 객체($event) 활용</h2>

    <!-- 교재 원본 (p.100) -->
    <p>좌표: {{ position }}</p>
    <p>태그: {{ tagName }}</p>
    <button @click="getOnlyEvent">클릭 좌표 알아내기</button>
    <button @click="getWithParam('회원A', $event)">회원 정보와 태그 확인</button>

    <hr class="divider" />

    <!-- 🔧 개인 응용 -->
    <section class="custom">
      <h3>🔧 개인 응용 : 이벤트 객체 속성 실시간 관측기</h3>
      <p class="desc">
        교재 p.97은 이벤트 객체 속성을 12개나 표로 정리하지만, 예제에서 실제로 써 보는 건
        <code>clientX</code> / <code>clientY</code> / <code>target.tagName</code> 3개뿐이다.
        나머지가 서로 어떻게 다른지 직접 확인한다.
      </p>

      <h4>1) 좌표 3종 비교 — client vs page vs screen</h4>
      <div class="move-box" @mousemove="onMouseMove">이 박스 안에서 마우스를 움직여 보세요</div>
      <table v-if="coords" class="info-table">
        <tbody>
          <tr>
            <th>e.clientX / clientY</th>
            <td>{{ coords.client }}</td>
            <td class="memo">브라우저 표시 영역 기준 (스크롤해도 안 변함)</td>
          </tr>
          <tr>
            <th>e.pageX / pageY</th>
            <td>{{ coords.page }}</td>
            <td class="memo">문서 전체 기준 (스크롤한 만큼 더해짐)</td>
          </tr>
          <tr>
            <th>e.screenX / screenY</th>
            <td>{{ coords.screen }}</td>
            <td class="memo">모니터 화면 기준 (브라우저 창 위치까지 포함)</td>
          </tr>
        </tbody>
      </table>
      <p class="hint">
        💡 페이지를 <strong>스크롤한 뒤</strong> 다시 움직여 보면 client와 page가 벌어진다. 이
        차이를 모르고 쓰면 스크롤된 페이지에서 툴팁 위치가 어긋나는 버그가 생긴다.
      </p>

      <h4>2) e.target vs e.currentTarget</h4>
      <div class="parent-box" @click="onParentClick">
        <p>부모 DIV (리스너가 걸린 곳)</p>
        <button>자식 버튼을 눌러보세요</button>
        <span class="chip">자식 SPAN</span>
      </div>
      <table v-if="targetInfo" class="info-table">
        <tbody>
          <tr>
            <th>e.target</th>
            <td>&lt;{{ targetInfo.target }}&gt;</td>
            <td class="memo">실제로 클릭한 태그</td>
          </tr>
          <tr>
            <th>e.currentTarget</th>
            <td>&lt;{{ targetInfo.currentTarget }}&gt;</td>
            <td class="memo">리스너가 걸려 있는 태그 (항상 DIV)</td>
          </tr>
          <tr>
            <th>e.type</th>
            <td>{{ targetInfo.type }}</td>
            <td class="memo">발생한 이벤트 종류</td>
          </tr>
          <tr>
            <th>둘이 같은가?</th>
            <td>
              <strong :class="targetInfo.same ? 'ok' : 'no'">
                {{ targetInfo.same ? '같음' : '다름' }}
              </strong>
            </td>
            <td class="memo">부모 영역을 직접 클릭했을 때만 같아진다</td>
          </tr>
        </tbody>
      </table>

      <h4>3) 키보드 — e.key vs e.code, 조합키</h4>
      <input
        class="key-input"
        placeholder="아무 키나 눌러보세요 (Shift+A 처럼 조합키도)"
        @keydown="onKeyDown"
      />
      <table v-if="keyInfo" class="info-table">
        <tbody>
          <tr>
            <th>e.key</th>
            <td>{{ keyInfo.key }}</td>
            <td class="memo">실제 입력된 문자 (Shift+a 는 "A")</td>
          </tr>
          <tr>
            <th>e.code</th>
            <td>{{ keyInfo.code }}</td>
            <td class="memo">물리적 자판 위치 (Shift와 무관하게 "KeyA")</td>
          </tr>
          <tr>
            <th>조합키</th>
            <td>
              <span v-if="keyInfo.shift" class="chip on">Shift</span>
              <span v-if="keyInfo.ctrl" class="chip on">Ctrl</span>
              <span v-if="keyInfo.alt" class="chip on">Alt</span>
              <span v-if="!keyInfo.shift && !keyInfo.ctrl && !keyInfo.alt">없음</span>
            </td>
            <td class="memo">shiftKey / ctrlKey / altKey</td>
          </tr>
        </tbody>
      </table>
      <p class="hint">
        💡 <code>Shift + a</code>를 눌러보면 <code>key</code>는 "A", <code>code</code>는 "KeyA"다.
        <strong>입력값이 필요하면 key, 단축키를 만들려면 code</strong>를 쓴다. code는 자판 위치라서
        한글 모드에서도 값이 변하지 않기 때문이다.
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
.move-box {
  padding: 30px;
  background-color: #eef7f3;
  border: 2px dashed #42b883;
  border-radius: 6px;
  text-align: center;
  cursor: crosshair;
}
.parent-box {
  padding: 20px;
  background-color: #eee;
  border: 2px solid #999;
  border-radius: 6px;
}
.parent-box p {
  margin-top: 0;
}
.key-input {
  width: 100%;
  max-width: 380px;
}
.info-table {
  border-collapse: collapse;
  width: 100%;
  max-width: 620px;
  margin: 10px 0;
}
.info-table th,
.info-table td {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
  font-size: 14px;
}
.info-table th {
  width: 150px;
  background-color: #f5f5f5;
  font-family: monospace;
}
.memo {
  color: #777;
  font-size: 13px;
}
.chip {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 4px;
  border-radius: 10px;
  background-color: #ddd;
  font-size: 12px;
}
.chip.on {
  background-color: #42b883;
  color: white;
  font-weight: bold;
}
.ok {
  color: #27ae60;
}
.no {
  color: #e74c3c;
}
.hint {
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #f1c40f;
  font-size: 13px;
  line-height: 1.7;
}
</style>
