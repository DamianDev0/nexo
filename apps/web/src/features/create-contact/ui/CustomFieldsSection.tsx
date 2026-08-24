'use client'

import { useTranslation } from 'react-i18next'

import { FieldLabel } from '@/shared/ui/atoms/field-label'
import { FieldError } from '@/shared/ui/molecules/field-error'

import { CustomFieldInput } from './CustomFieldInput'

import type { FieldDef } from '@repo/shared-types'

interface CustomFieldsSectionProps {
  readonly data: {
    readonly defs: ReadonlyArray<FieldDef>
    readonly values: Readonly<Record<string, unknown>>
    readonly errors: Readonly<Record<string, string>>
    readonly setValue: (key: string, value: unknown) => void
  }
}

export function CustomFieldsSection({ data }: Readonly<CustomFieldsSectionProps>) {
  const { t } = useTranslation()

  if (data.defs.length === 0) return null

  return (
    <section className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-sm font-semibold text-foreground">{t('contacts.form.customFields')}</p>
      {data.defs.map((def) => (
        <div key={def.key} className="flex flex-col gap-1">
          <FieldLabel>
            {def.label}
            {def.required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          <CustomFieldInput
            def={def}
            value={data.values[def.key]}
            onChange={(value) => data.setValue(def.key, value)}
          />
          <FieldError message={data.errors[def.key]} />
        </div>
      ))}
    </section>
  )
}
