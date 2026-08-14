import { useMutation } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback } from 'react'
import { sileo } from 'sileo'

interface StepMutationOptions<T> {
  mutationFn: () => Promise<T>
  onNext: () => void
  errorTitle?: string
  onSuccess?: (result: T) => void
}

export function useStepMutation<T>({
  mutationFn,
  onNext,
  errorTitle,
  onSuccess,
}: StepMutationOptions<T>) {
  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: (result) => {
      onSuccess?.(result)
      onNext()
    },
    onError: (err) =>
      sileo.error({ title: errorTitle ?? t('common.saveFailed'), description: err.message }),
  })

  const handleSave = useCallback(() => {
    if (isPending) return
    mutate()
  }, [isPending, mutate])

  return { handleSave, isPending }
}
