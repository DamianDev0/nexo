'use client'

import { motion } from 'motion/react'
import { useMemo } from 'react'

import { cn } from '@/shared/lib'
import { smoothSpring, useReducedTransition } from '@/shared/lib/animations'

import { ComposerAttachment, ComposerAttachments } from './attachments'
import { ComposerContext } from './context'
import { ComposerControls, ComposerHeader, ComposerTitle, ComposerStandardHeader } from './header'
import { ComposerInput, ComposerTextarea } from './inputs'
import { useComposerWindow } from './model/use-composer-window'
import {
  ComposerBody,
  ComposerField,
  ComposerFooter,
  ComposerFooterEnd,
  ComposerActions,
} from './sections'

import type { ReactNode } from 'react'

type ComposerRootProps = {
  readonly label: string
  readonly children: ReactNode
  readonly onClose?: () => void
  readonly className?: string
}

function ComposerRoot({ label, children, onClose, className }: Readonly<ComposerRootProps>) {
  const composerWindow = useComposerWindow()
  const value = useMemo(() => ({ ...composerWindow, onClose }), [composerWindow, onClose])
  const layoutTransition = useReducedTransition(smoothSpring)
  return (
    <ComposerContext.Provider value={value}>
      <div
        ref={composerWindow.constraintsRef}
        aria-hidden
        className="pointer-events-none fixed inset-3 z-50"
      />
      <motion.div
        role="dialog"
        aria-label={label}
        data-slot="composer"
        data-minimized={composerWindow.minimized ? '' : undefined}
        data-maximized={composerWindow.maximized ? '' : undefined}
        layout
        layoutDependency={`${composerWindow.minimized}:${composerWindow.maximized}`}
        drag={!composerWindow.maximized}
        dragControls={composerWindow.dragControls}
        dragConstraints={composerWindow.constraintsRef}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        style={{ x: composerWindow.x, y: composerWindow.y }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ layout: layoutTransition }}
        className={cn(
          'fixed right-6 bottom-6 z-50 flex max-h-[calc(100dvh-3rem)] w-130 max-w-[calc(100dvw-3rem)] flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xl',
          'group/composer',
          'data-minimized:w-80',
          'data-maximized:inset-0 data-maximized:m-auto data-maximized:h-[min(80dvh,46rem)] data-maximized:w-[min(56rem,calc(100dvw-3rem))] data-maximized:max-w-none',
          className,
        )}
      >
        {children}
      </motion.div>
    </ComposerContext.Provider>
  )
}

export const Composer = Object.assign(ComposerRoot, {
  StandardHeader: ComposerStandardHeader,
  Actions: ComposerActions,
  Header: ComposerHeader,
  Title: ComposerTitle,
  Controls: ComposerControls,
  Field: ComposerField,
  Body: ComposerBody,
  Attachments: ComposerAttachments,
  Attachment: ComposerAttachment,
  Input: ComposerInput,
  Textarea: ComposerTextarea,
  Footer: ComposerFooter,
  FooterEnd: ComposerFooterEnd,
})

export { useComposer } from './context'
export { buildComposerControlLabels } from './lib/labels'
export type { ComposerControlLabels } from './lib/labels'
