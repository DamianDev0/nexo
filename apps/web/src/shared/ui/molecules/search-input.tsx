'use client'

import { cn } from '@/shared/lib'
import { MagnifyingGlassIcon, XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { SmoothInput } from '@/shared/ui/smoothui/input'

type SearchInputClasses = {
  readonly container?: string
  readonly input?: string
  readonly icon?: string
}

type SearchInputClear = {
  readonly onClick: () => void
  readonly label: string
}

type SearchInputProps = {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly placeholder: string
  readonly clear?: SearchInputClear
  readonly classes?: SearchInputClasses
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  clear,
  classes,
}: Readonly<SearchInputProps>) {
  return (
    <div className={cn('group relative', classes?.container)}>
      <MagnifyingGlassIcon
        className={cn(
          'pointer-events-none absolute top-1/2 left-2.5 z-10 size-4 -translate-y-1/2 text-muted-foreground',
          classes?.icon,
        )}
      />
      <SmoothInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && clear) clear.onClick()
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn('pl-8.5', classes?.input)}
      />
      {clear && value.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clear.onClick}
          aria-label={clear.label}
          className="absolute top-1/2 right-1 z-10 size-6 -translate-y-1/2 text-muted-foreground"
        >
          <XIcon className="size-3" />
        </Button>
      )}
    </div>
  )
}
