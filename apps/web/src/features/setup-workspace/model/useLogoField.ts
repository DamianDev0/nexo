'use client'

import { useCallback } from 'react'

import settingsService from '@/shared/api/services/settings.service'

import type { AppearanceFormValues } from './types'
import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form'

interface LogoFieldOptions {
  readonly setValue: UseFormSetValue<AppearanceFormValues>
  readonly getValues: UseFormGetValues<AppearanceFormValues>
}

export function useLogoField({ setValue, getValues }: LogoFieldOptions) {
  const handleLogoUpload = useCallback(
    async (file: File) => {
      const preview = getValues('logoPreview')
      const fileName = getValues('logoFileName')

      setValue('logoPreview', URL.createObjectURL(file), { shouldDirty: true })
      setValue('logoFileName', file.name, { shouldDirty: true })

      try {
        const data = await settingsService.uploadLogo(file)
        setValue('logoUrl', data.url, { shouldDirty: true })
      } catch (error) {
        setValue('logoPreview', preview, { shouldDirty: true })
        setValue('logoFileName', fileName, { shouldDirty: true })
        throw error
      }
    },
    [setValue, getValues],
  )

  const handleLogoRemove = useCallback(() => {
    setValue('logoUrl', null, { shouldDirty: true })
    setValue('logoPreview', null, { shouldDirty: true })
    setValue('logoFileName', null, { shouldDirty: true })
  }, [setValue])

  return { handleLogoUpload, handleLogoRemove }
}
