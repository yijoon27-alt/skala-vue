# skala-vue

SK AX **Full-Stack Engineering / Frontend-framework: Vue.js** 과정 실습 저장소입니다.
교재 실습 예제를 따라 작성하고, 각 단원마다 **개인 응용(Customization)** 을 덧붙여 정리합니다.

- 교육생: 허이준
- 원본 소스: [bottletiger/skala-vue](https://github.com/bottletiger/skala-vue)
- 배포 주소: _(추후 등록)_

---

## 실행 방법

```sh
npm install     # 의존성 설치
npm run dev     # 개발 서버 실행
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 검사
```

## 프로젝트 구조

```
src/
├─ App.vue                    # 실습 컴포넌트를 갈아 끼우며 확인하는 진입점
├─ components/
│  └─ practices/              # 교재 실습 컴포넌트 모음
│     ├─ basic/               # Dev Setup (p.69~71)
│     ├─ directive/           # Vue Directive (p.74~92)
│     ├─ event/               # Vue Event Handling (p.94~105)
│     ├─ form/                # Form Data Binding (p.106~112)
│     ├─ style/               # Vue Style (p.113~114)
│     └─ handson/             # Hands on — Weather Mockup (p.116)
├─ assets/ · router/ · stores/ · views/
```

`App.vue` 상단의 import 주석을 풀고 `<template>` 태그를 함께 바꿔 실습을 확인합니다.

---

## 단원별 실습 기록

### 1. Vue Syntax — Dev Setup (p.69~71)

| 교재    | 실습 내용                                        | 파일                            |
| ------- | ------------------------------------------------ | ------------------------------- |
| p.69~70 | 반응형 데이터(Reactivity) — 일반 변수 vs `ref()` | `practices/basic/SampleOne.vue` |
| p.71    | Text Interpolation — 표현식 사용                 | `practices/basic/SampleTwo.vue` |

**Customization**

- `SampleTwo.vue` — 교재 코드의 사용하지 않는 `import { ref }` 구문을 제거했다.
  ESLint `no-unused-vars` 에 걸리는 코드라 실제로는 쓰지 않는 import를 남겨두지 않았다.

### 2. Vue Syntax — Vue Directive (p.74~92)

| 교재 | 실습 내용                               | 파일                                     |
| ---- | --------------------------------------- | ---------------------------------------- |
| p.74 | `v-html` — 문자열을 HTML로 해석         | `practices/directive/VHtmlSample.vue`    |
| p.75 | `v-html` 의 XSS 취약점                  | `practices/directive/VHtmlXssSample.vue` |
| p.76 | `v-text` — `innerText` 와 동일 동작     | `practices/directive/VTextSample.vue`    |
| p.77 | `v-bind` 기본 — href / src / disabled   | `practices/directive/VBindBasic.vue`     |
| p.79 | `v-bind` 클래스 바인딩 (객체 · 배열)    | `practices/directive/VBindClass.vue`     |
| p.81 | `v-bind` 스타일 바인딩 (객체 · 배열)    | `practices/directive/VBindStyle.vue`     |
| p.83 | `v-bind` same-name shorthand (Vue 3.4+) | `practices/directive/VBindShorthand.vue` |
| p.84 | `v-if` / `v-else-if` / `v-else`         | `practices/directive/VIfSample.vue`      |
| p.85 | `v-show` — CSS `display:none` 으로 숨김 | `practices/directive/VShowSample.vue`    |
| p.88 | `v-for` — 배열 · 객체 · 배열 내 객체    | `practices/directive/VForSample.vue`     |
| p.89 | `v-pre` — 컴파일 건너뛰기               | `practices/directive/VPreSample.vue`     |
| p.90 | `v-cloak` — 렌더링 전 깜빡임 방지       | `practices/directive/VCloakSample.vue`   |
| p.91 | `v-once` — 최초 1회만 렌더링            | `practices/directive/VOnceSample.vue`    |
| p.92 | `v-memo` — 지정 변수가 바뀔 때만 갱신   | `practices/directive/VMemoSample.vue`    |

#### Customization ① `VHtmlXssSample.vue` — sanitize로 XSS 막기

교재는 `v-html` 이 XSS에 뚫린다는 것까지만 보여주고 **대책은 다루지 않는다.**
직접 정제 로직을 구현해 **같은 입력을 [정제 없이] vs [정제 후] 나란히 렌더링**하도록 만들었다.

- `DOMParser` 로 문자열을 화면에 붙지 않는 문서로 파싱한 뒤 위험 요소만 제거한다.
  파싱 단계에서는 코드가 실행되지 않으므로 안전하게 검사할 수 있다.
  1. 위험 태그(`script`, `iframe`, `object`, `embed`, `link`, `meta`, `base`, `form`) 제거
  2. 모든 태그의 이벤트 핸들러 속성(`on*`) 제거
  3. `href` / `src` 의 `javascript:` URL 차단
- **sanitize가 걷어낸 항목을 목록으로 출력**해서 무엇이 왜 막혔는지 보이도록 했다.
- 클릭 한 번으로 공격을 재현하는 **페이로드 프리셋 버튼** 3종을 넣었다.
  교재의 페이로드는 `window.location.href` 로 다른 사이트로 튕겨버려 결과 확인이 어렵기 때문에,
  화면에 흔적을 남기는 비파괴 페이로드로 바꿨다.

> 📌 알게 된 점 — `<script>` 태그는 정제하지 않아도 실행되지 않는다.
> `v-html` 은 내부적으로 `innerHTML` 을 쓰는데, 이렇게 삽입된 script 태그는 브라우저 명세상
> 실행되지 않는다. 공격자가 굳이 `onerror` 같은 **이벤트 속성**을 파고드는 이유가 이것이다.

#### Customization ② `VForSample.vue` — 검색·정렬·합계 + `:key` 함정

**응용 1) 검색 · 정렬 · 합계**
교재는 배열을 그대로 뿌리기만 하지만, 실무에서 `v-for` 는 거의 항상 _가공된_ 배열을 그린다.
원본 `products` 배열은 건드리지 않고 화면에 그릴 배열만 `computed` 로 새로 만들었다.

- 상품명 검색 / 이름·가격 정렬 / 품절 상품 숨기기 / 합계 표시
- 정렬에 `toSorted()` 를 사용했다. 교재 p.19에서 다룬 ES14 메서드로,
  `sort()` 와 달리 **원본 배열을 변형하지 않고** 정렬된 새 배열을 돌려준다.
- `computed` 는 교재 p.117(Composition API)에서 다루지만, 파생 데이터를 다루는 데 적합해 미리 사용했다.

**응용 2) `:key` 를 index로 주면 생기는 실제 버그**
교재는 _"고유한 `:key` 를 안 주면 에러 또는 성능 저하가 발생한다"_ 고 경고만 한다.
**데이터가 실제로 깨지는 장면**을 눈으로 확인할 수 있게 만들었다.

- `:key="index"` 목록과 `:key="member.id"` 목록을 나란히 두고, 각 행에 입력창을 배치
- 양쪽에 메모를 입력한 뒤 **맨 앞에 새 항목을 끼워 넣으면**
  → `:key="index"` 쪽은 **입력한 메모가 엉뚱한 사람에게 달라붙는다**
  → `:key="member.id"` 쪽은 정상 유지

> 📌 알게 된 점 — 맨 앞에 항목이 끼어들면 기존 요소들의 index가 한 칸씩 밀린다.
> Vue는 key를 기준으로 DOM을 재사용하므로 "0번 자리"에 있던 DOM(사용자가 입력한 값까지)을
> 새로 들어온 항목이 그대로 물려받는다. **배열의 순서가 바뀔 수 있다면 index를 key로 쓰면 안 된다.**

#### 그 외 교재 코드 대비 수정

- `VHtmlSample.vue`, `VTextSample.vue` — 설명용 `<h3>` 에 `v-pre` 를 추가했다.
  교재 그대로 `<h3>일반 보간법 {{}} 결과:</h3>` 를 쓰면 **빈 보간식이라 템플릿 컴파일 에러**가 난다.
- `VForSample.vue` — 교재 `import { ref } from 'vue’` 의 따옴표 오타(`’`)를 수정했다.

### 3. Vue Syntax — Vue Event Handling (p.94~105)

| 교재      | 실습 내용                                    | 파일                                      |
| --------- | -------------------------------------------- | ----------------------------------------- |
| p.94~96   | `v-on(@)` — Inline Handler vs Method Handler | `practices/event/VOnHandler.vue`          |
| p.97~100  | 이벤트 객체(`$event`) 전달 2가지 패턴        | `practices/event/EventObjectSample.vue`   |
| p.101~102 | 이벤트 수식어 — `.prevent` / `.stop`         | `practices/event/EventModifierSample.vue` |

> ✅ **p.105 Code Challenge** (v-on Event Handler / Event Object / Event Modifier) 완료

#### Customization ③ `VOnHandler.vue` — 주요 이벤트 8종 직접 붙여보기

교재 p.94는 주요 이벤트를 **표로 8가지 나열**해 두고, 예제(p.96)에서는 `@click` 하나만 다룬다.
나머지 이벤트를 직접 연결해 **정확히 언제 발생하는지** 이벤트 로그 패널로 확인하도록 만들었다.

- `input` · `change` · `keyup` · `keydown` · `submit` · `mouseenter` · `mouseleave` 연결
- 발생한 이벤트를 종류별 색상 배지 + 시각과 함께 최근 8건까지 기록

> 📌 알게 된 점 — `input`은 **글자를 칠 때마다**, `change`는 **포커스가 빠질 때 한 번만** 발생한다.
> 로그로 보면 `keydown → input → keyup` 순서로 찍히고, Tab을 눌러 포커스가 빠지는 순간에야
> `change`가 한 번 찍힌다. 이 차이가 뒤에 배울 `v-model.lazy` 수식어(p.110)의 동작 원리다.

#### Customization ④ `EventObjectSample.vue` — 이벤트 객체 속성 실시간 관측기

교재 p.97은 이벤트 객체 속성을 **표로 12개** 정리해 두지만, 예제(p.100)에서 실제로 써 보는 건
`clientX` / `clientY` / `target.tagName` 3개뿐이다. 나머지가 어떻게 다른지 직접 관측한다.

1. **좌표 3종 비교** — `clientX/Y` vs `pageX/Y` vs `screenX/Y` 를 마우스 이동에 맞춰 실시간 표시
2. **`e.target` vs `e.currentTarget`** — 부모 DIV에 리스너를 걸고 자식을 클릭해 둘이 갈라지는 것을 확인
3. **`e.key` vs `e.code` + 조합키** — `shiftKey` / `ctrlKey` / `altKey` 를 배지로 표시

> 📌 알게 된 점 — 스크롤한 상태에서 마우스를 움직이면 `clientY`(480)와 `pageY`(1182)가 크게 벌어진다.
> 이 차이를 모르고 쓰면 스크롤된 페이지에서 툴팁 위치가 어긋나는 버그가 난다.
> 또 `Shift + a` 는 `key`가 `"A"`, `code`는 `"KeyA"` 다.
> **입력값이 필요하면 `key`, 단축키를 만들려면 `code`** 를 쓴다. `code`는 물리적 자판 위치라서
> 한글 모드에서도 값이 변하지 않기 때문이다.

#### Customization ⑤ `EventModifierSample.vue` — 교재가 빠뜨린 `.once` 와 `.self`

교재 p.101 표에는 수식어가 **4가지**(`.prevent` `.stop` `.once` `.self`) 정리돼 있는데,
p.102 예제 코드에는 **앞의 2개만** 있다. 빠진 2개를 직접 구현했다.

- **`.once`** — 설문 제출 버튼에 적용. 3번 눌러도 1번만 실행되는 것을 로그로 확인.
  한 번 소모되면 되살릴 방법이 없어서, "되살리기"는 `:key`를 바꿔 **버튼을 통째로 새로 그리는** 방식으로 구현했다.
- **`.self`** — 적용/미적용 박스를 나란히 두고, 자식 버튼을 눌렀을 때와 여백을 직접 눌렀을 때를 비교.
- 결과는 `alert` 대신 **화면 로그**로 남겼다. `alert`은 브라우저를 멈춰 세워서
  여러 이벤트가 어떤 순서로 발생하는지 관찰할 수 없기 때문이다.

> 📌 알게 된 점 — `.self`는 내부적으로 `e.target === e.currentTarget` 을 검사한다.
> 모달의 **바깥 배경을 눌렀을 때만 닫기**를 구현할 때 쓰는 수식어다. 없으면 모달 내용을 클릭해도 창이 닫혀 버린다.

### 4. Vue Syntax — Form Data Binding & Vue Style (p.106~114)

| 교재      | 실습 내용                                                 | 파일                                    |
| --------- | --------------------------------------------------------- | --------------------------------------- |
| p.106     | `v-model` 양방향 바인딩 + 내부 원리(`:value` + `@input`)  | `practices/form/VModelBasic.vue`        |
| p.107~109 | HTML Form 요소 5종과 `v-model` 매핑 규칙                  | `practices/form/VModelFormElements.vue` |
| p.110~112 | `v-model` 수식어 — `.lazy` / `.number` / `.trim` / 체이닝 | `practices/form/VModelModifier.vue`     |
| p.113~114 | Scoped Style / External Style (`@import`)                 | `practices/style/VueStyleSample.vue`    |

> ✅ **p.115 Code Challenge** (Form Data Binding / v-model Modifiers / Vue Style) 완료

이번 단원의 개인 응용은 전부 **Vue 소스 코드(`@vue/runtime-dom`, `@vue/shared`)를 직접 열어
교재 설명과 대조하는** 방식으로 잡았다. 교재가 한 줄로 요약한 문장 뒤에 실제로는 조건 분기가
숨어 있고, 그 분기가 한글 입력·타입 검증에서 곧바로 버그로 드러나기 때문이다.

#### Customization ⑥ `VModelBasic.vue` — `v-model`은 정말 `:value` + `@input`인가

교재 p.106은 `v-model`을 **"`v-bind`와 `v-on:input`을 결합한 것"** 이라고 설명하고 끝난다.
영어를 치면 실제로 똑같지만, **한글**을 치면 두 방식의 결과가 갈라진다.

`@vue/runtime-dom`의 `vModelText`를 열어 보니 교재에 없는 한 줄이 있었다.

```js
addEventListener(el, lazy ? 'change' : 'input', (e) => {
  if (e.target.composing) return // ← 교재에 없는 IME 조합 가드
  el[assignKey](castValue(el.value, trim, castToNumber))
})
if (!lazy) {
  addEventListener(el, 'compositionstart', onCompositionStart) // composing = true
  addEventListener(el, 'compositionend', onCompositionEnd) // composing = false
}
```

입력창 하나에 `input` · `compositionstart` · `compositionend`를 전부 걸고,
**같은 타이핑**에 대해 두 방식이 어떻게 달라지는지 나란히 관측하도록 만들었다.

- 조합 중 여부를 배지로 실시간 표시하고, 두 값이 갈라지면 배경색으로 강조
- `input` 이벤트 발생 횟수 vs `v-model`이 무시한 횟수를 카운트
- 발생 이벤트를 종류별 색상 배지로 최근 12건까지 기록

> 📌 알게 된 점 — "한글" 두 글자를 치면 `input` 이벤트가 **8번** 발생하는데
> 그중 **6번**을 `v-model`이 무시한다. 한글은 자음·모음이 조합되는 동안에도 `input`이 계속
> 발생하는데, 이때 상태를 갱신하면 Vue가 입력창을 다시 그리면서 **조합 중인 글자가 깨지기** 때문이다.
> 반대로 **검색어 자동완성**처럼 조합 중인 글자까지 실시간으로 받아야 하는 기능은 `v-model`로
> 만들 수 없다. 교재 p.116 Hands-on 요구사항 3번이 굳이 `:value` + `@input`으로 한글 검색을
> 만들라고 지정한 이유가 이것이었다.

#### Customization ⑦ `VModelFormElements.vue` — p.107 표가 다루지 않는 4가지

교재 p.107 표는 Form 태그 5종의 **ref 초기값 타입**만 정리한다. 실무 폼에서 바로 부딪히는
아래 네 가지는 표에도 예제에도 없어서 직접 만들어 확인했다.

1. **`value` 속성을 빠뜨린 다중 체크박스** — 적용/미적용을 나란히 두고 실물 시연
2. **`true-value` / `false-value`** — 서버가 `'Y'`/`'N'`이나 `1`/`0`을 요구하는 경우
3. **`select multiple`(→ 배열) 과 `:value`로 객체 통째로 바인딩** — 표에 아예 없는 두 가지
4. **서버로 전송될 페이로드 JSON 실시간 미리보기** — 타입 어긋남을 이 단계에서 잡는다

> 📌 알게 된 점 — ①의 원인이 예상과 달랐다. `vModelCheckbox`는 값을 **넣을 때**와
> 체크 표시를 **되돌릴 때** 서로 다른 곳을 본다.
>
> ```js
> // ① change 핸들러 — 배열에 넣는 값
> const elementValue = getValue(el) // el.value → "on" (브라우저 기본값)
> // ② setChecked() — 체크 표시를 되돌릴 때 찾는 값
> checked = looseIndexOf(value, vnode.props.value) > -1 // value 속성이 없으면 undefined
> ```
>
> 배열에는 `"on"`을 넣어 놓고 `undefined`를 찾으니 항상 `-1`이라, **체크하는 순간 Vue가 표시를
> 도로 꺼 버린다.** 더 나쁜 건 두 번째 체크박스부터다 — 배열에 `"on"`이 이미 있어서 상태가 안 바뀌고,
> 상태가 안 바뀌니 리렌더도 안 일어나 **체크 표시만 켜진 채 남는다.** 실제로 사과→바나나→딸기
> 순으로 눌러 보면 화면은 `[off, ON, ON]`인데 데이터는 `["on"]` 하나다.
> 순수 HTML 폼에서는 `name`별로 전송돼 티도 안 나던 실수인데, `v-model` 배열에서는 곧바로 데이터 손실이 된다.

#### Customization ⑧ `VModelModifier.vue` — "Number 타입으로 자동 형변환"의 함정

교재 p.110 표는 `.number`를 **"Number 타입으로 자동 형변환"** 이라고 한 줄로 정리한다.
그런데 Vue가 실제로 쓰는 함수는 `Number()`가 아니라 **`parseFloat()` 기반**이었다.

```js
// @vue/shared
const looseToNumber = (val) => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n // ← 실패하면 원본 문자열이 그대로 반환된다
}
```

- **A) 직접 입력 관측** — `typeof`를 색상 배지로 실시간 표시
- **B) 변환 결과 대조표** — 11가지 입력에 대해 `looseToNumber()` vs `Number()` 비교,
  두 결과가 어긋나는 줄을 자동으로 강조
- **C)** `<input type="number">`에는 `.number`가 필요 없다는 것을 실물로 확인
- **D)** `.trim`은 **양끝만** 지운다 — 공백을 `␣`로 시각화해 가운데 공백이 남는 것을 확인
- **E)** `.lazy`는 한글 조합 가드를 **끈다**

> 📌 알게 된 점 — 브라우저에서 직접 찍어 본 결과가 교재 설명과 어긋났다.
>
> | 입력      | `.number` 결과 | 타입       | `Number()`였다면 |
> | --------- | -------------- | ---------- | ---------------- |
> | `"12abc"` | `12`           | number     | `NaN`            |
> | `"abc"`   | `"abc"`        | **string** | `NaN`            |
> | `""`      | `""`           | **string** | `0`              |
> | `"0x10"`  | `0`            | number     | `16`             |
>
> `"12abc"`가 **에러 없이 `12`로 통과**하고, `"abc"`는 숫자가 아니라 **문자열 그대로** 남는다.
> 즉 `.number`를 썼다는 이유로 타입을 믿으면 안 되고, 서버로 보내기 전에 `typeof` 검사를 따로 해야 한다.
>
> 그리고 `vModelText` 안의 `const castToNumber = number || vnode.props.type === 'number'` 때문에
> **`type="number"`면 수식어 없이도 숫자 변환이 걸린다.** `type="number" v-model.number`는 중복이다.
> `.lazy`가 조합 가드를 등록하지 않는 것(`if (!lazy) { … }`)도 같은 파일에서 확인했다.
> `.lazy`가 쓰는 `change`는 어차피 한글 조합이 끝난 뒤에 발생하므로 가드가 필요 없기 때문이다.

#### Customization ⑨ `VueStyleSample.vue` — scoped를 "설명" 말고 "증거"로

교재 p.113은 scoped를 **"다른 컴포넌트에는 영향을 주지 않는다"** 고 문장으로만 설명하고,
p.114 예제는 컴포넌트가 하나뿐이라 정작 **그 격리가 일어나는 장면이 없다.**
또 Vue 3의 핵심 스타일 기능인 `:deep()`과 CSS `v-bind()`는 교재에 통째로 빠져 있다.

1. **격리의 실물** — `StyleChildCard.vue`를 만들어 부모와 **똑같은 `.title` 클래스**를 쓰게 하고,
   두 컴포넌트가 서로 다른 색으로 남는 것을 나란히 배치
2. **`data-v-` 해시 관측** — 템플릿 ref로 DOM 속성을 마운트 직후 직접 읽어 화면에 표시
3. **`:deep()`** — 체크박스로 on/off 하며 자식 내부까지 스타일이 도달하는 순간을 비교
4. **CSS `v-bind()`** — 컬러피커·슬라이더로 카드의 색·모서리·여백을 실시간 제어

> 📌 알게 된 점 — `scoped`는 런타임 격리가 아니라 **컴파일 타임 치환**이다.
> 빌드 후 CSS를 열어 보니 `.live-card` 규칙이
> `.live-card[data-v-95a57b12]{background-color:var(--e2130de8); …}` 로 바뀌어 있었다.
> 해시가 컴포넌트마다 달라서 같은 클래스명이어도 서로 안 걸리는 것이고,
> 자식 엘리먼트에는 부모의 해시가 안 붙기 때문에 `.card-body { … }`라고 써도 **아무 일도 일어나지 않는다.**
> `:deep(.card-body)`를 써야 선택자가 `[data-v-부모] .card-body`로 바뀌어 자식 안까지 닿는다.
> UI 라이브러리(p.231 단원) 내부 마크업을 커스터마이징할 때 반드시 쓰게 될 문법이다.
>
> CSS `v-bind()`는 **해시가 붙은 CSS 변수**로 컴파일된다. 개발 모드에서는
> `--263c18ce-themeColor`처럼 이름이 남지만 `npm run build` 후에는 `--e2130de8`로 완전히 해시된다.
> 인라인 `:style`과 달리 **`:hover`나 미디어 쿼리 안에서도 쓸 수 있다.**
> 단, 숫자만 넘기면 CSS가 해석하지 못하므로 `computed`로 `"8px"`처럼 **단위를 붙여** 넘겨야 한다.

#### 그 외 교재 코드 대비 보완

- 교재 p.114가 `@import '@/assets/challenge.css'`로 불러오는 파일이 교재에 없어서 **직접 작성**했다.
  이 블록은 `scoped`가 없어 `.btn-external`이 **프로젝트 전역**에 퍼진다는 점을 주석으로 남겼다.
  `npm run build`로 확인해 보니 실제로 `data-v-` 없이 전역 규칙으로 번들에 들어간다.

### 5. Hands on — Weather Mockup (p.116)

| 교재  | 실습 내용                                    | 파일                                  |
| ----- | -------------------------------------------- | ------------------------------------- |
| p.116 | 날씨 목업 종합 과제 (요구사항 1~5 전부 충족) | `practices/handson/WeatherMockup.vue` |

> 🖥️ **화면은 제출용 결과물이라 교재·요구사항 언급을 넣지 않았다.**
> 대신 하단에 **✅ 기본 기능 체크리스트**(6항목)와 **✨ 추가 기능**(8항목)을 두어,
> 기능명을 굵게 표시해 어디까지가 기본이고 어디부터가 직접 얹은 부분인지 한눈에 보이게 했다.
> 아래 교재 대조는 **학습 기록용**이라 README에만 남긴다.

p.117부터 Composition API로 넘어가므로, **p.116은 p.69~114 문법 전체를 한 화면에 모으는 종합 과제**다.
요구사항 5가지가 앞 단원의 개인 응용과 거의 1:1로 이어져서, "앞에서 만든 걸 실전에서 써먹는 완결편"으로 잡았다.

| 요구사항 | 내용                                                  | 구현                                                      |
| -------- | ----------------------------------------------------- | --------------------------------------------------------- |
| 1        | 배열 렌더링 `v-for` + `:key="id"`                     | 도시 카드 그리드                                          |
| 2        | 조건부 렌더링 `v-if` (25도 기준)                      | 교재 2단계 라벨 유지 + 개인 응용 ⑫ 구간 칩 병기           |
| 3        | 한글 처리 `:value` + `@input`                         | 검색창 (개인 응용 ⑩⑪이 여기에 통합)                       |
| 4        | 카드 클릭 → 상태바 / [상세보기] `@click.stop` → alert | 교재 그대로 + 개인 응용 ⑭ 모달 병기                       |
| 5        | 본인 데이터 추가                                      | 도시 5개 + 습도·미세먼지·체감온도·시간대별 예보 필드 추가 |

#### Customization ⑩ 한글 초성 검색 — `:value` + `@input` 이어야만 하는 이유

요구사항 3은 **"입력한 도시명을 출력한다"** 까지만 요구해서 사실상 껍데기다.
실제 필터링에 더해 **초성 검색**(`ㅅㅇ` → 서울)까지 구현했다.

완성형 한글은 `0xAC00`부터 (초성 19 × 중성 21 × 종성 28) 순서로 배열돼 있다.

```js
초성 index = (code - 0xAC00) / 588   // 588 = 21 × 28
종성 index = (code - 0xAC00) % 28    // 0 이면 받침 없음
```

이 두 줄로 **초성 추출과 조사 판별이 모두 해결된다.**
교재 문구 `"{도시}이 선택되었습니다."` 는 조사가 `이`로 고정이라 받침 없는 도시는
"제주**이** 선택되었습니다"가 되므로, `% 28` 로 받침을 판별해 **조사를 자동 처리**했다.

> 📌 알게 된 점 — **초성 검색은 `v-model`로는 원리상 불가능하다.**
> `ㅅ`은 아직 조합이 끝나지 않은 글자라, p.106 개인 응용 ⑥에서 확인한
> `if (e.target.composing) return` 가드가 그대로 삼켜 버리기 때문이다.
> **요구사항 3이 굳이 `:value` + `@input`을 지정한 이유가 이것이었다.**
>
> 처음엔 `이름.includes(검색어) || 이름초성.includes(검색어초성)` 으로 짰는데
> `"서"`가 수원·부산까지 잡는 오탐이 났다. `"서"`의 초성 `ㅅ`이 `"수원"(ㅅㅇ)`,
> `"부산"(ㅂㅅ)` 에 들어 있기 때문이다. **완성된 글자는 초성으로 비교하면 안 된다.**
> 그래서 글자 단위로 미끄러뜨리며 **낱자음이면 초성과, 완성 글자면 글자끼리** 비교하도록 고쳤다.
> 덤으로 `"강ㄹ"` 처럼 **조합 도중에 실제로 나오는 형태**도 강릉에 매칭된다.

#### Customization ⑪ 키보드 네비게이션 — 교재 p.103~104 표를 실전으로

교재 **p.103~104에 키보드·시스템·마우스 수식어가 표로 정리돼 있는데 예제 코드가 하나도 없다.**
(p.102 예제는 `.prevent` / `.stop` 뿐이라 `EventModifierSample`도 거기까지만 다뤘다.)

게다가 p.103 표는 `.up` / `.down` 의 활용 예시를
**"자동완성 검색어 목록에서 화살표로 리스트 이동할 때"** 라고 적어 두었는데,
이 도시 검색이 정확히 그 상황이라 그대로 구현했다.

- `@keydown.down.prevent` / `@keydown.up.prevent` — 카드 하이라이트 순환 이동
- `@keydown.enter` — 현재 하이라이트된 도시 선택
- `@keydown.esc` — 검색 초기화

> 📌 알게 된 점 — `.prevent`를 같이 붙여야 한다. 안 붙이면 방향키의 기본 동작(입력 커서를
> 문자열 끝/처음으로 보내기)이 같이 일어나서 검색어 편집이 방해된다. **수식어는 체이닝된다**는
> p.110의 내용이 이벤트 수식어에서도 그대로 통한다.

#### Customization ⑫ 온도 구간을 데이터로 — 조건문 체인 걷어내기

요구사항 2는 25도 기준 2단계이고 "조건은 다르게 해도 된다"고 허용한다.
그런데 **`v-else-if` 다단계 자체는 이미 `VIfSample`(p.79)에 있으므로 단계만 늘리는 건 응용이 아니다.**
조건문 체인을 걷어내고 **구간 테이블 + `find()`** 로 바꿔 데이터 주도로 만들었다.
기준값은 기상청 폭염·한파 특보 기준(35 / 33 / -12도)을 따랐다.

```js
const TEMP_BANDS = [ { min: 35, label: '폭염경보', color: '#c0392b' }, … ]
const bandOf = (temp) => TEMP_BANDS.find((band) => temp >= band.min)
```

구간을 추가·수정할 때 **템플릿을 건드릴 필요가 없다.** 미세먼지 등급도 같은 방식으로 처리했다.

#### Customization ⑬ 정렬 · 집계 · 중첩 `v-for`

- `computed`로 평균 기온 / 최고 / 최저를 집계하고, `toSorted()`로 4가지 정렬을 붙였다
- 시간대별 예보는 **배열 안의 배열**이라 **중첩 `v-for`** 로 렌더한다 (교재에 없는 형태).
  CSS만으로 미니 막대 그래프를 그렸고, 막대마다 ⑫의 구간 색을 적용했다
- 중첩 `v-for`의 `:key`는 `index` 대신 시각 문자열을 썼다 — `:key="index"`의 문제는 Customization ②에서 이미 확인했다

#### Customization ⑭ `window.alert` 대신 커스텀 모달

요구사항 4가 `window.alert`을 명시하므로 **교재 버튼은 그대로 두고** 모달 버전을 나란히 뒀다.

- 배경(Dim) 클릭으로 닫기 → **`@click.self`** (p.101 표가 적어둔 활용 예시 그대로)
- Esc로 닫기 → **`@keydown.esc`** (p.103 표, 교재에 예제 없음)

> 📌 알게 된 점 — `@keydown.esc`가 동작하려면 **그 엘리먼트에 포커스가 있어야 한다.**
> 모달을 열 때 `tabindex="-1"` 을 준 배경에 `nextTick(() => el.focus())` 로 포커스를 옮겨야 했다.
> 그리고 `alert`은 **브라우저를 통째로 멈춰 세워서** 스타일을 줄 수도, 자동화로 검증을 이어갈 수도 없다.
> (그래서 이 과제를 브라우저로 검증할 때 alert 버튼만은 클릭하지 않았다)

#### 그 외 — CSS 변수 주입 경로와 스캐폴드 레이아웃

- **`v-bind()`를 카드 색에 쓰려다 막혔다.** p.113 개인 응용 ⑨에서 배운 CSS `v-bind()`는
  **컴포넌트 인스턴스 단위**로 CSS 변수를 만들기 때문에, `v-for`로 찍어낸 카드마다 다른 색을 줄 수 없다.
  그래서 `:style="{ '--band': … }"` 로 **엘리먼트마다 CSS 변수를 직접 주입**하고 CSS에서 `var(--band)`로 받았다.
  같은 CSS 변수라도 주입 경로가 다르다.
- **`main.css`의 스캐폴드 기본 레이아웃을 제거했다.** Vue 스캐폴드는 `@media (min-width: 1024px)`에서
  `#app`을 2단 그리드(`1fr 1fr`)로 만드는데, 초기 Welcome 페이지 전용 설정이라
  **실습 컴포넌트가 전부 화면 절반에 갇혀 있었다.** 카드 그리드가 1열로 눌려서 걷어냈다.

---

## 품질 관리

작업 후 아래 항목을 확인한다.

| 항목            | 명령 / 방법                                                          |
| --------------- | -------------------------------------------------------------------- |
| ESLint 오류 0   | `npm run lint`                                                       |
| 전체 SFC 컴파일 | `vue/compiler-sfc` 로 `src/**/*.vue` 파싱 → 스크립트 → 템플릿 컴파일 |
| 브라우저 동작   | `npm run dev` 후 컴포넌트별 육안 확인 (콘솔 에러 0)                  |

> ⚠️ API 키 등 민감 정보는 `.env` 로 분리한다. `.gitignore` 에 `.env`, `.env.*` 를 등록해 두었다.
