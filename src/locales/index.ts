import { createI18n } from 'vue-i18n'

import en from './en.json'
import ru from './ru.json'

/** The shape every locale file must have. English is the reference. */
export type MessageSchema = typeof en

export const LOCALES = ['en', 'ru'] as const
export type Locale = (typeof LOCALES)[number]

// Lets editors complete message keys in `t('…')`.
declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}

const STORAGE_KEY = 'aroute.locale'

function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale)
}

/**
 * Picks the interface language: the one chosen earlier, otherwise the first of
 * the browser's preferred languages that ARoute has, otherwise English.
 *
 * `preferred` holds language tags such as `ru-RU`; only the language part counts.
 */
export function detectLocale(stored: string | null, preferred: readonly string[]): Locale {
  if (isLocale(stored)) return stored
  for (const tag of preferred) {
    const language = tag.toLowerCase().split('-')[0]
    if (isLocale(language)) return language
  }
  return 'en'
}

// The type arguments: every locale has the shape of `MessageSchema`, the locales
// are exactly `Locale`, and `false` selects the Composition API (`useI18n()`).
export const i18n = createI18n<[MessageSchema], Locale, false>({
  legacy: false,
  locale: detectLocale(localStorage.getItem(STORAGE_KEY), navigator.languages),
  fallbackLocale: 'en',
  messages: { en, ru },
})

/** Switches the interface language and remembers the choice in this browser. */
export function setLocale(locale: Locale): void {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

document.documentElement.lang = i18n.global.locale.value
