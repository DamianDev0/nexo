import type { ConfirmDialogCopy } from '@/shared/ui/molecules/confirm-dialog'
import type { TFunction } from 'i18next'

type ArchiveTarget = {
  readonly name: string
  readonly entity: string
  readonly openDeals: number
}

export function buildArchiveCopy(t: TFunction, target: ArchiveTarget): ConfirmDialogCopy {
  return {
    title: t('contacts.archive.confirm.title', { entity: target.entity }),
    description:
      target.openDeals > 0
        ? t('contacts.archive.confirm.descriptionWithDeals', {
            name: target.name,
            count: target.openDeals,
          })
        : t('contacts.archive.confirm.description', { name: target.name }),
    confirmLabel: t('contacts.archive.confirm.action'),
    cancelLabel: t('common.cancel'),
  }
}
