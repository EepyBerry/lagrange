import { ref, type Ref } from 'vue'

export const EXTRAS_CAT_MODE: Ref<boolean> = ref(false)

export function uwuifyPath(path: string): string {
  if (!EXTRAS_CAT_MODE.value) return path
  return path + '?uwu'
}