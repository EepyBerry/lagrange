export function extractChanges<T>(prev: T, current: T): Partial<T> {
  const changes = {} as Partial<T>
  for (const prop in prev) {
    if (prev[prop] !== current[prop]) {
      changes[prop] = current[prop]
    }
  }
  return changes
}

export function hasAnyProperty(obj: any, paramsToCheck: string[]) {
  return Object.keys(obj).some(v => paramsToCheck.includes(v));
}