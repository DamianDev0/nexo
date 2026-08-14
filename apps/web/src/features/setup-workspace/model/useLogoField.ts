'use client'

import { useCallback } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import type { AppearanceFormValues } from './types'
import type { FieldSetter } from '@/shared/lib/hooks/useFormFields'
import type { UseFormGetValues } from 'react-hook-form'

interface LogoFieldOptions {
  readonly setField: FieldSetter<AppearanceFormValues>
  readonly getValues: UseFormGetValues<AppearanceFormValues>
}

export function useLogoField({ setField, getValues }: LogoFieldOptions) {
  const handleLogoUpload = useCallback(
    async (file: File) => {
      const preview = getValues('logoPreview')
      const fileName = getValues('logoFileName')

      setField('logoPreview', URL.createObjectURL(file))
      setField('logoFileName', file.name)

      try {
        const data = await settingsService.uploadLogo(file)
        setField('logoUrl', data.url)
      } catch (error) {
        setField('logoPreview', preview)
        setField('logoFileName', fileName)
        throw error
      }
    },
    [setField, getValues],
  )

  const handleLogoRemove = useCallback(() => {
    setField('logoUrl', null)
    setField('logoPreview', null)
    setField('logoFileName', null)
  }, [setField])

  return { handleLogoUpload, handleLogoRemove }
}
