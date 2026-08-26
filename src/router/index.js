import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/compare',
      name: 'WeatherCompare',
      component: () => import('../views/WeatherCompareView.vue'),
    },
    {
      path: '/briefing/:cityId',
      name: 'WeatherBriefing',
      component: () => import('../views/WeatherBriefingView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
