import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus 모듈 및 필수 CSS Import (교재 p.236)
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { storeEnhancer } from './stores/plugins'

const app = createApp(App)

const pinia = createPinia()
pinia.use(storeEnhancer) // localStorage 영속 + 액션 이력 기록

app.use(pinia)
app.use(router)
app.use(ElementPlus) // Vue 앱에 Element Plus 사용 등록

app.mount('#app')
