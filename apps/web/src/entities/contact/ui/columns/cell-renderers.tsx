import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'
import { formatDateShortCO } from '@repo/shared-utils'

import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { CONTACT_SCORE_LABEL_KEY } from '../../config/contact-columns.constants'
import { buildContactCellLabels } from '../../lib/contact-cell-labels'
import { contactPlaceLabel } from '../../lib/contact-display'
import { contactScoreBand } from '../../lib/contact-links'
import {
  ContactDocumentCell,
  ContactEmailCell,
  ContactPhoneCell,
  ContactWhatsAppCell,
} from '../cells/ContactCommCells'
import { ContactNameCell } from '../cells/ContactNameCell'
import { ContactTagsCell } from '../cells/ContactTagsCell'
import {
  ContactRelativeCell,
  ContactScoreCell,
  ContactStageCell,
  ContactStatusCell,
} from '../cells/ContactValueCells'

import type {
  ContactColumnContext,
  ContactRenderContext,
} from '../../model/types/contact-cells.types'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ContactCellRenderer = (contact: ContactListItem, context: ContactRenderContext) => ReactNode

export function withContactCellLabels(context: ContactColumnContext): ContactRenderContext {
  return { ...context, labels: buildContactCellLabels(context.t) }
}

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

function customFieldText(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value)) return value.map((item) => customFieldText(item) ?? '').join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return typeof value === 'string' ? value : JSON.stringify(value)
}

const RENDERERS: Readonly<Record<string, ContactCellRenderer>> = {
  name: (contact, { dense, actions, tagsByName, labels }) => (
    <ContactNameCell
      contact={contact}
      dense={dense}
      tagsByName={tagsByName}
      labels={labels.name}
      actions={actions}
    />
  ),
  status: (contact, { taxonomy, locale, statuses, actions }) => (
    <ContactStatusCell
      contact={contact}
      choice={taxonomy.statusByKey.get(contact.status)}
      options={statuses ?? []}
      locale={locale}
      onChange={actions?.onStatusChange}
    />
  ),
  tags: (contact, { tagsByName, labels }) => (
    <ContactTagsCell tags={contact.tags} labels={labels.tags} byName={tagsByName} />
  ),
  phone: (contact, { actions, dense, labels }) => (
    <ContactPhoneCell
      value={contact.phone}
      whatsapp={contact.whatsapp}
      labels={labels.phone}
      onCopy={actions?.onCopy}
      dense={dense}
    />
  ),
  whatsapp: (contact, { actions, dense, labels }) => (
    <ContactWhatsAppCell
      value={contact.whatsapp}
      labels={labels.whatsapp}
      onCopy={actions?.onCopy}
      dense={dense}
      blocked={contact.optOutWhatsapp}
    />
  ),
  email: (contact, { actions, dense, labels }) => (
    <ContactEmailCell
      value={contact.email}
      labels={labels.email}
      onCopy={actions?.onCopy}
      dense={dense}
      blocked={contact.optOutEmail}
    />
  ),
  documentNumber: (contact, { actions, dense, labels }) => (
    <ContactDocumentCell
      value={contact.documentNumber}
      docType={contact.documentType}
      labels={labels.document}
      onCopy={actions?.onCopy}
      dense={dense}
    />
  ),
  leadScore: (contact, { t }) => (
    <ContactScoreCell
      score={contact.leadScore}
      bandLabel={t(CONTACT_SCORE_LABEL_KEY[contactScoreBand(contact.leadScore)], {
        score: contact.leadScore,
      })}
    />
  ),
  city: (contact) =>
    contact.city ? (
      <TruncateTip
        className="text-muted-foreground"
        hint={contact.department ? contactPlaceLabel(contact.city, contact.department) : undefined}
      >
        {contact.city}
      </TruncateTip>
    ) : (
      muted(null)
    ),
  source: (contact, { taxonomy }) => muted(labelFor(taxonomy.sourceByKey, contact.source)),
  type: (contact, { taxonomy }) =>
    muted(contact.typeLabel ?? labelFor(taxonomy.typeByKey, contact.type)),
  lifecycleStage: (contact, { taxonomy }) => (
    <ContactStageCell
      label={labelFor(taxonomy.lifecycleByKey, contact.lifecycleStage) ?? contact.lifecycleStage}
    />
  ),
  lastContactedAt: (contact, { locale, labels }) => (
    <ContactRelativeCell iso={contact.lastContactedAt} locale={locale} staleLabel={labels.stale} />
  ),
  createdAt: (contact) => numeric(formatDateShortCO(contact.createdAt)),
}

export function contactCellRenderer(key: string): ContactCellRenderer {
  if (key.startsWith(CUSTOM_COLUMN_PREFIX)) {
    const fieldKey = key.slice(CUSTOM_COLUMN_PREFIX.length)
    return (contact) => text(customFieldText(contact.customFields?.[fieldKey]))
  }
  return RENDERERS[key] ?? ((contact) => text(Reflect.get(contact, key) as string | null))
}
