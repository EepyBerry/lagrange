import { createRouter, createWebHistory } from 'vue-router';
import CodexView from './views/CodexView.vue';
import PlanetEditorView from './views/EditorView.vue';
import PageNotFoundView from './views/PageNotFoundView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    /**
     * Legacy route redirection to avoid breaking existing behaviour
     * @since v0.5.2
     */
    {
      path: '/codex',
      redirect: '/'
    },
    {
      path: '/',
      name: 'codex',
      component: CodexView,
      meta: { title: 'Codex' },
    },
    {
      path: '/planet-editor',
      redirect: '/planet-editor/new',
    },
    {
      path: '/planet-editor/:id',
      name: 'planet-editor',
      component: PlanetEditorView,
      meta: { title: 'Planet Editor' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'page-not-found',
      component: PageNotFoundView,
      meta: { title: 'Page Not Found' },
    },
  ],
});

export default router;
