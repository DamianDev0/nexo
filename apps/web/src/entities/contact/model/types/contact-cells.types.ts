import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem, Tag } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type TagsCellLabels = {
  readonly title: string
  readonly count: (total: number) => string
}

export type CommCellLabels = {
  readonly copy: string
  readonly action: string
  readonly menu: string
  readonly blocked?: string
  readonly compose?: string
}

export type CommCellActions = {
  readonly onCopy?: (value: string) => void
  readonly onCompose?: () => void
  readonly onCall?: (number: string) => void
}

export type DocumentCellLabels = {
  readonly copy: string
  readonly menu: string
  readonly invalid: string
}

export type NotesCellLabels = {
  readonly title: string
}

export type ContactNameLabels = {
  readonly preview: string
  readonly addNote: string
  readonly editTags: string
  readonly tags: TagsCellLabels
  readonly notes: NotesCellLabels
}

export type ContactComposeChannel = 'email' | 'sms' | 'whatsapp'

export type ContactCellLabels = {
  readonly name: ContactNameLabels
  readonly phone: CommCellLabels
  readonly whatsapp: CommCellLabels
  readonly email: CommCellLabels
  readonly document: DocumentCellLabels
  readonly tags: TagsCellLabels
  readonly stale: string
}

export type ContactNameActions = {
  readonly onOpen?: (contact: ContactListItem) => void
  readonly onPreview?: (contact: ContactListItem) => void
  readonly onAddNote?: (contact: ContactListItem) => void
  readonly onEditTags?: (contact: ContactListItem) => void
}

export type ContactRowActions = ContactNameActions & {
  readonly onCopy?: (value: string) => void
  readonly onCall?: (number: string) => void
  readonly onCompose?: (channel: ContactComposeChannel, contact: ContactListItem) => void
  readonly onStatusChange?: (contactId: string, status: string) => void
  readonly onCustomFieldsChange?: (contactId: string, customFields: Record<string, unknown>) => void
}

export type ContactTaxonomyMaps = {
  readonly statusByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly sourceByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly typeByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly lifecycleByKey: ReadonlyMap<string, TaxonomyChoice>
}

export type ContactColumnContext = {
  readonly t: TFunction
  readonly taxonomy: ContactTaxonomyMaps
  readonly locale: string
  readonly entity?: string
  readonly dense?: boolean
  readonly statuses?: ReadonlyArray<TaxonomyChoice>
  readonly actions?: ContactRowActions
  readonly tagsByName?: ReadonlyMap<string, Tag>
}

export type ContactRenderContext = ContactColumnContext & {
  readonly labels: ContactCellLabels
}
