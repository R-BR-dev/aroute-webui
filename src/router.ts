import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

import LoginPage from './pages/LoginPage.vue'
import { useSessionStore } from './stores/session'

declare module 'vue-router' {
  interface RouteMeta {
    /** Reachable without signing in. Every other route redirects to the login page. */
    public?: boolean
  }
}

/**
 * The app's routes and the guard that keeps signed-out visitors on the login page.
 *
 * `history` is a parameter so tests can run the router in memory. The default
 * uses real URLs (`/`, `/login`); the Core answers any unknown path with
 * `index.html`, so reloading a page deep in the app works.
 */
export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const router = createRouter({
    history,
    routes: [
      { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
      {
        // Everything behind the login shares one frame. Its code is loaded on demand.
        path: '/',
        component: () => import('./components/AppLayout.vue'),
        children: [
          { path: '', name: 'dashboard', component: () => import('./pages/DashboardPage.vue') },
        ],
      },
      // Any other address: start from the dashboard.
      { path: '/:unknown(.*)*', redirect: '/' },
    ],
  })

  router.beforeEach((to) => {
    const session = useSessionStore()

    if (!session.signedIn && !to.meta.public) return { name: 'login' }
    if (session.signedIn && to.name === 'login') return { name: 'dashboard' }
  })

  return router
}
