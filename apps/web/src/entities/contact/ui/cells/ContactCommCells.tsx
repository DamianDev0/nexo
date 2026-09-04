import {
  ChatTextIcon,
  CopyIcon,
  EnvelopeSimpleIcon,
  WarningCircleIcon,
  WhatsappLogoIcon,
} from '@/shared/ui/icons'
import { DataTable } from '@/shared/ui/organisms/data-table'

import { callAction, copyAction } from '../../lib/comm-action-items'
import {
  contactDocumentLabel,
  contactMailHref,
  contactPhoneLabel,
  contactWaHref,
  isValidContactDocument,
} from '../../lib/contact-links'

import { OptOutHint } from './OptOutHint'

import type {
  CommCellActions,
  CommCellLabels,
  DocumentCellLabels,
} from '../../model/types/contact-cells.types'
import type { ActionDockItem } from '@/shared/ui/molecules/action-dock'
import type { DocumentType } from '@repo/shared-types'

type CommCellProps = {
  readonly value: string | null
  readonly labels: CommCellLabels
  readonly actions?: CommCellActions
  readonly dense?: boolean
  readonly blocked?: boolean
}

type ContactPhoneCellProps = {
  readonly value: string | null
  readonly whatsapp: string | null
  readonly labels: CommCellLabels
  readonly actions?: CommCellActions
  readonly dense?: boolean
}

export function ContactPhoneCell({
  value,
  whatsapp,
  labels,
  actions,
  dense,
}: Readonly<ContactPhoneCellProps>) {
  const number = value ?? whatsapp
  if (!number) return <DataTable.CellText>{null}</DataTable.CellText>

  const display = contactPhoneLabel(number)
  const items: ActionDockItem[] = [callAction(number, labels.action, actions?.onCall)]
  if (actions?.onCompose && labels.compose) {
    items.push({
      id: 'compose',
      label: labels.compose,
      icon: <ChatTextIcon />,
      onClick: actions.onCompose,
    })
  }
  items.push(copyAction(labels.copy, display, actions))

  return (
    <DataTable.CellFrame
      dense={dense}
      numeric
      display={display}
      actions={{ label: labels.menu, items }}
    />
  )
}

export function ContactWhatsAppCell({
  value,
  labels,
  actions,
  dense,
  blocked,
}: Readonly<CommCellProps>) {
  if (!value) return <DataTable.CellText>{null}</DataTable.CellText>
  const display = contactPhoneLabel(value)

  const items: ActionDockItem[] = []
  if (!blocked) {
    items.push(
      actions?.onCompose
        ? {
            id: 'send',
            label: labels.action,
            icon: <WhatsappLogoIcon />,
            onClick: actions.onCompose,
          }
        : {
            id: 'send',
            label: labels.action,
            icon: <WhatsappLogoIcon />,
            href: contactWaHref(value),
            external: true,
          },
    )
  }
  items.push(copyAction(labels.copy, display, actions))

  return (
    <DataTable.CellFrame
      dense={dense}
      numeric
      display={display}
      hint={blocked && <OptOutHint label={labels.blocked} />}
      actions={{ label: labels.menu, items }}
    />
  )
}

export function ContactEmailCell({
  value,
  labels,
  actions,
  dense,
  blocked,
}: Readonly<CommCellProps>) {
  if (!value) return <DataTable.CellText>{null}</DataTable.CellText>

  const items: ActionDockItem[] = []
  if (!blocked) {
    items.push(
      actions?.onCompose
        ? {
            id: 'send',
            label: labels.action,
            icon: <EnvelopeSimpleIcon />,
            onClick: actions.onCompose,
          }
        : {
            id: 'send',
            label: labels.action,
            icon: <EnvelopeSimpleIcon />,
            href: contactMailHref(value),
          },
    )
  }
  items.push(copyAction(labels.copy, value, actions))

  return (
    <DataTable.CellFrame
      dense={dense}
      display={value}
      hint={blocked && <OptOutHint label={labels.blocked} />}
      actions={{ label: labels.menu, items }}
    />
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
    <DataTable.CellFrame
      dense={dense}
      numeric
      display={contactDocumentLabel(docType, value)}
      hint={
        !isValidContactDocument(docType, value) && (
          <DataTable.CellHint hint={labels.invalid}>
            <WarningCircleIcon className="size-3.5 text-warning-deep" />
          </DataTable.CellHint>
        )
      }
      actions={{
        label: labels.menu,
        items: [
          { id: 'copy', label: labels.copy, icon: <CopyIcon />, onClick: () => onCopy?.(value) },
        ],
      }}
    />
  )
}
