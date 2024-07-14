import { createI18n } from "vue-i18n";

import enUS from "@assets/i18n/en-US.json"

type IntlSchema = typeof enUS
type IntlSupportedLangs = 'en-US'

const i18n = createI18n<[IntlSchema], IntlSupportedLangs>({
  fallbackLocale: 'en',
  messages: {
    'en-US': enUS,
  }
})

export default i18n