import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib'

const avatarSquircleVariants = cva(
  'inline-flex shrink-0 items-center justify-center font-black uppercase',
  {
    variants: {
      size: {
        table: 'size-9 rounded-md text-xs',
        kanban: 'size-[26px] rounded-full text-[10px]',
      },
      tone: {
        lime: 'bg-primary-pale text-primary-deep',
        warning: 'bg-warning-surface text-warning-text',
        info: 'bg-info-surface text-info-text',
        neutral: 'bg-muted text-body',
      },
    },
    defaultVariants: { size: 'table', tone: 'lime' },
  },
)

interface AvatarSquircleProps extends VariantProps<typeof avatarSquircleVariants> {
  readonly initials: string
  readonly className?: string
}

export function AvatarSquircle({ initials, size, tone, className }: Readonly<AvatarSquircleProps>) {
  return (
    <span
      data-slot="avatar-squircle"
      className={cn(avatarSquircleVariants({ size, tone }), className)}
    >
      {initials.slice(0, 2)}
    </span>
  )
}
