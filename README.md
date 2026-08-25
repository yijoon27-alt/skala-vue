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
│     └─ directive/           # Vue Directive (p.74~92)
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

---

## 품질 관리

작업 후 아래 항목을 확인한다.

| 항목            | 명령 / 방법                                                          |
| --------------- | -------------------------------------------------------------------- |
| ESLint 오류 0   | `npm run lint`                                                       |
| 전체 SFC 컴파일 | `vue/compiler-sfc` 로 `src/**/*.vue` 파싱 → 스크립트 → 템플릿 컴파일 |
| 브라우저 동작   | `npm run dev` 후 컴포넌트별 육안 확인 (콘솔 에러 0)                  |

> ⚠️ API 키 등 민감 정보는 `.env` 로 분리한다. `.gitignore` 에 `.env`, `.env.*` 를 등록해 두었다.
