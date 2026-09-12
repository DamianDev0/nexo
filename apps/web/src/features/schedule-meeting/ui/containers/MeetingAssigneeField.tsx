'use client'

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { buildOwnerOptions, useTeamMembers } from '@/entities/team-member'
import { AssigneePicker } from '@/shared/ui/molecules/assignee-picker'

type MeetingAssigneeFieldProps = {
  readonly value: string
  readonly onChange: (assignedToId: string) => void
}

export function MeetingAssigneeField({ value, onChange }: Readonly<MeetingAssigneeFieldProps>) {
  const { t } = useTranslation()
  const members = useTeamMembers()
  const options = useMemo(() => buildOwnerOptions(t, members), [t, members])

  return (
    <AssigneePicker
      value={value.length > 0 ? value : null}
      options={options}
      onChange={(assignedToId) => onChange(assignedToId ?? '')}
      labels={{
        trigger: t('contacts.composers.meeting.assignee'),
        search: t('contacts.preview.owner.search'),
        empty: t('contacts.preview.owner.empty'),
        unassign: t('contacts.preview.owner.unassign'),
      }}
    />
  )
}
