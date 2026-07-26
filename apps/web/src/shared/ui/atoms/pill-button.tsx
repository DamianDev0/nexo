import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

const pillButtonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center font-bold transition-colors duration-[120ms] disabled:cursor-not-allowed disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed',
        ink: 'bg-sidebar text-sidebar-foreground',
        secondary: 'bg-background text-foreground',
        tertiary: 'border border-foreground bg-card text-foreground',
        ghost: 'text-body hover:bg-muted',
        icon: 'rounded-full border border-border-strong bg-card text-body',
      },
      size: {
        lg: 'h-12 rounded-[24px] px-6 text-base',
        md: 'h-[42px] rounded-[21px] px-5 text-[15px]',
        sm: 'h-9 rounded-[18px] px-4 text-sm',
      },
    },
    compoundVariants: [
      { variant: 'icon', size: 'lg', className: 'w-12 px-0' },
      { variant: 'icon', size: 'md', className: 'w-[42px] px-0' },
      { variant: 'icon', size: 'sm', className: 'w-9 px-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
)

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillButtonVariants> {}

export function PillButton({
  variant,
  size,
  className,
  type,
  ...props
}: Readonly<PillButtonProps>) {
  return (
    <button
      data-slot="pill-button"
      type={type ?? 'button'}
      className={cn(pillButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
