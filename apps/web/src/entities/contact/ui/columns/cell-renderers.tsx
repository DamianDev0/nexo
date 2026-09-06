import { TruncateTip } from '@/shared/ui/molecules/truncate-tip'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { commCellActions } from '../../lib/comm-actions'
import { buildContactCellLabels } from '../../lib/contact-cell-labels'
import { taxonomyLabel } from '../../lib/contact-taxonomy-label'
import {
  ContactDocumentCell,
  ContactEmailCell,
  ContactPhoneCell,
  ContactWhatsAppCell,
} from '../cells/ContactCommCells'
import { ContactNameCell } from '../cells/ContactNameCell'
import { ContactTagsCell } from '../cells/ContactTagsCell'
import {
  ContactCreatedCell,
  ContactRelativeCell,
  ContactStageCell,
  ContactStatusCell,
} from '../cells/ContactValueCells'
import { ContactNotesCell } from '../containers/ContactNotesHoverCard'

import type {
  ContactColumnContext,
  ContactRenderContext,
} from '../../model/types/contact-cells.types'
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
  notes: (contact, { actions, labels }) => (
    <ContactNotesCell contact={contact} labels={labels.name.notes} onAddNote={actions?.onAddNote} />
  ),
  phone: (contact, { actions, dense, labels }) => (
    <ContactPhoneCell
      value={contact.phone}
      whatsapp={contact.whatsapp}
      labels={labels.phone}
      actions={commCellActions(actions, 'sms', contact)}
      dense={dense}
    />
  ),
  whatsapp: (contact, { actions, dense, labels }) => (
    <ContactWhatsAppCell
      value={contact.whatsapp}
      labels={labels.whatsapp}
      actions={commCellActions(actions, 'whatsapp', contact)}
      dense={dense}
      blocked={contact.optedOutChannels.includes('whatsapp')}
    />
  ),
  email: (contact, { actions, dense, labels }) => (
    <ContactEmailCell
      value={contact.email}
      labels={labels.email}
      actions={commCellActions(actions, 'email', contact)}
      dense={dense}
      blocked={contact.optedOutChannels.includes('email')}
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
  city: (contact) =>
    contact.city ? (
      <TruncateTip className="text-muted-foreground">{contact.city}</TruncateTip>
    ) : (
      muted(null)
    ),
  source: (contact, { taxonomy }) => muted(taxonomyLabel(taxonomy.sourceByKey, contact.source)),
  lifecycleStage: (contact, { taxonomy }) => (
    <ContactStageCell
      label={
        taxonomyLabel(taxonomy.lifecycleByKey, contact.lifecycleStage) ?? contact.lifecycleStage
      }
    />
  ),
  lastContactedAt: (contact, { locale, labels }) => (
    <ContactRelativeCell iso={contact.lastContactedAt} locale={locale} staleLabel={labels.stale} />
  ),
  createdAt: (contact, { locale }) => (
    <ContactCreatedCell iso={contact.createdAt} locale={locale} />
  ),
}

export function contactCellRenderer(key: string): ContactCellRenderer {
  return RENDERERS[key] ?? ((contact) => text(Reflect.get(contact, key) as string | null))
}
