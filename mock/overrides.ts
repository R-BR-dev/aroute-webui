// Realistic values for the mock API where the API description gives no example.
//
// Keyed by `operationId`; each entry is merged over the generated response.
// The types come from the same generated file the app uses, so an entry that no
// longer fits the API fails `npm run type-check`.

import type { components } from '../src/api/schema'

type Schemas = components['schemas']

const info: Partial<Schemas['SystemInfo']> = {
  hostname: 'aroute',
  kernel: '7.2.15-200.fc44.x86_64',
  uptime_seconds: 4 * 86_400 + 3 * 3_600 + 12 * 60,
  daemon_uptime_seconds: 84 * 60,
}

export const overrides: Record<string, object> = { info }
