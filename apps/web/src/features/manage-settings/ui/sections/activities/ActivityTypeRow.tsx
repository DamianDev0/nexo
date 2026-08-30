'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import { TrashIcon } from '@/shared/ui/icons'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { LockedHint } from '@/shared/ui/molecules/locked-hint'
import { SwatchRow } from '@/shared/ui/molecules/swatch-row'
import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { HEX_COLOR_PALETTE } from '../../../config/hex-palette.constants'

import { ActivityIconPicker } from './ActivityIconPicker'

import type { ActivityTypeRowActions } from '../../../model/types'
import type { ActivityTypeDef } from '@repo/shared-types'

interface ActivityTypeRowProps {
  readonly type: ActivityTypeDef
  readonly actions: ActivityTypeRowActions
}

export function ActivityTypeRow({ type, actions }: Readonly<ActivityTypeRowProps>) {
  const { t } = useTranslation()

  return (
    <SwatchRow
      swatch={{
        color: type.color,
        colors: HEX_COLOR_PALETTE,
        onChange: (color) => actions.onPatch(type.key, { color }),
        label: t('settings.taxonomy.pickColor'),
      }}
      leading={
        <ActivityIconPicker
          icon={type.icon}
          onChange={(icon) => actions.onPatch(type.key, { icon })}
          label={t('settings.activityTypes.pickIcon')}
        />
      }
      name={
        <Input
          key={`${type.key}:${type.label}`}
          defaultValue={type.label}
          aria-label={t('settings.activityTypes.nameLabel')}
          className="h-8 flex-1 bg-background text-sm font-medium"
          onBlur={(event) => {
            const value = event.target.value.trim()
            if (value.length > 0 && value !== type.label) {
              actions.onPatch(type.key, { label: value })
            }
          }}
        />
      }
      trailing={
        <>
          <HintTooltip asChild hint={t('settings.activityTypes.trackDurationHint')}>
            <div className="flex items-center">
              <AnimatedToggle
                size="sm"
                checked={type.trackDuration}
                label={t('settings.activityTypes.trackDuration')}
                onChange={(trackDuration) => actions.onPatch(type.key, { trackDuration })}
              />
            </div>
          </HintTooltip>
          {type.isSystem ? (
            <LockedHint hint={t('settings.activityTypes.systemHint')} />
          ) : (
            <PillButton
              variant="ghostDanger"
              size="xs"
              aria-label={t('settings.activityTypes.remove')}
              onClick={() => actions.onRemove(type.key)}
            >
              <TrashIcon className="size-3.5" />
            </PillButton>
          )}
        </>
      }
    />
  )
}
