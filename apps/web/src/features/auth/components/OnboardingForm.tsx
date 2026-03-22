import { Controller, type Control } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Label } from '@/components/atoms/label'

import type { OnboardingFormValues } from '../schemas/onboarding.schema'
import { FieldError } from './FieldError'
import { AuthFooter } from './AuthFooter'

interface OnboardingFormProps {
  readonly control: Control<OnboardingFormValues>
  readonly onSubmit: () => void
  readonly isPending: boolean
  readonly showPassword: boolean
  readonly onTogglePassword: () => void
  readonly onBusinessNameChange: (value: string, onChange: (value: string) => void) => void
}

export function OnboardingForm({
  control,
  onSubmit,
  isPending,
  showPassword,
  onTogglePassword,
  onBusinessNameChange,
}: OnboardingFormProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          control={control}
          name="businessName"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Business name</Label>
              <Input
                placeholder="Nexo Acme"
                className="mt-1.5 h-10 border-border bg-surface-input text-sm"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => onBusinessNameChange(e.target.value, field.onChange)}
              />
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="slug"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Workspace URL</Label>
              <Input
                placeholder="nexo-acme"
                className="mt-1.5 h-10 border-border bg-surface-input text-sm"
                {...field}
                value={field.value ?? ''}
              />
              <span className="mt-1 block text-xs text-muted-foreground/50">
                nexo.app/{field.value || 'your-slug'}
              </span>
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="ownerFullName"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Full name</Label>
              <Input
                placeholder="Damian Garcia"
                className="mt-1.5 h-10 border-border bg-surface-input text-sm"
                {...field}
                value={field.value ?? ''}
              />
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="ownerEmail"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Work email</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="mt-1.5 h-10 border-border bg-surface-input text-sm"
                {...field}
                value={field.value ?? ''}
              />
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />

        <Controller
          control={control}
          name="ownerPassword"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="h-10 border-border bg-surface-input pr-10 text-sm"
                  {...field}
                  value={field.value ?? ''}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={onTogglePassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FieldError message={fieldState.error?.message} />
            </div>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-lg text-sm font-bold"
        >
          {isPending ? 'Creating workspace...' : 'Create workspace & continue →'}
        </Button>
      </form>

      <AuthFooter />
    </div>
  )
}
