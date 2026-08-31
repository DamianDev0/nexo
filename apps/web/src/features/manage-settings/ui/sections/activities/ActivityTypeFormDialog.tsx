'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { ColorSwatchPicker } from '@/shared/ui/molecules/color-swatch-picker'
import { DialogActions } from '@/shared/ui/molecules/dialog-actions'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { DEFAULT_ACTIVITY_ICON } from '../../../config/activity-types.constants'
import { HEX_COLOR_PALETTE } from '../../../config/hex-palette.constants'

import { ActivityIconPicker } from './ActivityIconPicker'

import type { ActivityTypeFormValues } from '../../../lib/activity-type-edit'

interface ActivityTypeFormDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSubmit: (values: ActivityTypeFormValues) => void
}

export function ActivityTypeFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: Readonly<ActivityTypeFormDialogProps>) {
  const { t } = useTranslation()
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState(DEFAULT_ACTIVITY_ICON)
  const [color, setColor] = useState(HEX_COLOR_PALETTE[0] ?? '')
  const [trackDuration, setTrackDuration] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.activityTypes.createTitle')}</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit({ label, icon, color, trackDuration })
          }}
        >
          <div className="flex items-center gap-2">
            <ActivityIconPicker
              icon={icon}
              onChange={setIcon}
              label={t('settings.activityTypes.pickIcon')}
            />
            <ColorSwatchPicker
              color={color}
              colors={HEX_COLOR_PALETTE}
              onChange={setColor}
              label={t('settings.taxonomy.pickColor')}
            />
            <Input
              autoFocus
              value={label}
              placeholder={t('settings.activityTypes.namePlaceholder')}
              aria-label={t('settings.activityTypes.nameLabel')}
              className="h-9 flex-1"
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Text as="p" variant="strong">
                {t('settings.activityTypes.trackDuration')}
              </Text>
              <Text as="p" variant="hint">
                {t('settings.activityTypes.trackDurationHint')}
              </Text>
            </div>
            <AnimatedToggle
              size="sm"
              checked={trackDuration}
              label={t('settings.activityTypes.trackDuration')}
              onChange={setTrackDuration}
            />
          </div>

          <DialogActions>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={label.trim().length === 0}>
              {t('common.create')}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}
