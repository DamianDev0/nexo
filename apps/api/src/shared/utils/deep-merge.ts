/**
 * Recursively deep-merges `source` into `target`.
 * Arrays and primitives from `source` overwrite those in `target`.
 * Object values are merged recursively.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sv = source[key]
    const tv = result[key]
    if (sv && typeof sv === 'object' && !Array.isArray(sv) && tv && typeof tv === 'object') {
      result[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      ) as T[keyof T]
    } else if (sv !== undefined) {
      result[key] = sv as T[keyof T]
    }
  }
  return result
}
