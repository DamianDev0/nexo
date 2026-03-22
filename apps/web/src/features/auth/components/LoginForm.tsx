import { Controller, type Control } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Checkbox } from '@/components/atoms/checkbox'
import { Label } from '@/components/atoms/label'

import type { LoginFormValues } from '../schemas/login.schema'
import { FieldError } from './FieldError'
import { AuthFooter } from './AuthFooter'

interface LoginFormProps {
  readonly control: Control<LoginFormValues>
  readonly onSubmit: () => void
  readonly isPending: boolean
  readonly showPassword: boolean
  readonly onTogglePassword: () => void
}

export function LoginForm({
  control,
  onSubmit,
  isPending,
  showPassword,
  onTogglePassword,
}: LoginFormProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div>
        <span className="text-sm font-medium text-muted-foreground">Welcome back</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Log in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/onboarding"
            className="font-medium text-foreground underline underline-offset-2"
          >
            Sign up free
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
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
          name="password"
          render={({ field, fieldState }) => (
            <div>
              <Label className="text-xs text-muted-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember"
              className="border-foreground/40 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground"
            />
            <Label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-lg text-sm font-bold"
        >
          {isPending ? 'Logging in...' : 'Log in to Nexo'}
        </Button>
      </form>

      <AuthFooter />
    </div>
  )
}
