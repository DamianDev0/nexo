'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { NOMENCLATURE_ENTITIES, NOMENCLATURE_PRESETS } from '@/features/setup-workspace'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

import { useManageSettings } from '../../model/settings-context'

export function NomenclatureSettings() {
  const { t } = useTranslation()
  const s = 'onboarding.steps.nomenclature'
  const { nomenclature } = useManageSettings()

  return (
    <div className="max-w-3xl">
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        <div />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.singular`)}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${s}.plural`)}
        </span>

        {NOMENCLATURE_ENTITIES.map(({ key, icon: Icon }) => (
          <div key={key} className="contents">
            <div className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold capitalize text-muted-foreground">{key}</span>
            </div>
            <Input
              className="h-9 text-sm"
              value={nomenclature.nomen[key].singular}
              onChange={(e) => nomenclature.handleUpdate(key, 'singular', e.target.value)}
            />
            <Input
              className="h-9 text-sm"
              value={nomenclature.nomen[key].plural}
              onChange={(e) => nomenclature.handleUpdate(key, 'plural', e.target.value)}
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
    </div>
  )
}
