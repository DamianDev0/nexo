import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboarding } from './useOnboarding'
import { onboardingSchema, type OnboardingFormValues } from '../schemas/onboarding.schema'

export function useOnboardingForm() {
  const { mutate: onboard, isPending } = useOnboarding()

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: '',
      slug: '',
      planName: 'free',
      ownerFullName: '',
      ownerEmail: '',
      ownerPassword: '',
    },
    mode: 'onBlur',
  })

  const onSubmit = useCallback(
    (values: OnboardingFormValues) => {
      onboard(values)
    },
    [onboard],
  )

  const handleBusinessNameChange = useCallback(
    (value: string, onChange: (value: string) => void) => {
      onChange(value)
      const slug = value
        .toLowerCase()
        .replaceAll(/\s+/g, '-')
        .replaceAll(/[^a-z0-9-]/g, '')
      form.setValue('slug', slug)
    },
    [form],
  )

  return {
    control: form.control,
    handleSubmit: form.handleSubmit(onSubmit),
    handleBusinessNameChange,
    isPending,
  }
}
