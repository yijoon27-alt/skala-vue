export const practiceGroups = [
  {
    id: 'basic',
    title: '반응형 기초',
    summary: '일반 변수와 ref()의 차이, 텍스트 보간',
    items: [
      {
        name: 'SampleOne',
        label: '일반 변수 vs ref()',
        component: () => import('@/components/practices/basic/SampleOne.vue'),
      },
      {
        name: 'SampleTwo',
        label: 'Text Interpolation',
        component: () => import('@/components/practices/basic/SampleTwo.vue'),
      },
    ],
  },
  {
    id: 'directive',
    title: 'Directive',
    summary: 'v-html · v-bind · v-if · v-for · v-once · v-memo',
    items: [
      {
        name: 'VHtmlSample',
        label: 'v-html — 문자열을 HTML로',
        component: () => import('@/components/practices/directive/VHtmlSample.vue'),
      },
      {
        name: 'VHtmlXssSample',
        label: 'v-html XSS와 sanitize 대책',
        component: () => import('@/components/practices/directive/VHtmlXssSample.vue'),
      },
      {
        name: 'VTextSample',
        label: 'v-text',
        component: () => import('@/components/practices/directive/VTextSample.vue'),
      },
      {
        name: 'VBindBasic',
        label: 'v-bind 기본',
        component: () => import('@/components/practices/directive/VBindBasic.vue'),
      },
      {
        name: 'VBindClass',
        label: 'v-bind 클래스 바인딩',
        component: () => import('@/components/practices/directive/VBindClass.vue'),
      },
      {
        name: 'VBindStyle',
        label: 'v-bind 스타일 바인딩',
        component: () => import('@/components/practices/directive/VBindStyle.vue'),
      },
      {
        name: 'VBindShorthand',
        label: 'v-bind same-name shorthand',
        component: () => import('@/components/practices/directive/VBindShorthand.vue'),
      },
      {
        name: 'VIfSample',
        label: 'v-if / v-else-if / v-else',
        component: () => import('@/components/practices/directive/VIfSample.vue'),
      },
      {
        name: 'VShowSample',
        label: 'v-show',
        component: () => import('@/components/practices/directive/VShowSample.vue'),
      },
      {
        name: 'VForSample',
        label: 'v-for — 검색·정렬과 :key 버그 시연',
        component: () => import('@/components/practices/directive/VForSample.vue'),
      },
      {
        name: 'VPreSample',
        label: 'v-pre',
        component: () => import('@/components/practices/directive/VPreSample.vue'),
      },
      {
        name: 'VCloakSample',
        label: 'v-cloak',
        component: () => import('@/components/practices/directive/VCloakSample.vue'),
      },
      {
        name: 'VOnceSample',
        label: 'v-once',
        component: () => import('@/components/practices/directive/VOnceSample.vue'),
      },
      {
        name: 'VMemoSample',
        label: 'v-memo',
        component: () => import('@/components/practices/directive/VMemoSample.vue'),
      },
    ],
  },
  {
    id: 'event',
    title: 'Event Handling',
    summary: '이벤트 8종 · 이벤트 객체 · 이벤트 수식어',
    items: [
      {
        name: 'VOnHandler',
        label: 'v-on 핸들러와 이벤트 8종 로그',
        component: () => import('@/components/practices/event/VOnHandler.vue'),
      },
      {
        name: 'EventObjectSample',
        label: '이벤트 객체 — 좌표·target·key',
        component: () => import('@/components/practices/event/EventObjectSample.vue'),
      },
      {
        name: 'EventModifierSample',
        label: '이벤트 수식어 — stop · prevent · once · self',
        component: () => import('@/components/practices/event/EventModifierSample.vue'),
      },
    ],
  },
  {
    id: 'form',
    title: 'Form Data Binding',
    summary: 'v-model 기본 · 폼 요소별 바인딩 · 수식어',
    items: [
      {
        name: 'VModelBasic',
        label: 'v-model 기본과 한글 IME 조합',
        component: () => import('@/components/practices/form/VModelBasic.vue'),
      },
      {
        name: 'VModelFormElements',
        label: '폼 요소별 v-model',
        component: () => import('@/components/practices/form/VModelFormElements.vue'),
      },
      {
        name: 'VModelModifier',
        label: 'v-model 수식어 — lazy · number · trim',
        component: () => import('@/components/practices/form/VModelModifier.vue'),
      },
    ],
  },
  {
    id: 'style',
    title: 'Style',
    summary: 'scoped 격리 · :deep() · CSS v-bind()',
    items: [
      {
        name: 'VueStyleSample',
        label: 'scoped 스타일과 :deep()',
        component: () => import('@/components/practices/style/VueStyleSample.vue'),
      },
    ],
  },
  {
    id: 'composition',
    title: 'Composition API',
    summary: 'ref · reactive · computed · watch · watchEffect',
    items: [
      {
        name: 'RefBasic',
        label: 'ref()',
        component: () => import('@/components/practices/composition/RefBasic.vue'),
      },
      {
        name: 'ReactiveBasic',
        label: 'reactive()',
        component: () => import('@/components/practices/composition/ReactiveBasic.vue'),
      },
      {
        name: 'ComputedBasic',
        label: 'computed()',
        component: () => import('@/components/practices/composition/ComputedBasic.vue'),
      },
      {
        name: 'WatchBasic',
        label: 'watch() 기본',
        component: () => import('@/components/practices/composition/WatchBasic.vue'),
      },
      {
        name: 'WatchReactive',
        label: 'reactive 객체 감시',
        component: () => import('@/components/practices/composition/WatchReactive.vue'),
      },
      {
        name: 'WatchMultiSource',
        label: '여러 소스 묶음 감시',
        component: () => import('@/components/practices/composition/WatchMultiSource.vue'),
      },
      {
        name: 'WatchDeep',
        label: 'deep 옵션',
        component: () => import('@/components/practices/composition/WatchDeep.vue'),
      },
      {
        name: 'WatchEffectSample',
        label: 'watchEffect()',
        component: () => import('@/components/practices/composition/WatchEffectSample.vue'),
      },
    ],
  },
  {
    id: 'component',
    title: 'Component',
    summary: 'Lifecycle · Props & Emits · Provide & Inject · Slot',
    items: [
      {
        name: 'LifecycleParent',
        label: 'Lifecycle Hook 흐름',
        component: () => import('@/components/practices/component/LifecycleParent.vue'),
      },
      {
        name: 'PropsEmitsParent',
        label: 'Props & Emits',
        component: () => import('@/components/practices/component/PropsEmitsParent.vue'),
      },
      {
        name: 'SlotDefaultParent',
        label: 'Default Slot',
        component: () => import('@/components/practices/component/SlotDefaultParent.vue'),
      },
      {
        name: 'SlotNamedParent',
        label: 'Named Slot',
        component: () => import('@/components/practices/component/SlotNamedParent.vue'),
      },
      {
        name: 'SlotScopedParent',
        label: 'Scoped Slot',
        component: () => import('@/components/practices/component/SlotScopedParent.vue'),
      },
    ],
  },
  {
    id: 'library',
    title: 'Pinia',
    summary: '전역 상태 저장소 — state · getters · actions',
    items: [
      {
        name: 'StoreCounter',
        label: 'Counter Store — state · getters · actions',
        component: () => import('@/components/practices/library/StoreCounter.vue'),
      },
      {
        name: 'StoreReactivityPitfall',
        label: '구조 분해 할당과 storeToRefs',
        component: () => import('@/components/practices/library/StoreReactivityPitfall.vue'),
      },
    ],
  },
  {
    id: 'axios',
    title: 'Axios',
    summary: 'REST API 통신 — OpenWeather 호출 · JSON Placeholder CRUD',
    items: [
      {
        name: 'AxiosWeather',
        label: 'Axios 기본 통신 — OpenWeather',
        component: () => import('@/components/practices/axios/AxiosWeather.vue'),
      },
      {
        name: 'AxiosJson',
        label: 'REST CRUD — GET · POST · PUT · DELETE',
        component: () => import('@/components/practices/axios/AxiosJson.vue'),
      },
    ],
  },
  {
    id: 'ui',
    title: 'UI Library',
    summary: 'Element Plus — Form · Data · Feedback 컴포넌트',
    items: [
      {
        name: 'UiRegisterForm',
        label: '회원가입 폼 — Input · Switch · Message',
        component: () => import('@/components/practices/ui/UiRegisterForm.vue'),
      },
      {
        name: 'UiProductCard',
        label: '상품 옵션 — InputNumber · Rate',
        component: () => import('@/components/practices/ui/UiProductCard.vue'),
      },
      {
        name: 'UiFileManager',
        label: '파일 관리 — Progress · MessageBox',
        component: () => import('@/components/practices/ui/UiFileManager.vue'),
      },
    ],
  },
  {
    id: 'handson',
    title: '종합 과제',
    summary: '날씨 대시보드를 문법 → Composition API → 컴포넌트 구조로 발전시킨 기록',
    items: [
      {
        name: 'WeatherMockup',
        label: '날씨 대시보드 — 디렉티브·이벤트·v-model 종합',
        component: () => import('@/components/practices/handson/WeatherMockup.vue'),
      },
      {
        name: 'WeatherComposition',
        label: '날씨 대시보드 — Composition API 종합',
        component: () => import('@/components/practices/handson/WeatherComposition.vue'),
      },
      {
        name: 'WeatherParent',
        label: '날씨 대시보드 — 컴포넌트 분리 종합',
        component: () =>
          import('@/components/practices/handson/weather-component/WeatherParent.vue'),
      },
    ],
  },
]

export const findPracticeGroup = (groupId) =>
  practiceGroups.find((group) => group.id === groupId) ?? null
