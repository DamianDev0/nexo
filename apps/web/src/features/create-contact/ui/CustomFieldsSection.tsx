'use client'

import { useTranslation } from 'react-i18next'

import { Label } from '@/shared/ui/shadcn/label'

import { CustomFieldInput } from './CustomFieldInput'

import type { FieldDef } from '@repo/shared-types'

interface CustomFieldsSectionProps {
  readonly data: {
    readonly defs: ReadonlyArray<FieldDef>
    readonly values: Readonly<Record<string, unknown>>
    readonly setValue: (key: string, value: unknown) => void
  }
}

export function CustomFieldsSection({ data }: Readonly<CustomFieldsSectionProps>) {
  const { t } = useTranslation()

  if (data.defs.length === 0) return null

  return (
    <section className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('contacts.form.customFields')}
      </p>
      {data.defs.map((def) => (
        <div key={def.key} className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">{def.label}</Label>
          <CustomFieldInput
            def={def}
            value={data.values[def.key]}
            onChange={(value) => data.setValue(def.key, value)}
          />
        </div>
      ))}
    </section>
  )
}
