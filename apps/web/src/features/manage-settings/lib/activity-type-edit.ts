import { slugifyTaxonomyKey } from './taxonomy-edit'

import type { ActivityTypeDef } from '@repo/shared-types'

export type ActivityTypeFormValues = {
  label: string
  icon: string
  color: string
  trackDuration: boolean
}

const ACTIVITY_KEY_MAX = 30

function uniqueActivityKey(label: string, taken: ReadonlySet<string>): string {
  const root = slugifyTaxonomyKey(label, taken).slice(0, ACTIVITY_KEY_MAX).replace(/_+$/, '')
  if (!taken.has(root)) return root

  for (let suffix = 2; ; suffix += 1) {
    const stem = root.slice(0, ACTIVITY_KEY_MAX - String(suffix).length - 1).replace(/_+$/, '')
    const candidate = `${stem}_${suffix}`
    if (!taken.has(candidate)) return candidate
  }
}

export function buildActivityType(
  values: ActivityTypeFormValues,
  existing: ReadonlyArray<ActivityTypeDef>,
): ActivityTypeDef {
  const taken = new Set(existing.map((type) => type.key))
  return {
    key: uniqueActivityKey(values.label, taken),
    label: values.label.trim(),
    icon: values.icon,
    color: values.color,
    trackDuration: values.trackDuration,
    isSystem: false,
  }
}

export type ActivityTypePatch = Partial<Omit<ActivityTypeDef, 'key' | 'isSystem'>>

export function withActivityPatch(def: ActivityTypeDef, patch: ActivityTypePatch): ActivityTypeDef {
  const next = { ...def, ...patch }
  return { ...next, label: next.label.trim() }
}
