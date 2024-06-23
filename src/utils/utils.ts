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

// https://stackoverflow.com/questions/72557387/rgb-to-greyscale-converter
export function rgbToGrayscale(hex: string) {
  return '#' + Array(4).join(
    Math.round(
      [.3,.59,.11].reduce((a,v,i)=> a + v*parseInt(hex[2*i+1] + hex[2*i+2], 16), 0) / 3
    )
      .toString(16)
      .padStart(2,'0')
  );
}

export function endsWithAny(suffixes: string[], str: string) {
  return suffixes.some(s => str.endsWith(s))
}

export function numberToHex(n: number): string {
  return "#" + (n & 0x00FFFFFF).toString(16).padStart(6, '0')
}
