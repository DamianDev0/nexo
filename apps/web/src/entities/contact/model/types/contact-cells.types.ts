import type { ContactRequiredField } from '../../lib/contact-completeness'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { AssigneeOption, AssigneePickerLabels } from '@/shared/ui/molecules/assignee-picker'
import type { ContactActivity, ContactInput, ContactListItem, Tag } from '@repo/shared-types'
import type { TFunction } from 'i18next'

export type TagsCellLabels = {
  readonly title: string
  readonly count: (total: number) => string
  readonly add?: string
}

export type ChoiceCellLabels = {
  readonly pick: (field: string) => string
  readonly clear: string
}

export type EditableCellLabels = {
  readonly edit: (field: string) => string
  readonly save: string
  readonly cancel: string
}

export type CityCellLabels = {
  readonly field: string
  readonly placeholder: string
}

export type NextActivityCellLabels = {
  readonly overdue: string
  readonly kind: (kind: string) => string
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

export type RowMenuLabels = {
  readonly open: string
  readonly call: string
  readonly sms: string
  readonly email: string
  readonly task: string
  readonly meeting: string
}

export type ContactNameLabels = {
  readonly preview: string
  readonly addNote: string
  readonly editTags: string
  readonly restore: string
  readonly rowMenu: string
  readonly menu: RowMenuLabels
  readonly missing: (fields: ReadonlyArray<ContactRequiredField>) => string | null
  readonly tags: TagsCellLabels
  readonly notes: NotesCellLabels
}

export type ContactComposeChannel = 'email' | 'sms' | 'whatsapp'

export type ContactLogKind = 'task' | 'meeting'

export type ContactFieldsPatch = Partial<
  Pick<
    ContactInput,
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'whatsapp'
    | 'documentNumber'
    | 'city'
    | 'municipioCode'
    | 'source'
    | 'lifecycleStage'
  >
>

export type ContactOwnerChange = {
  readonly id: string
  readonly assignedToId: string | null
  readonly assignedToName: string | null
}

export type ContactCellLabels = {
  readonly name: ContactNameLabels
  readonly phone: CommCellLabels
  readonly whatsapp: CommCellLabels
  readonly email: CommCellLabels
  readonly document: DocumentCellLabels
  readonly tags: TagsCellLabels
  readonly stale: string
  readonly saving: string
  readonly choice: ChoiceCellLabels
  readonly editable: EditableCellLabels
  readonly city: CityCellLabels
  readonly nextActivity: NextActivityCellLabels
  readonly owner: AssigneePickerLabels
  readonly column: (key: string) => string
}

export type ContactNameActions = {
  readonly onOpen?: (contact: ContactListItem) => void
  readonly onPreview?: (contact: ContactListItem) => void
  readonly onAddNote?: (contact: ContactListItem) => void
  readonly onEditTags?: (contact: ContactListItem) => void
  readonly onRestore?: (contact: ContactListItem) => void
}

export type ContactRowActions = ContactNameActions & {
  readonly onCopy?: (value: string) => void
  readonly onCall?: (number: string) => void
  readonly onCompose?: (channel: ContactComposeChannel, contact: ContactListItem) => void
  readonly onLogActivity?: (kind: ContactLogKind, contact: ContactListItem) => void
  readonly onToggleActivity?: (activity: ContactActivity) => void
  readonly onAssign?: (change: ContactOwnerChange) => void
  readonly onFieldsChange?: (contactId: string, patch: ContactFieldsPatch) => void
  readonly onStatusChange?: (contactId: string, status: string) => void
  readonly onCustomFieldsChange?: (contactId: string, customFields: Record<string, unknown>) => void
}

export type ContactTaxonomyMaps = {
  readonly statusByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly sourceByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly lifecycleByKey: ReadonlyMap<string, TaxonomyChoice>
}

export type ContactColumnContext = {
  readonly t: TFunction
  readonly taxonomy: ContactTaxonomyMaps
  readonly locale: string
  readonly entity?: string
  readonly dense?: boolean
  readonly statuses?: ReadonlyArray<TaxonomyChoice>
  readonly sources?: ReadonlyArray<TaxonomyChoice>
  readonly lifecycleStages?: ReadonlyArray<TaxonomyChoice>
  readonly owners?: ReadonlyArray<AssigneeOption>
  readonly pendingIds?: ReadonlySet<string>
  readonly actions?: ContactRowActions
  readonly tagsByName?: ReadonlyMap<string, Tag>
}

export type ContactRenderContext = ContactColumnContext & {
  readonly labels: ContactCellLabels
}
