import type { Tag } from '@repo/shared-types'

export type TagOption = {
  readonly name: string
  readonly color: string | null
  readonly description: string | null
  readonly selected: boolean
}

type TagMeta = { readonly color: string | null; readonly description: string | null }

type BuildTagOptionsArgs = {
  readonly catalog: ReadonlyMap<string, Tag>
  readonly names?: readonly string[]
  readonly onlyNames?: boolean
  readonly selected: ReadonlySet<string>
  readonly query: string
}

const NO_META: TagMeta = { color: null, description: null }

export function buildTagOptions({
  catalog,
  names = [],
  onlyNames = false,
  selected,
  query,
}: BuildTagOptionsArgs): readonly TagOption[] {
  const byName = new Map<string, TagMeta>()
  if (!onlyNames) {
    for (const tag of catalog.values()) {
      byName.set(tag.name, { color: tag.color, description: tag.description })
    }
  }
  for (const name of names) {
    if (byName.has(name)) continue
    const known = catalog.get(name.toLowerCase())
    byName.set(name, known ? { color: known.color, description: known.description } : NO_META)
  }
  const q = query.trim().toLowerCase()
  return [...byName.entries()]
    .filter(([name]) => q === '' || name.toLowerCase().includes(q))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, meta]) => ({ name, ...meta, selected: selected.has(name) }))
}

export function toggleName(current: ReadonlySet<string>, name: string): ReadonlySet<string> {
  const next = new Set(current)
  if (next.has(name)) next.delete(name)
  else next.add(name)
  return next
}
