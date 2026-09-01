'use client'

import { formatDateTimeCO, timeAgo } from '@repo/shared-utils'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { cn } from '@/shared/lib/cn'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { BadgeSoft } from '@/shared/ui/atoms/badge-soft'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/sheet'

import { CONTACT_TAG_CHIP } from '../config/contact-columns.constants'
import { contactAvatarUrl, contactFullName } from '../lib/contact-display'
import { buildContactPreviewRows } from '../lib/contact-preview'

import type { ContactTaxonomyMaps } from '../model/types/contact-cells.types'
import type { ContactListItem } from '@repo/shared-types'

type ContactPreviewSheetProps = {
  readonly contact: ContactListItem | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onEdit?: (contact: ContactListItem) => void
  readonly taxonomy: ContactTaxonomyMaps
}

export function ContactPreviewSheet({
  contact,
  open,
  onOpenChange,
  onEdit,
  taxonomy,
}: Readonly<ContactPreviewSheetProps>) {
  const { t, i18n } = useTranslation()
  const terms = useEntityTerms('contact')
  if (!contact) return null

  const name = contactFullName(contact)
  const status = taxonomy.statusByKey.get(contact.status)
  const rows = buildContactPreviewRows(t, contact)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-sm">
        <SheetHeader className="gap-3 border-b border-border px-6 pb-5 pt-6">
          <span className="flex items-center gap-3">
            <Avatar size="lg" variant="soft" className="size-12 rounded-full">
              <Avatar.Image src={contactAvatarUrl(contact)} alt="" className="bg-muted" />
              <Avatar.Fallback aria-label={name} className="bg-muted" />
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <SheetTitle className="truncate text-base font-semibold tracking-tight">
                {name}
              </SheetTitle>
              <SheetDescription className="truncate text-xs text-muted-foreground">
                {contact.jobTitle ?? terms.singular}
              </SheetDescription>
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <Text variant="body" className="inline-flex items-center gap-1.5">
              {status?.color && <ColorDot color={status.color} />}
              {status?.label ?? contact.status}
              {contact.statusChangedAt && (
                <Text variant="faint">{timeAgo(contact.statusChangedAt, i18n.language)}</Text>
              )}
            </Text>
            <BadgeSoft tone="outline">
              {taxonomy.lifecycleByKey.get(contact.lifecycleStage)?.label ?? contact.lifecycleStage}
            </BadgeSoft>
          </span>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <dl className="flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row.key} className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{row.label}</dt>
                <dd className={cn('text-sm', row.value ? 'text-body' : 'text-faint')}>
                  {row.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>

          {contact.tags.length > 0 && (
            <span className="mt-4 flex flex-wrap gap-1">
              {contact.tags.map((tag) => (
                <span key={tag} className={CONTACT_TAG_CHIP}>
                  {tag}
                </span>
              ))}
            </span>
          )}

          <Text variant="hint" className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
            {contact.lastContactedAt && (
              <HintTooltip asChild hint={formatDateTimeCO(contact.lastContactedAt)}>
                <span>
                  {t('contacts.preview.lastContacted', {
                    when: timeAgo(contact.lastContactedAt, i18n.language),
                  })}
                </span>
              </HintTooltip>
            )}
            <span>
              {t('contacts.preview.createdAt', {
                when: timeAgo(contact.createdAt, i18n.language),
              })}
            </span>
          </Text>
        </div>

        {onEdit && (
          <SheetFooter className="border-t border-border px-6 py-4">
            <PillButton size="md" onClick={() => onEdit(contact)}>
              {t('contacts.preview.openFull', { entity: terms.lowerSingular })}
            </PillButton>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
