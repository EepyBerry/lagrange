import { DateTime } from "luxon";
import { ref, type Ref } from "vue";

export const EXTRAS_CRT_EFFECT = ref(false);
export const EXTRAS_HOLOGRAM_EFFECT = ref(true);
export const EXTRAS_METAL_SLUG_MODE = ref(false);
export const EXTRAS_SPECIAL_DAYS = ref(true);
export const EXTRAS_CAT_MODE: Ref<boolean> = ref(false);

export type SpecialDayInfo = { emoji: string[]; translationKey: string; overlayMode?: number };

export function uwuifyPath(path: string): string {
  if (!EXTRAS_CAT_MODE.value) return path;
  return path + "?uwu";
}

// prettier-ignore
export function checkSpecialDay(): SpecialDayInfo | undefined {
  const now = DateTime.now();
  if (isDayOfMonth(now, 1, 1))              return { emoji: ['noto:confetti-ball'],                          translationKey: 'extras.day_newyear' };
  if (isDayOfMonth(now, 2, 14))             return { emoji: ['noto:heart-with-arrow'],                       translationKey: 'extras.day_valentines' };
  if (isDayOfMonth(now, 2, 27))             return { emoji: ['noto:strawberry'],                             translationKey: 'extras.day_strawberry' };
  if (isDayOfMonth(now, 3, 14))             return { emoji: ['noto:pie'],                                    translationKey: 'extras.day_pi' };
  if (isDayOfMonth(now, 3, 31))             return { emoji: ['noto:transgender-flag'],                       translationKey: 'extras.day_transvisibility' };
  if (isDayOfMonth(now, 4, 1))              return { emoji: ['noto:eye'],                                    translationKey: 'extras.overlay1', overlayMode: 1 };
  if (isDayOfMonth(now, 4, 6))              return { emoji: ['noto:purple-heart', 'noto:white-heart'],       translationKey: 'extras.day_acevisibility' };
  if (isDayOfMonth(now, 4, 26))             return { emoji: ['noto:orange-heart', 'noto:red-heart'],         translationKey: 'extras.day_lesbianvisibility' };
  if (isDayOfMonth(now, 5, 19))             return { emoji: ['noto:grey-heart', 'noto:green-heart'],         translationKey: 'extras.day_agenderawareness' };
  if (isDayOfMonth(now, 5, 24))             return { emoji: ['noto:revolving-hearts'],                       translationKey: 'extras.day_panawareness' };
  if (isDayOfMonth(now, 6, 5))              return { emoji: ['noto:green-heart', 'noto:white-heart'],        translationKey: 'extras.day_arovisibility' };
  if (isMonth(now, 6))                      return { emoji: ['noto:rainbow-flag'],                           translationKey: 'extras.month_pride' };
  if (isDayOfMonth(now, 7, 14))             return { emoji: ['noto:yellow-heart', 'noto:purple-heart'],      translationKey: 'extras.day_nonbinary' };
  if (isDayOfMonth(now, 7, 16))             return { emoji: ['noto:ringed-planet', 'noto:birthday-cake'],    translationKey: 'extras.day_firstrelease' };
  if (isDayOfMonthBetween(now, 9, 16, 22))  return { emoji: ['noto:crystal-ball'],                           translationKey: 'extras.week_biawareness' };
  if (isDayOfMonth(now, 9, 23))             return { emoji: ['noto:crystal-ball'],                           translationKey: 'extras.day_biawareness' };
  if (isDayOfMonth(now, 10, 8))             return { emoji: ['noto:orange-heart', 'noto:red-heart'],         translationKey: 'extras.day_lesbian' };
  if (isDayOfMonth(now, 10, 11))            return { emoji: ['noto:party-popper'],                           translationKey: 'extras.day_comingout' };
  if (isDayOfMonthBetween(now, 10, 17, 24)) return { emoji: ['noto:blue-heart', 'noto:pink-heart'],          translationKey: 'extras.week_genderfluidvisibility' };
  if (isDayOfMonth(now, 10, 26))            return { emoji: ['noto:yellow-circle'],                          translationKey: 'extras.day_intersexawareness' };
  if (isDayOfMonth(now, 10, 31))            return { emoji: ['noto:jack-o-lantern'],                         translationKey: 'extras.day_halloween' };
  if (isDayOfMonth(now, 11, 8))             return { emoji: ['noto:yellow-circle', 'noto:wilted-flower'],    translationKey: 'extras.day_intersexremembrance' };
  if (isDayOfMonthBetween(now, 11, 13, 19)) return { emoji: ['noto:transgender-flag'],                       translationKey: 'extras.week_transawareness' };
  if (isDayOfMonth(now, 11, 20))            return { emoji: ['noto:transgender-flag', 'noto:wilted-flower'], translationKey: 'extras.day_transremembrance' };
  if (isDayOfMonth(now, 11, 23))            return { emoji: ['noto:infinity'],                               translationKey: 'extras.day_polyamory' };
  return undefined
}

export function getSpecialOverlay(mode?: number): { [key: string]: boolean } | undefined {
  if (!mode) return;
  switch (mode) {
    case 1:
      return { "overlay-1": true };
  }
  return undefined;
}

// ----------------------------------------------------------------------------

const isMonth = (dt: DateTime, month: number) => dt.month === month;
const isDayOfMonth = (dt: DateTime, month: number, day: number) => dt.month === month && dt.day === day;
const isDayOfMonthBetween = (dt: DateTime, month: number, dayStart: number, dayEnd: number) =>
  dt.month === month && dt.day >= dayStart && dt.day <= dayEnd;
