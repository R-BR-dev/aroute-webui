import { describe, expect, it } from 'vitest'

import en from '../en.json'
import { detectLocale } from '../index'
import ru from '../ru.json'

/** `{ a: { b: 'x' }, c: 'y' }` → `['a.b', 'c']` */
function keysOf(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  )
}

describe('locale files', () => {
  it('have the same messages in English and Russian', () => {
    expect(keysOf(ru).sort()).toEqual(keysOf(en).sort())
  })
})

describe('detectLocale', () => {
  it('prefers the language chosen earlier', () => {
    expect(detectLocale('ru', ['en-US'])).toBe('ru')
  })

  it('falls back to the first browser language ARoute has', () => {
    expect(detectLocale(null, ['de-DE', 'ru-RU', 'en'])).toBe('ru')
  })

  it('uses English when nothing matches', () => {
    expect(detectLocale(null, ['de-DE', 'fr'])).toBe('en')
    expect(detectLocale('klingon', [])).toBe('en')
  })
})
