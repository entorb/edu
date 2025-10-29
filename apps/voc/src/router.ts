import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('/voc/'),
  routes: [
    {
      path: '/',
      name: '/',
      component: () => import('./pages/HomePage.vue')
    },
    {
      path: '/game',
      name: '/game',
      component: () => import('./pages/GamePage.vue')
    },
    {
      path: '/game-over',
      name: '/game-over',
      component: () => import('./pages/GameOverPage.vue')
    },
    {
      path: '/cards',
      name: '/cards',
      component: () => import('./pages/CardsPage.vue')
    },
    {
      path: '/cards-edit',
      name: '/cards-edit',
      component: () => import('./pages/CardsEditPage.vue')
    },
    {
      path: '/history',
      name: '/history',
      component: () => import('./pages/HistoryPage.vue')
    },
    {
      path: '/stats',
      name: '/stats',
      component: () => import('./pages/CardsPage.vue')
    },
    {
      path: '/info',
      name: '/info',
      component: () => import('./pages/InfoPage.vue')
    }
  ]
})
