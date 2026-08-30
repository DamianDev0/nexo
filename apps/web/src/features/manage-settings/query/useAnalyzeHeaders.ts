'use client'

import { useMutation } from '@tanstack/react-query'

import settingsService from '@/shared/api/services/settings.service'

import type { CustomFieldEntity } from '@repo/shared-types'

export function useAnalyzeHeaders(entity: CustomFieldEntity) {
  return useMutation({
    mutationFn: (file: File) => settingsService.analyzeCustomFieldHeaders(entity, file),
  })
}
