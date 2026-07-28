'use client'

import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'

interface SaveBarProps {
  readonly onSave: () => void
  readonly isPending: boolean
}

export function SaveBar({ onSave, isPending }: Readonly<SaveBarProps>) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={onSave} disabled={isPending} className="min-w-28">
        {isPending ? t('common.saving') : t('common.save')}
      </Button>
    </div>
  )
}
