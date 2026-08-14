import type { Tag, TaxonomyOption } from '@repo/shared-types'

export interface OptionFormValues {
  readonly name: string
  readonly description: string
}

export interface ReassignCandidate {
  readonly key: string
  readonly label: string
  readonly color: string
}

export interface ReassignSource {
  readonly label: string
  readonly count: number
}

export type TaxonomyOptionPatch = Partial<
  Pick<TaxonomyOption, 'label' | 'color' | 'description' | 'enabled'>
>

export type TagPatch = {
  readonly id: string
  readonly name?: string
  readonly color?: string
  readonly description?: string
  readonly enabled?: boolean
}

export interface TaxonomyRowActions {
  readonly onPatch: (key: string, patch: TaxonomyOptionPatch) => void
  readonly onEdit: (key: string) => void
  readonly onRemove: (key: string) => void
}

export interface TagRowActions {
  readonly onUpdate: (input: TagPatch) => void
  readonly onEdit: (tag: Tag) => void
  readonly onRemove: (tag: Tag) => void
}
