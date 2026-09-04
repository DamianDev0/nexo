import { CUSTOM_COLUMN_PREFIX } from '@repo/shared-types'

import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { DataTable } from '@/shared/ui/organisms/data-table'

import {
  customFieldBadges,
  customFieldDisplay,
  customFieldLabel,
} from '../../lib/custom-field-display'
import {
  customFieldDatePart,
  nextCustomFieldDate,
  withCustomField,
} from '../../lib/custom-field-edit'
import { ContactBooleanFieldCell } from '../cells/ContactBooleanFieldCell'
import { ContactDateFieldCell } from '../cells/ContactDateFieldCell'

import type { ContactRenderContext } from '../../model/types/contact-cells.types'
import type { ContactColumnDef, ContactListItem } from '@repo/shared-types'
import type { ReactNode } from 'react'

type ContactCellRenderer = (contact: ContactListItem, context: ContactRenderContext) => ReactNode

function dateRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  return function renderCustomDateField(contact, { t, locale, actions }) {
    const raw = contact.customFields?.[fieldKey]
    const onChange = actions?.onCustomFieldsChange
    return (
      <ContactDateFieldCell
        value={customFieldDatePart(raw)}
        display={customFieldDisplay(def, raw, t).text}
        locale={locale}
        label={customFieldLabel(def, fieldKey)}
        onSave={
          onChange
            ? (iso) => {
                const next = nextCustomFieldDate(def.fieldType, raw, iso)
                onChange(contact.id, withCustomField(contact.customFields, fieldKey, next))
              }
            : undefined
        }
      />
    )
  }
}

function booleanRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  return function renderCustomBooleanField(contact, { actions }) {
    const onChange = actions?.onCustomFieldsChange
    return (
      <ContactBooleanFieldCell
        checked={contact.customFields?.[fieldKey] === true}
        label={customFieldLabel(def, fieldKey)}
        onSave={
          onChange
            ? (checked) =>
                onChange(contact.id, withCustomField(contact.customFields, fieldKey, checked))
            : undefined
        }
      />
    )
  }
}

function displayRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  return function renderCustomField(contact, { t }) {
    const value = contact.customFields?.[fieldKey]
    const badges = customFieldBadges(def, value)
    if (badges.length > 0) {
      return (
        <span className="flex items-center gap-1 overflow-hidden">
          {badges.map((badge) => (
            <BadgeSoft key={badge.label} color={badge.color}>
              {badge.label}
            </BadgeSoft>
          ))}
        </span>
      )
    }
    const display = customFieldDisplay(def, value, t)
    return <DataTable.CellText numeric={display.numeric}>{display.text}</DataTable.CellText>
  }
}

export function customFieldCellRenderer(def: ContactColumnDef): ContactCellRenderer {
  const fieldKey = def.key.slice(CUSTOM_COLUMN_PREFIX.length)
  switch (def.fieldType) {
    case 'date':
    case 'datetime':
      return dateRenderer(def, fieldKey)
    case 'boolean':
      return booleanRenderer(def, fieldKey)
    default:
      return displayRenderer(def, fieldKey)
  }
}
