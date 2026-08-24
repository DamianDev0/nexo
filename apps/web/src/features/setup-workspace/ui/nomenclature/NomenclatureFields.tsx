'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { Button } from '@/shared/ui/shadcn/button'
import { SmoothInput as Input } from '@/shared/ui/smoothui/input'

import { NOMENCLATURE_ENTITIES, NOMENCLATURE_PRESETS } from '../../config/nomenclature.constants'

import type { TenantNomenclature } from '@repo/shared-types'

interface NomenclatureFieldsProps {
  readonly data: TenantNomenclature
  readonly onUpdate: (
    entity: keyof TenantNomenclature,
    field: 'singular' | 'plural',
    value: string,
  ) => void
  readonly onPreset: (key: string) => void
}

export function NomenclatureFields({
  data,
  onUpdate,
  onPreset,
}: Readonly<NomenclatureFieldsProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.nomenclature'

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        <div />
        <Text variant="kicker">{t(`${s}.singular`)}</Text>
        <Text variant="kicker">{t(`${s}.plural`)}</Text>

        {NOMENCLATURE_ENTITIES.map(({ key, icon: Icon }) => (
          <div key={key} className="contents">
            <div className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <Text variant="emphasis" className="text-muted-foreground">
                {t(`${s}.defaults.${key}`)}
              </Text>
            </div>
            <Input
              className="h-9 text-sm"
              value={data[key].singular}
              onChange={(e) => onUpdate(key, 'singular', e.target.value)}
            />
            <Input
              className="h-9 text-sm"
              value={data[key].plural}
              onChange={(e) => onUpdate(key, 'plural', e.target.value)}
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
              onClick={() => onPreset(key)}
            >
              <Image src={preset.icon} alt="" width={18} height={18} className="size-4.5" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}
