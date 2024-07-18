import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/planet-editor',
    },
    {
      path: '/planet-editor',
      name: 'planet-editor',
      component: () => import('./views/PlanetEditorView.vue'),
      meta: { title: 'Planet Editor' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'page-not-found',
      component: () => import('./views/PageNotFoundView.vue'),
      meta: { title: 'Page Not Found' },
    },
  ],
})

export default router
