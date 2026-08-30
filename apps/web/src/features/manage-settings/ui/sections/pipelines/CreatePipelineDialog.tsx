'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { PIPELINE_NAME_MAX } from '../../../config/pipelines.constants'

interface CreatePipelineDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (name: string) => void
}

export function CreatePipelineDialog({
  open,
  onOpenChange,
  onSubmit,
}: Readonly<CreatePipelineDialogProps>) {
  const { t } = useTranslation()
  const [name, setName] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.pipelines.createTitle')}</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(name)
          }}
        >
          <Input
            autoFocus
            value={name}
            maxLength={PIPELINE_NAME_MAX}
            placeholder={t('settings.pipelines.namePlaceholder')}
            aria-label={t('settings.pipelines.nameLabel')}
            onChange={(event) => setName(event.target.value)}
          />
          <Text as="p" variant="hint">
            {t('settings.pipelines.createHint')}
          </Text>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={name.trim().length === 0}>
              {t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
