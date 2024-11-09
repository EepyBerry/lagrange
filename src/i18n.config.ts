import { createI18n } from 'vue-i18n'

import enUS from '@assets/i18n/en-US.json'
import enUwU from '@assets/i18n/en-UwU.json'
import frFR from '@assets/i18n/fr-FR.json'

const I18N_SUPPORTED_LANGS = ['en', 'en-US', 'en-UwU', 'fr', 'fr-FR'] as const

type IntlSchema = typeof enUS
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
  },
})

export { I18N_SUPPORTED_LANGS, type IntlSupportedLangs, i18n }
