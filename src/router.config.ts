import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/codex',
    },
    {
      path: '/codex',
      name: 'codex',
      component: () => import('./views/CodexView.vue'),
      meta: { title: 'Codex' },
    },
    {
      path: '/planet-editor',
      redirect: '/planet-editor/new',
    },
    {
      path: '/planet-editor/:id',
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
