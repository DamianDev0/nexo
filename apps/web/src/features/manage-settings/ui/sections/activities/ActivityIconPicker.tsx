'use client'

import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/shadcn/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover'

import {
  ACTIVITY_ICON_MAP,
  ACTIVITY_ICON_NAMES,
  FALLBACK_ACTIVITY_ICON,
} from '../../../config/activity-types.constants'

interface ActivityIconPickerProps {
  readonly icon: string
  readonly onChange: (icon: string) => void
  readonly label: string
}

export function ActivityIconPicker({ icon, onChange, label }: Readonly<ActivityIconPickerProps>) {
  const [open, setOpen] = useState(false)
  const CurrentIcon = ACTIVITY_ICON_MAP[icon] ?? FALLBACK_ACTIVITY_ICON

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          className="size-7 shrink-0 rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <CurrentIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-xl p-3">
        <div className="grid grid-cols-6 gap-1.5">
          {ACTIVITY_ICON_NAMES.map((name) => {
            const OptionIcon = ACTIVITY_ICON_MAP[name] ?? FALLBACK_ACTIVITY_ICON
            return (
              <Button
                key={name}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={name}
                aria-pressed={name === icon}
                className={cn('size-8', name === icon && 'bg-muted text-primary')}
                onClick={() => {
                  onChange(name)
                  setOpen(false)
                }}
              >
                <OptionIcon className="size-4" />
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
