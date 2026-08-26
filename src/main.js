import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { storeEnhancer } from './stores/plugins'

const app = createApp(App)

const pinia = createPinia()
pinia.use(storeEnhancer) // localStorage 영속 + 액션 이력 기록

app.use(pinia)
app.use(router)

app.mount('#app')
