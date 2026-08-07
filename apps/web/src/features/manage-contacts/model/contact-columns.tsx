import { formatDateCO } from '@repo/shared-utils'

import { contactAvatarTone, contactFullName, contactInitials } from '@/entities/contact'
import { AvatarSquircle } from '@/shared/ui/atoms/avatar-squircle'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { DotsThreeIcon } from '@/shared/ui/icons'
import { DataTable, selectionColumn } from '@/shared/ui/organisms/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu'

import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { ContactListItem } from '@repo/shared-types'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

export interface ContactRowHandlers {
  onEdit: (contact: ContactListItem) => void
  onArchive: (contact: ContactListItem) => void
}

export function buildContactColumns(
  t: TFunction,
  handlers: ContactRowHandlers,
  statusByKey: ReadonlyMap<string, TaxonomyChoice>,
): ReadonlyArray<ColumnDef<ContactListItem, unknown>> {
  return [
    selectionColumn<ContactListItem>(),
    {
      id: 'name',
      accessorFn: contactFullName,
      header: t('contacts.columns.name'),
      size: 250,
      cell: ({ row }) => (
        <span className="flex items-center gap-3">
          <AvatarSquircle
            initials={contactInitials(row.original)}
            tone={contactAvatarTone(row.original.id)}
          />
          <DataTable.RowTitle
            title={contactFullName(row.original)}
            subtitle={row.original.email ?? '—'}
          />
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: t('contacts.columns.status'),
      size: 140,
      cell: ({ row }) => {
        const choice = statusByKey.get(row.original.status)
        return <BadgeSoft color={choice?.color}>{choice?.label ?? row.original.status}</BadgeSoft>
      },
    },
    {
      id: 'phone',
      accessorFn: (row) => row.phone ?? row.whatsapp ?? '—',
      header: t('contacts.columns.phone'),
      size: 150,
    },
    {
      id: 'city',
      accessorFn: (row) => row.city ?? '—',
      header: t('contacts.columns.city'),
      size: 120,
    },
    {
      id: 'createdAt',
      accessorFn: (row) => formatDateCO(row.createdAt),
      header: t('contacts.columns.created'),
      size: 110,
    },
    {
      id: 'actions',
      size: 48,
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <PillButton variant="ghost" size="sm" aria-label={t('contacts.actions.open')}>
              <DotsThreeIcon className="size-4" />
            </PillButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlers.onEdit(row.original)}>
              {t('contacts.actions.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handlers.onArchive(row.original)}
            >
              {t('contacts.actions.archive')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
