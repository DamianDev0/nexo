'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { NOMENCLATURE_PRESETS } from '@/features/setup-workspace'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { useManageSettings } from '../../model/settings-context'
import { SaveBar } from '../SaveBar'

import type { TenantNomenclature } from '@repo/shared-types'

export function NomenclatureSettings() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.nomenclature'
  const { nomenclature } = useManageSettings()

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        <div />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.singular`)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.plural`)}
        </span>

        {(Object.keys(nomenclature.nomen) as Array<keyof TenantNomenclature>).map((entity) => (
          <div key={entity} className="contents">
            <span className="text-xs font-semibold capitalize text-muted-foreground">{entity}</span>
            <Input
              className="h-9 text-sm"
              value={nomenclature.nomen[entity].singular}
              onChange={(e) => nomenclature.handleUpdate(entity, 'singular', e.target.value)}
            />
            <Input
              className="h-9 text-sm"
              value={nomenclature.nomen[entity].plural}
              onChange={(e) => nomenclature.handleUpdate(entity, 'plural', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{t(`${s}.quickPresets`)}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(NOMENCLATURE_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => nomenclature.handlePreset(key)}
            >
              <Image src={preset.icon} alt="" width={18} height={18} className="size-4.5" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <SaveBar onSave={nomenclature.handleSave} isPending={nomenclature.isPending} />
    </div>
  )
}
