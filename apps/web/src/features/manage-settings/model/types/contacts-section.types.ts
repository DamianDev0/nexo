import type { Tag, TaxonomyOption } from '@repo/shared-types'

export interface TaxonomyRowActions {
  readonly onPatch: (key: string, patch: Partial<Pick<TaxonomyOption, 'label' | 'color'>>) => void
  readonly onRemove: (key: string) => void
}

export interface TagRowActions {
  readonly onUpdate: (input: { id: string; name?: string; color?: string }) => void
  readonly onRemove: (tag: Tag) => void
}
