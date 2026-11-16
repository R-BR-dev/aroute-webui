import Aura from '@primeuix/themes/aura'
import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import type { RouterHistory } from 'vue-router'

import App from './App.vue'
import { i18n } from './locales'
import { createAppRouter } from './router'

const queryOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      // The router is one hop away on the LAN: if a second attempt fails too, say so.
      queries: { retry: 1 },
    },
  },
}

/**
 * Assembles the application: root component plus every plugin it needs.
 *
 * `main.ts` mounts the result into the page; tests mount it into a detached
 * element with an in-memory `history`, and so exercise the same wiring.
 */
export function createArouteApp(history?: RouterHistory) {
  const app = createApp(App)
  const router = createAppRouter(history)

  app.use(createPinia()) // stores; before the router, whose guard reads the session
  app.use(router)
  app.use(i18n)
  app.use(PrimeVue, {
    // Light or dark follows the operating system's setting.
    theme: { preset: Aura, options: { darkModeSelector: 'system' } },
  })
  app.use(VueQueryPlugin, queryOptions)

  return { app, router }
}
