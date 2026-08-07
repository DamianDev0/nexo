import { TAXONOMY_KEY_PATTERN, taxonomyColorAt } from '@repo/shared-types'
import { normalizeText } from '@repo/shared-utils'

import type { ContactTaxonomy, TaxonomyOption } from '@repo/shared-types'

export type TaxonomyKind = keyof ContactTaxonomy

const MAX_KEY_LENGTH = 40

export function slugifyTaxonomyKey(label: string, taken: ReadonlySet<string>): string {
  const base = normalizeText(label)
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replace(/^[^a-z]+/, '')
    .replace(/_+$/, '')
    .slice(0, MAX_KEY_LENGTH)

  const root = TAXONOMY_KEY_PATTERN.test(base) ? base : `option_${base}`.slice(0, MAX_KEY_LENGTH)
  if (!taken.has(root)) return root

  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${root.slice(0, MAX_KEY_LENGTH - String(suffix).length - 1)}_${suffix}`
    if (!taken.has(candidate)) return candidate
  }
}

export function reindexOptions(options: ReadonlyArray<TaxonomyOption>): TaxonomyOption[] {
  return options.map((option, index) => ({ ...option, order: index + 1 }))
}

export function appendOption(
  options: ReadonlyArray<TaxonomyOption>,
  label: string,
): TaxonomyOption[] {
  const taken = new Set(options.map((option) => option.key))
  return reindexOptions([
    ...options,
    {
      key: slugifyTaxonomyKey(label, taken),
      label: label.trim(),
      color: taxonomyColorAt(options.length),
      order: 0,
      isSystem: false,
    },
  ])
}

export function patchOption(
  options: ReadonlyArray<TaxonomyOption>,
  key: string,
  patch: Partial<Pick<TaxonomyOption, 'label' | 'color'>>,
): TaxonomyOption[] {
  return options.map((option) => (option.key === key ? { ...option, ...patch } : option))
}

export function removeOption(
  options: ReadonlyArray<TaxonomyOption>,
  key: string,
): TaxonomyOption[] {
  return reindexOptions(options.filter((option) => option.key !== key || option.isSystem))
}

export function reorderOptions(
  options: ReadonlyArray<TaxonomyOption>,
  fromKey: string,
  toKey: string,
): TaxonomyOption[] {
  const fromIndex = options.findIndex((option) => option.key === fromKey)
  const toIndex = options.findIndex((option) => option.key === toKey)
  if (fromIndex === -1 || toIndex === -1) return [...options]
  const next = [...options]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return [...options]
  next.splice(toIndex, 0, moved)
  return reindexOptions(next)
}
