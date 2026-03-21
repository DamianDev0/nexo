export type FieldMap<T> = Array<[keyof T & string, string]>

export function validateFieldMap<T extends Record<string, unknown>>(
  map: FieldMap<T>,
  dtoSample: T,
): string[] {
  const mappedKeys = new Set(map.map(([k]) => k))
  return Object.keys(dtoSample).filter((k) => !mappedKeys.has(k))
}
