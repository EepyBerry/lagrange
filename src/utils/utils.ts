export function extractChanges<T>(prev: T, current: T): Partial<T> {
  const changes = {} as Partial<any>
  for (const prop in prev) {
    if (typeof prev[prop] === 'object') {
      changes[prop] = extractChanges(prev[prop], current[prop])
    } else if (prev[prop] !== current[prop]) {
      changes[prop] = current[prop]
    }
  }
  return changes
}

export function hasAnyProperty(obj: any, paramsToCheck: string[]): boolean {
  return Object.keys(obj).some(v => paramsToCheck.includes(v));
}

