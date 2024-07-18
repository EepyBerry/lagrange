import { createI18n } from 'vue-i18n'

import enUS from '@assets/i18n/en-US.json'
import enUwU from '@assets/i18n/en-UwU.json'

type IntlSchema = typeof enUS
type IntlSupportedLangs = 'en' | 'en-US' | 'en-UwU'

const i18n = createI18n<[IntlSchema], IntlSupportedLangs>({
  legacy: false,
  fallbackLocale: 'en-US',
  messages: {
    en: enUS,
    'en-US': enUS,
    'en-UwU': enUwU,
  },
})

export { type IntlSupportedLangs, i18n }
