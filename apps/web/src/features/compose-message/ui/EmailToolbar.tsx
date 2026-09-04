'use client'

import { useTranslation } from 'react-i18next'

import { SHORTCUTS } from '@/shared/config/shortcuts'
import {
  CaretDownIcon,
  ImageSquareIcon,
  LinkSimpleIcon,
  PaletteIcon,
  PaperclipIcon,
  SmileyIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@/shared/ui/icons'
import { Toolbar } from '@/shared/ui/molecules/toolbar'

import { EMAIL_MORE_COMMANDS } from '../config/email-toolbar.constants'

import { ColorPopover, EmojiPopover, LinkPopover } from './ToolbarPopovers'

import type { EmailEditor } from '../model/useEmailEditor'

type EmailToolbarProps = {
  readonly email: EmailEditor
  readonly onPickFile: () => void
  readonly onPickMedia: () => void
}

export function EmailToolbar({ email, onPickFile, onPickMedia }: Readonly<EmailToolbarProps>) {
  const { t } = useTranslation()
  const { editor } = email
  const label = (key: string) => t(`composer.toolbar.${key}`)

  return (
    <Toolbar
      aria-label={label('formatting')}
      className="border-none bg-transparent p-0 shadow-none"
    >
      <Toolbar.Group>
        <Toolbar.Toggle
          size="icon-sm"
          pressed={editor.active.bold}
          onPressedChange={() => editor.exec('bold')}
          aria-label={label('bold')}
          hint={{ label: label('bold'), keys: SHORTCUTS.bold }}
        >
          <TextBIcon />
        </Toolbar.Toggle>
        <Toolbar.Toggle
          size="icon-sm"
          pressed={editor.active.italic}
          onPressedChange={() => editor.exec('italic')}
          aria-label={label('italic')}
          hint={{ label: label('italic'), keys: SHORTCUTS.italic }}
        >
          <TextItalicIcon />
        </Toolbar.Toggle>
        <Toolbar.Toggle
          size="icon-sm"
          pressed={editor.active.underline}
          onPressedChange={() => editor.exec('underline')}
          aria-label={label('underline')}
          hint={{ label: label('underline'), keys: SHORTCUTS.underline }}
        >
          <TextUnderlineIcon />
        </Toolbar.Toggle>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group>
        <LinkPopover
          icon={<LinkSimpleIcon />}
          onApply={email.applyLink}
          onOpenPointerDown={editor.saveSelection}
        />
        <ColorPopover
          icon={<PaletteIcon />}
          onPick={email.setColor}
          onOpenPointerDown={editor.saveSelection}
        />
        <EmojiPopover
          icon={<SmileyIcon />}
          onPick={email.insertEmoji}
          onOpenPointerDown={editor.saveSelection}
        />
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Group>
        <Toolbar.Button
          size="icon-sm"
          aria-label={label('attach')}
          hint={{ label: label('attach') }}
          onClick={onPickFile}
        >
          <PaperclipIcon />
        </Toolbar.Button>
        <Toolbar.Button
          size="icon-sm"
          aria-label={label('media')}
          hint={{ label: label('media') }}
          onClick={onPickMedia}
        >
          <ImageSquareIcon />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Separator />
      <Toolbar.Popover>
        <Toolbar.PopoverTrigger
          size="text"
          aria-label={label('more')}
          className="h-8 gap-1 text-xs"
        >
          {label('more')}
          <CaretDownIcon className="size-3.5" />
        </Toolbar.PopoverTrigger>
        <Toolbar.PopoverContent side="top" align="end" className="w-auto p-1">
          <Toolbar
            aria-label={label('more')}
            className="border-none bg-transparent p-0 shadow-none"
          >
            {EMAIL_MORE_COMMANDS.map(({ id, command, icon: Icon }) => (
              <Toolbar.Button
                key={id}
                size="icon-sm"
                aria-label={label(id)}
                hint={{ label: label(id), side: 'top' }}
                onPointerDown={editor.saveSelection}
                onClick={() => {
                  editor.restoreSelection()
                  editor.exec(command)
                }}
              >
                <Icon />
              </Toolbar.Button>
            ))}
          </Toolbar>
        </Toolbar.PopoverContent>
      </Toolbar.Popover>
    </Toolbar>
  )
}
