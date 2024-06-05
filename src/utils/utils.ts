export function extractChanges<T>(prev: T, current: T): Partial<T> {
  const changes = {} as Partial<T>
  for (const prop in prev) {
    if (prev[prop] !== current[prop]) {
      changes[prop] = current[prop]
    }
  }
  return changes
}
