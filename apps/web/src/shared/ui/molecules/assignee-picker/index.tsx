'use client'

import { cn } from '@/shared/lib'
import { useAsyncSelect } from '@/shared/lib/hooks/useAsyncSelect'
import { initialsOf } from '@/shared/lib/initials'
import { Avatar } from '@/shared/ui/atoms/avatar'
import { Text } from '@/shared/ui/atoms/text'
import { CaretDownIcon, CheckIcon, UserXIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import { SearchableCommand } from '@/shared/ui/molecules/searchable-command'
import { CommandItem } from '@/shared/ui/shadcn/command'

import type { AssigneeOption, AssigneePickerLabels } from './types'

export type { AssigneeOption, AssigneePickerLabels } from './types'

const UNASSIGN_VALUE = '__unassign__'
const ITEM =
  'gap-2.5 rounded-md py-2 data-[selected=true]:bg-muted data-[selected=true]:text-foreground'

function matches(option: AssigneeOption, query: string): boolean {
  const needle = query.toLowerCase()
  return (
    option.name.toLowerCase().includes(needle) ||
    (option.meta?.toLowerCase().includes(needle) ?? false)
  )
}

function OptionAvatar({ option, size }: Readonly<{ option: AssigneeOption; size: 'sm' | 'md' }>) {
  return (
    <Avatar size={size} variant="soft" className="rounded-full">
      {option.avatarUrl ? <Avatar.Image src={option.avatarUrl} alt="" /> : null}
      <Avatar.Fallback className="text-xs">{initialsOf(option.name)}</Avatar.Fallback>
    </Avatar>
  )
}

type AssigneePickerProps = {
  readonly value: string | null
  readonly onChange: (id: string | null) => void
  readonly options: ReadonlyArray<AssigneeOption>
  readonly labels: AssigneePickerLabels
  readonly disabled?: boolean
}

export function AssigneePicker({
  value,
  onChange,
  options,
  labels,
  disabled,
}: Readonly<AssigneePickerProps>) {
  const state = useAsyncSelect<AssigneeOption>(
    { options, getValue: (option) => option.id, filterFn: matches },
    (option) => onChange(option.id),
  )
  const current = options.find((option) => option.id === value) ?? null

  return (
    <GroovyPopover open={state.open} onOpenChange={state.onOpenChange}>
      <HintTooltip asChild hint={current?.name ?? labels.trigger}>
        <GroovyPopover.Trigger asChild>
          <button
            type="button"
            role="combobox"
            aria-label={current ? `${labels.trigger}: ${current.name}` : labels.trigger}
            aria-expanded={state.open}
            disabled={disabled}
            className={cn(
              'flex h-10 items-center gap-1 rounded-full border border-transparent bg-muted py-1 pr-2 pl-1 outline-none transition-colors duration-120 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50',
              state.open && 'border-ring ring-2 ring-ring/30',
            )}
          >
            {current ? (
              <OptionAvatar option={current} size="sm" />
            ) : (
              <span className="flex size-8 items-center justify-center text-muted-foreground">
                <UserXIcon className="size-4" />
              </span>
            )}
            <CaretDownIcon
              className={cn(
                'size-3.5 text-muted-foreground transition-transform duration-150',
                state.open && 'rotate-180',
              )}
            />
          </button>
        </GroovyPopover.Trigger>
      </HintTooltip>

      <GroovyPopover.Content align="end" autoFocusContent subtle className="w-72 p-0">
        <SearchableCommand
          search={{ value: state.term, onChange: state.setTerm, placeholder: labels.search }}
          highlight={{ value: state.highlightedValue, onChange: state.setHighlighted }}
          view={{
            empty: state.visible.length === 0 ? labels.empty : null,
            listClassName: 'max-h-72 scroll-py-1 p-1',
          }}
        >
          {current && state.term.length === 0 ? (
            <CommandItem
              value={UNASSIGN_VALUE}
              onSelect={() => {
                onChange(null)
                state.onOpenChange(false)
              }}
              className={cn(ITEM, 'text-muted-foreground')}
            >
              <UserXIcon className="size-4" />
              <span>{labels.unassign}</span>
            </CommandItem>
          ) : null}
          {state.visible.map((option) => (
            <CommandItem
              key={option.id}
              value={option.id}
              onSelect={() => state.select(option)}
              className={ITEM}
            >
              <OptionAvatar option={option} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <Text variant="strong" className="truncate">
                  {option.name}
                </Text>
                {option.meta ? (
                  <Text variant="hint" className="truncate">
                    {option.meta}
                  </Text>
                ) : null}
              </span>
              {option.badge ? (
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {option.badge}
                </span>
              ) : null}
              <CheckIcon
                strokeWidth={3}
                className={cn(
                  'size-3.5 shrink-0 text-primary-deep dark:text-primary',
                  option.id === value ? 'opacity-100' : 'opacity-0',
                )}
              />
            </CommandItem>
          ))}
        </SearchableCommand>
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
