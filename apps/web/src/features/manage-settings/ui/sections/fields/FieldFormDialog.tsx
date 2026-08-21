'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { Input } from '@/shared/ui/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import { CREATABLE_FIELD_TYPES } from '../../../config/custom-fields.constants'

import type { CustomFieldType } from '@repo/shared-types'

interface FieldFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: { label: string; type: CustomFieldType }) => void
}

export function FieldFormDialog({ open, onOpenChange, onSubmit }: Readonly<FieldFormDialogProps>) {
  const { t } = useTranslation()
  const [label, setLabel] = useState('')
  const [type, setType] = useState<CustomFieldType>('text')

  const submit = () => {
    if (!label.trim()) return
    onSubmit({ label, type })
    setLabel('')
    setType('text')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.fields.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            autoFocus
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={t('settings.fields.namePlaceholder')}
            aria-label={t('settings.fields.nameLabel')}
          />

          <Select value={type} onValueChange={(value) => setType(value as CustomFieldType)}>
            <SelectTrigger aria-label={t('settings.fields.typeLabel')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREATABLE_FIELD_TYPES.map((fieldType) => (
                <SelectItem key={fieldType} value={fieldType}>
                  {t(`settings.fields.types.${fieldType}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" disabled={!label.trim()} onClick={submit}>
            {t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
