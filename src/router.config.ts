import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    /**
     * Legacy route redirection to avoid breaking existing behaviour
     * @since v0.5.2
     */
    {
      path: '/codex',
      redirect: '/',
    },
    {
      path: '/',
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
      component: () => import('./views/EditorView.vue'),
      meta: { title: 'Planet Editor' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'page-not-found',
      component: () => import('./views/PageNotFoundView.vue'),
      meta: { title: 'Page Not Found' },
    },
  ],
});

export default router;
