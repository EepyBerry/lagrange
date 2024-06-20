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
        name: 'Planet Editor',
        component: () => import('./views/PlanetEditorView.vue')
      },
      { 
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('./views/PageNotFoundView.vue')
      }
    ]
})
router.afterEach((to) => {
  document.title = (to.name ? `${String(to.name)} · ` : '') + SITE_NAME;
})

export default router