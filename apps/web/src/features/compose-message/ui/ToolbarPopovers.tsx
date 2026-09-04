'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TEXT_COLORS } from '@/shared/config/tokens/text-palette'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { EmojiPicker } from '@/shared/ui/molecules/emoji-picker'
import { Toolbar } from '@/shared/ui/molecules/toolbar'
import { Input } from '@/shared/ui/shadcn/input'

import type { ReactNode } from 'react'

type PickerPopoverProps = {
  readonly icon: ReactNode
  readonly label: string
  readonly onOpenPointerDown?: () => void
  readonly contentClassName?: string
  readonly children: (close: () => void) => ReactNode
}

function PickerPopover({
  icon,
  label,
  onOpenPointerDown,
  contentClassName,
  children,
}: Readonly<PickerPopoverProps>) {
  const [open, setOpen] = useState(false)
  return (
    <Toolbar.Popover open={open} onOpenChange={setOpen}>
      <Toolbar.PopoverTrigger
        size="icon-sm"
        aria-label={label}
        hint={{ label }}
        onPointerDown={onOpenPointerDown}
      >
        {icon}
      </Toolbar.PopoverTrigger>
      <Toolbar.PopoverContent className={contentClassName ?? 'w-auto p-2'} align="start">
        {children(() => setOpen(false))}
      </Toolbar.PopoverContent>
    </Toolbar.Popover>
  )
}

type EmojiPopoverProps = {
  readonly icon: ReactNode
  readonly onPick: (emoji: string) => void
  readonly onOpenPointerDown?: () => void
}

export function EmojiPopover({ icon, onPick, onOpenPointerDown }: Readonly<EmojiPopoverProps>) {
  const { t, i18n } = useTranslation()
  return (
    <PickerPopover
      icon={icon}
      label={t('composer.toolbar.emoji')}
      onOpenPointerDown={onOpenPointerDown}
      contentClassName="w-auto overflow-hidden rounded-xl border-none bg-transparent p-0 shadow-xl"
    >
      {(close) => (
        <EmojiPicker
          locale={i18n.language.slice(0, 2)}
          onPick={(emoji) => {
            onPick(emoji)
            close()
          }}
        />
      )}
    </PickerPopover>
  )
}

type ColorPopoverProps = {
  readonly icon: ReactNode
  readonly onPick: (color: string) => void
  readonly onOpenPointerDown?: () => void
}

export function ColorPopover({ icon, onPick, onOpenPointerDown }: Readonly<ColorPopoverProps>) {
  const { t } = useTranslation()
  return (
    <PickerPopover
      icon={icon}
      label={t('composer.toolbar.textColor')}
      onOpenPointerDown={onOpenPointerDown}
    >
      {(close) => (
        <div className="grid grid-cols-5 gap-1.5">
          {TEXT_COLORS.map((color) => (
            <PillButton
              key={color}
              variant="ghost"
              size="xs"
              aria-label={color}
              style={{ backgroundColor: color }}
              className="size-6 rounded-full px-0 hover:scale-110 hover:opacity-90"
              onClick={() => {
                onPick(color)
                close()
              }}
            />
          ))}
        </div>
      )}
    </PickerPopover>
  )
}

type LinkPopoverProps = {
  readonly icon: ReactNode
  readonly onApply: (url: string) => void
  readonly onOpenPointerDown?: () => void
}

export function LinkPopover({ icon, onApply, onOpenPointerDown }: Readonly<LinkPopoverProps>) {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  return (
    <PickerPopover
      icon={icon}
      label={t('composer.toolbar.insertLink')}
      onOpenPointerDown={onOpenPointerDown}
    >
      {(close) => (
        <div className="flex items-center gap-1.5">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={t('composer.toolbar.linkPlaceholder')}
            className="h-8 w-52"
            autoFocus
          />
          <PillButton
            size="xs"
            disabled={url.trim() === ''}
            onClick={() => {
              onApply(url.trim())
              setUrl('')
              close()
            }}
          >
            {t('composer.toolbar.apply')}
          </PillButton>
        </div>
      )}
    </PickerPopover>
  )
}
