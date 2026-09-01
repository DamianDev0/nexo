'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'

interface ContactDuplicateNoticeProps {
  readonly notice: { readonly message: string; readonly canForce: boolean } | null
  readonly isEdit: boolean
  readonly onConfirm: () => void
  readonly onDismiss: () => void
}

export function ContactDuplicateNotice({
  notice,
  isEdit,
  onConfirm,
  onDismiss,
}: Readonly<ContactDuplicateNoticeProps>) {
  const { t } = useTranslation()

  if (!notice) return null

  return (
    <div
      role="alert"
      className="mt-3.5 flex flex-col gap-2 rounded-md border border-border bg-surface-input px-3.5 py-2.5"
    >
      <Text as="p">{notice.message}</Text>
      <div className="flex items-center justify-end gap-2">
        <PillButton variant="ghost" size="sm" onClick={onDismiss}>
          {t('contacts.duplicates.dismiss')}
        </PillButton>
        {notice.canForce && (
          <PillButton variant="ghost" size="sm" onClick={onConfirm}>
            {t(isEdit ? 'contacts.duplicates.saveAnyway' : 'contacts.duplicates.createAnyway')}
          </PillButton>
        )}
      </div>
    </div>
  )
}
