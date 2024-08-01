import { createI18n } from 'vue-i18n'

import enUS from '@assets/i18n/en-US.json'
import enUwU from '@assets/i18n/en-UwU.json'

const I18N_SUPPORTED_LANGS = ['en', 'en-US', 'en-UwU'] as const

type IntlSchema = typeof enUS
type IntlSupportedLangs = typeof I18N_SUPPORTED_LANGS[number]

const i18n = createI18n<[IntlSchema], IntlSupportedLangs>({
  legacy: false,
  fallbackLocale: 'en-US',
  messages: {
    en: enUS,
    'en-US': enUS,
    'en-UwU': enUwU,
  },
})

export { I18N_SUPPORTED_LANGS, type IntlSupportedLangs, i18n }
