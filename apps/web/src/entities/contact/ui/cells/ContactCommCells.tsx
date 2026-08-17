import {
  CopyIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  ProhibitIcon,
  WarningCircleIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'

import {
  contactDocumentLabel,
  contactMailHref,
  contactPhoneLabel,
  contactTelHref,
  contactWaHref,
  isValidContactDocument,
  sameCOPhone,
} from '../../lib/contact-links'

import type { CommCellLabels, DocumentCellLabels } from '../../model/types/contact-cells.types'
import type { DocumentType } from '@repo/shared-types'

type CommCellProps = {
  readonly value: string | null
  readonly labels: CommCellLabels
  readonly onCopy?: (value: string) => void
  readonly dense?: boolean
  readonly blocked?: boolean
}

function OptOutHint({ label }: Readonly<{ label?: string }>) {
  if (label === undefined) return null

  return (
    <DataTable.CellHint hint={label}>
      <ProhibitIcon className="size-3.5 text-warning-deep" />
    </DataTable.CellHint>
  )
}

type ContactPhoneCellProps = {
  readonly value: string | null
  readonly whatsapp: string | null
  readonly labels: CommCellLabels
  readonly onCopy?: (value: string) => void
  readonly dense?: boolean
}

export function ContactPhoneCell({
  value,
  whatsapp,
  labels,
  onCopy,
  dense,
}: Readonly<ContactPhoneCellProps>) {
  const number = value ?? whatsapp
  if (!number) return <DataTable.CellText>{null}</DataTable.CellText>

  const display = contactPhoneLabel(number)
  const reachableOnWhatsApp = whatsapp !== null && sameCOPhone(number, whatsapp)

  return (
    <DataTable.CellFrame dense={dense} numeric display={display}>
      <DataTable.CellAction label={labels.action} href={contactTelHref(number)}>
        <PhoneIcon />
      </DataTable.CellAction>
      <DataTable.CellAction label={labels.copy} onClick={() => onCopy?.(display)}>
        <CopyIcon />
      </DataTable.CellAction>
      {reachableOnWhatsApp && (
        <WhatsappLogoIcon aria-hidden className="size-3.5 self-center text-faint" />
      )}
    </DataTable.CellFrame>
  )
}

export function ContactWhatsAppCell({
  value,
  labels,
  onCopy,
  dense,
  blocked,
}: Readonly<CommCellProps>) {
  if (!value) return <DataTable.CellText>{null}</DataTable.CellText>
  const display = contactPhoneLabel(value)

  return (
    <DataTable.CellFrame dense={dense} numeric display={display}>
      {!blocked && (
        <DataTable.CellAction label={labels.action} href={contactWaHref(value)} external>
          <WhatsappLogoIcon />
        </DataTable.CellAction>
      )}
      <DataTable.CellAction label={labels.copy} onClick={() => onCopy?.(display)}>
        <CopyIcon />
      </DataTable.CellAction>
      {blocked && <OptOutHint label={labels.blocked} />}
    </DataTable.CellFrame>
  )
}

export function ContactEmailCell({
  value,
  labels,
  onCopy,
  dense,
  blocked,
}: Readonly<CommCellProps>) {
  if (!value) return <DataTable.CellText>{null}</DataTable.CellText>

  return (
    <DataTable.CellFrame dense={dense} display={value}>
      {!blocked && (
        <DataTable.CellAction label={labels.action} href={contactMailHref(value)}>
          <EnvelopeSimpleIcon />
        </DataTable.CellAction>
      )}
      <DataTable.CellAction label={labels.copy} onClick={() => onCopy?.(value)}>
        <CopyIcon />
      </DataTable.CellAction>
      {blocked && <OptOutHint label={labels.blocked} />}
    </DataTable.CellFrame>
  )
}

type ContactDocumentCellProps = {
  readonly value: string | null
  readonly docType: DocumentType | null
  readonly labels: DocumentCellLabels
  readonly onCopy?: (value: string) => void
  readonly dense?: boolean
}

export function ContactDocumentCell({
  value,
  docType,
  labels,
  onCopy,
  dense,
}: Readonly<ContactDocumentCellProps>) {
  if (!value) return <DataTable.CellText>{null}</DataTable.CellText>

  return (
    <DataTable.CellFrame dense={dense} numeric display={contactDocumentLabel(docType, value)}>
      <DataTable.CellAction label={labels.copy} onClick={() => onCopy?.(value)}>
        <CopyIcon />
      </DataTable.CellAction>
      {!isValidContactDocument(docType, value) && (
        <DataTable.CellHint hint={labels.invalid}>
          <WarningCircleIcon className="size-3.5 text-warning-deep" />
        </DataTable.CellHint>
      )}
    </DataTable.CellFrame>
  )
}
