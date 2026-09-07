'use client'

import { useTranslation } from 'react-i18next'

import { AlertMark } from '@/shared/ui/atoms/alert-mark'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { DotsThreeVerticalIcon } from '@/shared/ui/icons'
import { ActionMenu } from '@/shared/ui/molecules/action-menu'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { RecordDrawer } from '@/shared/ui/organisms/record-drawer'

import type { ContactRecord } from '../model/useContactRecord'
import type { ReactNode } from 'react'

type ContactRecordHeaderProps = {
  readonly record: ContactRecord
  readonly owner?: ReactNode
}

export function ContactRecordHeader({ record, owner }: Readonly<ContactRecordHeaderProps>) {
  const { t } = useTranslation()
  const { quickActions, status } = record

  return (
    <>
      <RecordDrawer.Identity
        avatar={
          <>
            <Avatar size="lg" variant="soft" className="rounded-xl border border-border bg-card">
              <Avatar.Image src={record.avatarUrl} alt="" className="bg-muted" />
              <Avatar.Fallback aria-label={record.name} className="bg-muted" />
            </Avatar>
            {record.missingHint ? (
              <AlertMark
                hint={record.missingHint}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-card p-0.5"
              />
            ) : null}
          </>
        }
        name={record.name}
        badge={
          <BadgeSoft tone="outline" size="sm">
            {status.lifecycle}
          </BadgeSoft>
        }
        end={owner}
        menu={
          quickActions.primary.menu ? (
            <ActionMenu items={quickActions.primary.menu} align="start">
              <HeaderIconButton aria-label={t('contacts.preview.quickActions.more')}>
                <DotsThreeVerticalIcon />
              </HeaderIconButton>
            </ActionMenu>
          ) : null
        }
      />
      <RecordDrawer.QuickActions
        items={quickActions.items}
        primary={quickActions.primary}
        label={t('contacts.preview.quickActions.label')}
      />
      <RecordDrawer.Highlight
        label={t('contacts.preview.statusLabel')}
        value={
          <>
            {status.color ? <ColorDot color={status.color} /> : null}
            <span className="truncate">{status.label}</span>
          </>
        }
        meta={status.sinceLabel}
      />
    </>
  )
}
