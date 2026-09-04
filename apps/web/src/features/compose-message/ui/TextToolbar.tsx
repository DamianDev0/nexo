'use client'

import { useTranslation } from 'react-i18next'

import { ImageSquareIcon, PaperclipIcon, SmileyIcon } from '@/shared/ui/icons'
import { Toolbar } from '@/shared/ui/molecules/toolbar'

import { TEXT_MARKUP_BUTTONS } from '../config/text-toolbar.constants'

import { EmojiPopover } from './ToolbarPopovers'

import type { BodyMarkup } from '../model/useBodyMarkup'

type TextToolbarProps = {
  readonly markup: BodyMarkup
  readonly onPickFile: () => void
  readonly onPickMedia: () => void
}

export function TextToolbar({ markup, onPickFile, onPickMedia }: Readonly<TextToolbarProps>) {
  const { t } = useTranslation()
  const buttons = TEXT_MARKUP_BUTTONS.filter((button) => markup.actions[button.id])

  return (
    <Toolbar
      aria-label={t('composer.toolbar.formatting')}
      className="border-none bg-transparent p-0 shadow-none"
    >
      {buttons.length > 0 ? (
        <>
          <Toolbar.Group>
            {buttons.map(({ id, icon: Icon, keys }) => (
              <Toolbar.Button
                key={id}
                size="icon-sm"
                aria-label={t(`composer.toolbar.${id}`)}
                hint={{ label: t(`composer.toolbar.${id}`), keys }}
                onClick={markup.actions[id]}
              >
                <Icon />
              </Toolbar.Button>
            ))}
          </Toolbar.Group>
          <Toolbar.Separator />
        </>
      ) : null}
      <Toolbar.Group>
        <EmojiPopover icon={<SmileyIcon />} onPick={markup.insertEmoji} />
        <Toolbar.Button
          size="icon-sm"
          aria-label={t('composer.toolbar.attach')}
          hint={{ label: t('composer.toolbar.attach') }}
          onClick={onPickFile}
        >
          <PaperclipIcon />
        </Toolbar.Button>
        <Toolbar.Button
          size="icon-sm"
          aria-label={t('composer.toolbar.media')}
          hint={{ label: t('composer.toolbar.media') }}
          onClick={onPickMedia}
        >
          <ImageSquareIcon />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  )
}
