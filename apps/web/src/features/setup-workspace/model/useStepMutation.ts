import { useMutation } from '@tanstack/react-query'
import { t } from 'i18next'
import { useCallback, useRef } from 'react'
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
  const inFlight = useRef(false)

  const { mutate, isPending } = useMutation({
    mutationFn,
    onSuccess: (result) => {
      onSuccess?.(result)
      onNext()
    },
    onError: (err) =>
      sileo.error({ title: errorTitle ?? t('common.saveFailed'), description: err.message }),
    onSettled: () => {
      inFlight.current = false
    },
  })

  const handleSave = useCallback(() => {
    if (inFlight.current) return
    inFlight.current = true
    mutate()
  }, [mutate])

  return { handleSave, isPending }
}
