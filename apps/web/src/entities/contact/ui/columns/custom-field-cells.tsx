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
  parseCustomValue,
  withCustomField,
} from '../../lib/custom-field-edit'
import { ContactBooleanFieldCell } from '../cells/ContactBooleanFieldCell'
import { ContactChoiceCell } from '../cells/ContactChoiceCell'
import { ContactDateFieldCell } from '../cells/ContactDateFieldCell'
import { ContactTextFieldCell } from '../cells/ContactTextFieldCell'

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

function badgesOf(def: ContactColumnDef, value: unknown): ReactNode {
  const badges = customFieldBadges(def, value)
  if (badges.length === 0) return <DataTable.CellText>{null}</DataTable.CellText>
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

function selectRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  const options = (def.fieldOptions ?? []).map((option) => ({
    key: option.value,
    label: option.label,
    color: option.color,
  }))
  return function renderCustomSelectField(contact, { actions, labels }) {
    const raw = contact.customFields?.[fieldKey]
    const onChange = actions?.onCustomFieldsChange
    return (
      <ContactChoiceCell
        label={labels.choice.pick(customFieldLabel(def, fieldKey))}
        selection={{
          value: typeof raw === 'string' ? raw : null,
          options,
          clearLabel: labels.choice.clear,
          onChange: onChange
            ? (next) => onChange(contact.id, withCustomField(contact.customFields, fieldKey, next))
            : undefined,
        }}
      >
        {badgesOf(def, raw)}
      </ContactChoiceCell>
    )
  }
}

function textRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  const numeric = def.fieldType === 'number' || def.fieldType === 'currency'
  return function renderCustomTextField(contact, { t, actions, labels }) {
    const raw = contact.customFields?.[fieldKey]
    const onChange = actions?.onCustomFieldsChange
    return (
      <ContactTextFieldCell
        field={customFieldLabel(def, fieldKey)}
        value={{
          raw: raw === null || raw === undefined ? '' : String(raw),
          display: customFieldDisplay(def, raw, t).text,
          numeric,
        }}
        labels={labels.editable}
        onSave={
          onChange
            ? (next) =>
                onChange(
                  contact.id,
                  withCustomField(contact.customFields, fieldKey, parseCustomValue(next, numeric)),
                )
            : undefined
        }
      />
    )
  }
}

function displayRenderer(def: ContactColumnDef, fieldKey: string): ContactCellRenderer {
  return function renderCustomField(contact, { t }) {
    const value = contact.customFields?.[fieldKey]
    if (def.fieldType === 'multiselect') return badgesOf(def, value)
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
    case 'select':
      return selectRenderer(def, fieldKey)
    case 'text':
    case 'number':
    case 'currency':
      return textRenderer(def, fieldKey)
    default:
      return displayRenderer(def, fieldKey)
  }
}
