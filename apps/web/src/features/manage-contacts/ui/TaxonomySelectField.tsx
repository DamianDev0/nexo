'use client'

import { Controller } from 'react-hook-form'

import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { Label } from '@/shared/ui/shadcn/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select'

import type { ContactFormValues } from '../model/contact-form.schema'
import type { TaxonomyChoice } from '@/entities/contact-taxonomy'
import type { Control } from 'react-hook-form'

interface TaxonomySelectFieldProps {
  readonly control: Control<ContactFormValues>
  readonly name: 'status' | 'source'
  readonly label: string
  readonly placeholder?: string
  readonly choices: ReadonlyArray<TaxonomyChoice>
}

export function TaxonomySelectField({
  control,
  name,
  label,
  placeholder,
  choices,
}: Readonly<TaxonomySelectFieldProps>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <Label className="text-xs text-muted-foreground">{label}</Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="mt-1.5 h-10! w-full border-border bg-surface-input text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {choices.map((choice) => (
                <SelectItem key={choice.key} value={choice.key}>
                  <span className="flex items-center gap-2">
                    <ColorDot color={choice.color} />
                    {choice.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  )
}
