'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { expandCollapse, quickEase, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { XIcon } from '@/shared/ui/icons'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { Composer } from '@/shared/ui/organisms/composer'

import type { useMessageComposer } from '../model/useMessageComposer'
import type { ReactNode } from 'react'

type MessageComposerState = ReturnType<typeof useMessageComposer>

type CollapsibleFieldProps = {
  readonly visible: boolean
  readonly children: ReactNode
}

function CollapsibleField({ visible, children }: Readonly<CollapsibleFieldProps>) {
  const transition = useReducedTransition(quickEase)
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          variants={expandCollapse}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="shrink-0 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

type RecipientFieldsProps = {
  readonly composer: MessageComposerState
  readonly isEmail: boolean
}

export function RecipientFields({ composer, isEmail }: Readonly<RecipientFieldsProps>) {
  const { t } = useTranslation()
  const { form, extras } = composer
  const { errors } = form.formState
  const label = (key: string) => t(`contacts.composers.message.${key}`)

  return (
    <>
      <Composer.Field
        label={label('to')}
        error={errors.to?.message}
        end={
          isEmail ? (
            <>
              {!extras.ccVisible && (
                <PillButton
                  variant="ghost"
                  size="xs"
                  className="h-6 px-2 text-xs"
                  onClick={extras.showCc}
                >
                  {label('cc')}
                </PillButton>
              )}
              {!extras.bccVisible && (
                <PillButton
                  variant="ghost"
                  size="xs"
                  className="h-6 px-2 text-xs"
                  onClick={extras.showBcc}
                >
                  {label('bcc')}
                </PillButton>
              )}
            </>
          ) : undefined
        }
      >
        <Composer.Input {...form.register('to')} />
      </Composer.Field>
      <CollapsibleField visible={extras.ccVisible}>
        <Composer.Field
          label={label('cc')}
          error={errors.cc?.message}
          end={
            <HeaderIconButton aria-label={label('removeCc')} onClick={extras.hideCc}>
              <XIcon />
            </HeaderIconButton>
          }
        >
          <Composer.Input autoFocus {...form.register('cc')} />
        </Composer.Field>
      </CollapsibleField>
      <CollapsibleField visible={extras.bccVisible}>
        <Composer.Field
          label={label('bcc')}
          error={errors.bcc?.message}
          end={
            <HeaderIconButton aria-label={label('removeBcc')} onClick={extras.hideBcc}>
              <XIcon />
            </HeaderIconButton>
          }
        >
          <Composer.Input autoFocus {...form.register('bcc')} />
        </Composer.Field>
      </CollapsibleField>
    </>
  )
}
