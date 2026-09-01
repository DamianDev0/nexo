import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/shared/lib'

const pillButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-bold whitespace-nowrap transition-colors duration-[120ms] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed',
        ink: 'bg-sidebar text-sidebar-foreground',
        secondary: 'bg-background text-foreground',
        tertiary: 'border border-foreground bg-card text-foreground',
        outline: 'border border-border bg-card text-body hover:bg-muted',
        ghost: 'text-body hover:bg-muted',
        ghostDanger: 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30',
        icon: 'rounded-full border border-border-strong bg-card text-body',
      },
      size: {
        lg: 'h-12 rounded-xl px-6 text-base',
        md: 'h-10.5 rounded-[21px] px-5 text-[15px]',
        sm: 'h-9 rounded-lg px-4 text-sm',
        xs: 'h-8 rounded-lg px-3.5 text-sm',
      },
    },
    compoundVariants: [
      { variant: 'icon', size: 'lg', className: 'w-12 px-0' },
      { variant: 'icon', size: 'md', className: 'w-10.5 px-0' },
      { variant: 'icon', size: 'sm', className: 'w-9 px-0' },
      { variant: 'icon', size: 'xs', className: 'w-8 px-0' },
      { variant: 'ghostDanger', size: 'xs', className: 'w-8 px-0' },
    ],
    defaultVariants: { variant: 'primary', size: 'lg' },
  },
)

interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillButtonVariants> {
  asChild?: boolean
}

export function PillButton({
  variant,
  size,
  className,
  type,
  asChild = false,
  ...props
}: Readonly<PillButtonProps>) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="pill-button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(pillButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
