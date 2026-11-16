// The M0 walk-through, in a simulated browser: open the router's address, see
// the login page with the Core version, sign in, see the dashboard.

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createMemoryHistory } from 'vue-router'

import type { Schemas } from '@/api/client'
import { createArouteApp } from '@/app'
import { setLocale } from '@/locales'

const INFO: Schemas['SystemInfo'] = {
  version: '9.8.7',
  api_version: 'v1',
  hostname: 'test-router',
  os: 'Fedora Linux 44',
  kernel: '7.2.15',
  uptime_seconds: 4 * 86_400 + 3 * 3_600,
  daemon_uptime_seconds: 95,
}

/** Replaces `fetch` with a Core that answers every request the same way. */
function stubCore(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(body, { status })),
  )
}

const opened: App[] = []

/** Starts the app at `path` and returns the element it rendered into. */
async function open(path: string) {
  const { app, router } = createArouteApp(createMemoryHistory())
  const page = document.createElement('div')
  document.body.append(page)

  await router.push(path)
  app.mount(page)
  opened.push(app)
  return { page, router }
}

// Unmounting stops the dashboard's periodic refresh, which would outlive the test.
afterEach(() => {
  for (const app of opened.splice(0)) app.unmount()
})

describe('the app', () => {
  it('shows the login page with the Core version, then the dashboard', async () => {
    setLocale('en')
    stubCore(200, INFO)

    const { page, router } = await open('/')

    expect(router.currentRoute.value.name).toBe('login')
    await vi.waitFor(() => expect(page.textContent).toContain('ARoute Core 9.8.7'))

    page.querySelector('form')?.requestSubmit()

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('dashboard'))
    await vi.waitFor(() => expect(page.textContent).toContain('test-router'))
    expect(page.textContent).toContain('4 d 3 h')
    expect(page.textContent).toContain('1 min 35 s')
  })

  it('sends any other address to the login page while signed out', async () => {
    stubCore(200, INFO)

    const { router } = await open('/somewhere/deep')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('speaks Russian after the language is switched', async () => {
    setLocale('ru')
    stubCore(200, INFO)

    const { page } = await open('/login')

    await vi.waitFor(() => expect(page.textContent).toContain('Пароль'))
    expect(document.documentElement.lang).toBe('ru')
  })

  it('says so when the Core does not answer', async () => {
    setLocale('en')
    stubCore(502, 'Bad Gateway')

    const { page } = await open('/login')

    // One retry with a one-second pause precedes the error state.
    await vi.waitFor(() => expect(page.textContent).toContain('ARoute Core is not responding'), {
      timeout: 5_000,
    })
  })
})
