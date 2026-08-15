import { formatDateShortCO } from '@repo/shared-utils'

import { DataTable } from '@/shared/ui/organisms/data-table'

import { ContactNameCell, ContactStatusCell, ContactTagsCell } from './contact-cells'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'

export type ContactTaxonomyMaps = {
  readonly statusByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly sourceByKey: ReadonlyMap<string, TaxonomyChoice>
  readonly typeByKey: ReadonlyMap<string, TaxonomyChoice>
}

export type ContactColumnContext = {
  readonly t: TFunction
  readonly taxonomy: ContactTaxonomyMaps
}

export type ContactCellRenderer = (
  contact: ContactListItem,
  context: ContactColumnContext,
) => ReactNode

function text(value: string | number | null): ReactNode {
  return <DataTable.CellText>{value}</DataTable.CellText>
}

function muted(value: string | null): ReactNode {
  return <DataTable.CellText muted>{value}</DataTable.CellText>
}

function numeric(value: string | number | null): ReactNode {
  return <DataTable.CellText numeric>{value}</DataTable.CellText>
}

function labelFor(map: ReadonlyMap<string, TaxonomyChoice>, key: string | null): string | null {
  if (!key) return null
  return map.get(key)?.label ?? key
}

const RENDERERS: Readonly<Record<string, ContactCellRenderer>> = {
  name: (contact) => <ContactNameCell contact={contact} />,
  status: (contact, { taxonomy }) => (
    <ContactStatusCell status={contact.status} choice={taxonomy.statusByKey.get(contact.status)} />
  ),
  tags: (contact, { t }) => (
    <ContactTagsCell tags={contact.tags} label={(count) => t('contacts.tagCount', { count })} />
  ),
  phone: (contact) => numeric(contact.phone),
  whatsapp: (contact) => numeric(contact.whatsapp),
  documentNumber: (contact) => numeric(contact.documentNumber),
  leadScore: (contact) => numeric(contact.leadScore),
  city: (contact) => muted(contact.city),
  source: (contact, { taxonomy }) => muted(labelFor(taxonomy.sourceByKey, contact.source)),
  type: (contact, { taxonomy }) =>
    muted(contact.typeLabel ?? labelFor(taxonomy.typeByKey, contact.type)),
  lifecycleStage: (contact, { t }) =>
    text(
      t(`contacts.lifecycleStage.${contact.lifecycleStage}`, {
        defaultValue: contact.lifecycleStage,
      }),
    ),
  lastContactedAt: (contact) =>
    numeric(contact.lastContactedAt ? formatDateShortCO(contact.lastContactedAt) : null),
  createdAt: (contact) => numeric(formatDateShortCO(contact.createdAt)),
}

export function contactCellRenderer(key: string): ContactCellRenderer {
  return RENDERERS[key] ?? ((contact) => text(Reflect.get(contact, key) as string | null))
}
