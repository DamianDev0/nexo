import { DataTable } from '@/shared/ui/organisms/data-table'

import { commCellActions } from '../../lib/comm-actions'
import { buildContactCellLabels } from '../../lib/contact-cell-labels'
import { ContactCityCell } from '../cells/ContactCityCell'
import {
  ContactDocumentCell,
  ContactEmailCell,
  ContactPhoneCell,
  ContactWhatsAppCell,
} from '../cells/ContactCommCells'
import { ContactNameCell } from '../cells/ContactNameCell'
import { ContactOwnerCell } from '../cells/ContactOwnerCell'
import { ContactTagsCell } from '../cells/ContactTagsCell'
import {
  ContactCreatedCell,
  ContactRelativeCell,
  ContactStatusCell,
  ContactTaxonomyCell,
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
  tags: (contact, { tagsByName, labels, actions }) => (
    <ContactTagsCell
      tags={contact.tags}
      labels={labels.tags}
      byName={tagsByName}
      onEdit={actions?.onEditTags ? () => actions.onEditTags?.(contact) : undefined}
    />
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
  city: (contact, { actions, labels }) => (
    <ContactCityCell
      value={contact.city}
      labels={labels.city}
      onSelect={
        actions?.onFieldsChange
          ? ({ name, code }) =>
              actions.onFieldsChange?.(contact.id, { city: name, municipioCode: code })
          : undefined
      }
    />
  ),
  source: (contact, { taxonomy, sources, actions, labels }) => (
    <ContactTaxonomyCell
      value={contact.source}
      choice={taxonomy.sourceByKey.get(contact.source ?? '')}
      label={labels.choice.pick(labels.column('source'))}
      selection={{
        options: sources ?? [],
        clearLabel: labels.choice.clear,
        onChange: actions?.onFieldsChange
          ? (source) => actions.onFieldsChange?.(contact.id, { source: source ?? '' })
          : undefined,
      }}
    />
  ),
  assignedTo: (contact, { owners, actions, labels }) => (
    <ContactOwnerCell
      value={contact.assignedToId}
      name={contact.assignedToName ?? null}
      options={owners}
      labels={labels.owner}
      onChange={
        actions?.onAssign
          ? (assignedToId, assignedToName) =>
              actions.onAssign?.({ id: contact.id, assignedToId, assignedToName })
          : undefined
      }
    />
  ),
  lifecycleStage: (contact, { taxonomy, lifecycleStages, actions, labels }) => (
    <ContactTaxonomyCell
      value={contact.lifecycleStage}
      choice={taxonomy.lifecycleByKey.get(contact.lifecycleStage ?? '')}
      label={labels.choice.pick(labels.column('lifecycleStage'))}
      selection={{
        options: lifecycleStages ?? [],
        onChange: actions?.onFieldsChange
          ? (stage) => {
              if (stage !== null) actions.onFieldsChange?.(contact.id, { lifecycleStage: stage })
            }
          : undefined,
      }}
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
