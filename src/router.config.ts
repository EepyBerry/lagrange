import { createRouter, createWebHistory } from "vue-router"
import { SITE_NAME } from "./core/globals";

const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        redirect: '/planet-editor'
      },
      {
        path: '/planet-editor',
        name: 'planet-editor',
        component: () => import('./views/PlanetEditorView.vue'),
        meta: { title: 'Planet Editor' }
      },
      { 
        path: '/:pathMatch(.*)*',
        name: 'page-not-found',
        component: () => import('./views/PageNotFoundView.vue'),
        meta: { title: 'Page Not Found' }
      }
    ]
})
router.afterEach((to) => {
  document.title = (to.meta.title ? `${String(to.meta.title)} · ` : '') + SITE_NAME;
})

export default router