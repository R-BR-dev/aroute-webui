import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'

import { openapiMock } from './mock/openapi-mock.ts'

/** Absolute path of a file next to this one, wherever the command was started from. */
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// Where `npm run dev` forwards API requests: a running arouted.
const CORE_URL = process.env.AROUTE_CORE_URL ?? 'http://127.0.0.1:8080'

export default defineConfig(({ mode }) => ({
  // `npm run dev:mock` answers /api from openapi.json instead of a real Core.
  plugins: [vue(), mode === 'mock' && openapiMock(here('./openapi.json'))],

  resolve: {
    alias: {
      '@': here('./src'),
    },
  },

  server: {
    proxy: mode === 'mock' ? undefined : { '/api': CORE_URL },
  },

  build: {
    // Not `dist`: that directory holds the source tarball and the RPMs.
    outDir: 'build',
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    exclude: [...configDefaults.exclude, 'build/**', 'dist/**'],
  },
}))
