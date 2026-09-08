'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildOwnerOptions, useTeamMembers } from '@/entities/team-member'
import { AssigneePicker } from '@/shared/ui/molecules/assignee-picker'

import type { ContactOwnerChange } from '@/entities/contact'
import type { ContactListItem } from '@repo/shared-types'

type ContactOwnerPickerProps = {
  readonly contact: ContactListItem
  readonly onAssign: (change: ContactOwnerChange) => void
}

export function ContactOwnerPicker({ contact, onAssign }: Readonly<ContactOwnerPickerProps>) {
  const { t } = useTranslation()
  const members = useTeamMembers()
  const options = useMemo(() => buildOwnerOptions(t, members), [t, members])

  return (
    <AssigneePicker
      value={contact.assignedToId}
      options={options}
      onChange={(assignedToId) =>
        onAssign({
          id: contact.id,
          assignedToId,
          assignedToName: options.find((option) => option.id === assignedToId)?.name ?? null,
        })
      }
      labels={{
        trigger: t('contacts.preview.owner.trigger'),
        search: t('contacts.preview.owner.search'),
        empty: t('contacts.preview.owner.empty'),
        unassign: t('contacts.preview.owner.unassign'),
      }}
    />
  )
}
