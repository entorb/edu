import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import GamePage from './pages/GamePage.vue'
import GameOverPage from './pages/GameOverPage.vue'
import HistoryPage from './pages/HistoryPage.vue'
import StatsPage from './pages/StatsPage.vue'

export const router = createRouter({
  history: createWebHistory('/1x1/'),
  routes: [
    {
      path: '/',
      name: '/',
      component: HomePage
    },
    {
      path: '/game',
      name: '/game',
      component: GamePage
    },
    {
      path: '/game-over',
      name: '/game-over',
      component: GameOverPage
    },
    {
      path: '/history',
      name: '/history',
      component: HistoryPage
    },
    {
      path: '/stats',
      name: '/stats',
      component: StatsPage
    }
  ]
})
