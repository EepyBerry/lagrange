import { DateTime } from 'luxon'
import { ref, type Ref } from 'vue'

export type SpecialDayInfo = { emoji: string; translationKey: string }
export const EXTRAS_CAT_MODE: Ref<boolean> = ref(false)

export function uwuifyPath(path: string): string {
  if (!EXTRAS_CAT_MODE.value) return path
  return path + '?uwu'
}

// prettier-ignore
export function checkSpecialDay(): SpecialDayInfo | undefined {
  const now = DateTime.fromISO('2024-11-23')
  if (now.month === 1  && now.day === 1)                   return { emoji: 'noto:party-popper',      translationKey: 'extras.day_newyear' }
  if (now.month === 2  && now.day === 14)                  return { emoji: 'noto:heart-with-arrow',  translationKey: 'extras.day_valentines' }
  if (now.month === 2  && now.day === 27)                  return { emoji: 'noto:strawberry',        translationKey: 'extras.day_strawberry' }
  if (now.month === 3  && now.day === 14)                  return { emoji: 'noto:pie',               translationKey: 'extras.day_pi' }
  if (now.month === 3  && now.day === 31)                  return { emoji: 'noto:transgender-flag',  translationKey: 'extras.day_transvisibility' }
  if (now.month === 4  && now.day === 6)                   return { emoji: 'noto:spade-suit',        translationKey: 'extras.day_acevisibility' }
  if (now.month === 4  && now.day === 26)                  return { emoji: 'noto:orange-heart',      translationKey: 'extras.day_lesbianvisibility' }
  if (now.month === 5  && now.day === 19)                  return { emoji: 'noto:white-heart',       translationKey: 'extras.day_agenderawareness' }
  if (now.month === 5  && now.day === 24)                  return { emoji: 'noto:revolving-hearts',  translationKey: 'extras.day_panawareness' }
  if (now.month === 6  && now.day === 5)                   return { emoji: 'noto:green-heart',       translationKey: 'extras.day_arovisibility' }
  if (now.month === 6)                                     return { emoji: 'noto:rainbow-flag',      translationKey: 'extras.month_pride' }
  if (now.month === 7  && now.day === 14)                  return { emoji: 'noto:yellow-heart',      translationKey: 'extras.day_nonbinary' }
  if (now.month === 7  && now.day === 16)                  return { emoji: 'noto:birthday-cake',     translationKey: 'extras.day_firstrelease' }
  if (now.month === 9  && now.day >=  16 && now.day <= 22) return { emoji: 'noto:crystal-ball',      translationKey: 'extras.week_biawareness' }
  if (now.month === 9  && now.day === 23)                  return { emoji: 'noto:crystal-ball',      translationKey: 'extras.day_biawareness' }
  if (now.month === 10 && now.day === 8)                   return { emoji: 'noto:orange-heart',      translationKey: 'extras.day_lesbian' }
  if (now.month === 10 && now.day === 11)                  return { emoji: 'noto:party-popper',      translationKey: 'extras.day_comingout' }
  if (now.month === 10 && now.day >=  17 && now.day <= 24) return { emoji: 'noto:blue-heart',        translationKey: 'extras.week_genderfluidvisibility' }
  if (now.month === 10 && now.day === 26)                  return { emoji: 'noto:yellow-circle',     translationKey: 'extras.day_intersexawareness' }
  if (now.month === 10 && now.day === 31)                  return { emoji: 'noto:jack-o-lantern',    translationKey: 'extras.day_halloween' }
  if (now.month === 11 && now.day === 8)                   return { emoji: 'noto:yellow-circle',     translationKey: 'extras.day_intersexremembrance' }
  if (now.month === 11 && now.day >=  13 && now.day <= 19) return { emoji: 'noto:transgender-flag',  translationKey: 'extras.week_transawareness' }
  if (now.month === 11 && now.day === 20)                  return { emoji: 'noto:transgender-flag',  translationKey: 'extras.day_transremembrance' }
  if (now.month === 11 && now.day === 23)                  return { emoji: 'noto:infinity',          translationKey: 'extras.day_polyamory' }
  return undefined
}
