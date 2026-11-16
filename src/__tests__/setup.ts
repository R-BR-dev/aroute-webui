// Runs before every test file.

import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
  document.body.replaceChildren()
})
