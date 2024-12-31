import { createI18n } from 'vue-i18n'

import enUS from '@assets/i18n/en-US.json'
import enUwU from '@assets/i18n/en-UwU.json'
import frFR from '@assets/i18n/fr-FR.json'
import deDE from '@assets/i18n/de-DE.json'

const I18N_SUPPORTED_LANGS = ['en', 'en-US', 'en-UwU', 'fr', 'fr-FR', 'de', 'de-DE'] as const

/**
 * Base i18n schema template (derived from {@linkcode enUS en-US} file)
 */
type IntlSchema = typeof enUS

/**
 * String literal type derived from {@linkcode I18N_SUPPORTED_LANGS}
 * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
 */
type IntlSupportedLangs = (typeof I18N_SUPPORTED_LANGS)[number]

const i18n = createI18n<[IntlSchema], IntlSupportedLangs>({
  legacy: false,
  fallbackLocale: 'en-US',
  warnHtmlMessage: false,
  messages: {
    en: enUS,
    'en-US': enUS,
    'en-UwU': enUwU,

    fr: frFR,
    'fr-FR': frFR,

    de: deDE,
    'de-DE': deDE,
  },
})

export { I18N_SUPPORTED_LANGS, type IntlSupportedLangs, i18n }
