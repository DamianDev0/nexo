'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState, useCallback } from 'react'
import Link from 'next/link'

import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Checkbox } from '@/components/atoms/checkbox'
import { Label } from '@/components/atoms/label'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/organisms/form'

import { useLogin } from '../hooks/useLogin'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  })

  const handleSubmit = useCallback(
    (values: LoginFormValues) => {
      login(values)
    },
    [login],
  )

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  return (
    <div className="flex w-full flex-col gap-8 rounded-2xl border border-border/30 bg-surface-glass px-12 py-10 shadow-lg backdrop-blur-xl">
      {/* Header — no toggle here, it's in the parent */}
      <div>
        <span className="text-sm font-medium text-muted-foreground">Welcome back</span>
        <h2 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Log in</h2>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground/60" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      className="h-10 rounded-lg border-border bg-surface-input pl-11 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-foreground/60" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-10 rounded-lg border-border bg-surface-input pl-11 pr-11 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={handleTogglePassword}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember me + Forgot */}
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

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full rounded-lg text-sm font-bold"
          >
            {isPending ? 'Logging in...' : 'Log in to Nexo'}
          </Button>
        </form>
      </Form>

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/onboarding" className="font-bold text-foreground underline underline-offset-2">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
