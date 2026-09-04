'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { gooeySpring, useReducedTransition } from '@/shared/lib/animations'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { PhoneIcon } from '@/shared/ui/icons'

import { formatDialNumber } from '../../lib/format-dial-number'
import { useDialer } from '../../model/useDialer'
import { ActiveCallPanel } from '../ActiveCallPanel'
import { CallsView } from '../CallsView'
import { DialerPanel } from '../DialerPanel'
import { DockHeader } from '../DockHeader'
import { DockTabBar } from '../DockTabBar'

import { ContactsTab } from './ContactsTab'

import type { DockTab } from '../../model/types/call.types'

export function CallDock() {
  const { t } = useTranslation()
  const dialer = useDialer()
  const transition = useReducedTransition(gooeySpring)
  const [tab, setTab] = useState<DockTab>('dialpad')
  const inCall = dialer.status !== 'idle'
  const expanded = dialer.open || inCall
  const callAndSwitch = (number: string) => {
    setTab('dialpad')
    void dialer.callNumber(number)
  }

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded ? (
          <motion.div
            key="dock"
            initial={{ opacity: 0, scale: 0.9, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 24, filter: 'blur(6px)' }}
            transition={transition}
            style={{ transformOrigin: 'bottom right' }}
            className="flex max-h-[calc(100dvh-6rem)] w-80 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-e3"
          >
            <DockHeader
              title={t('dialer.title')}
              minimizeLabel={t('dialer.minimize')}
              onMinimize={() => dialer.setOpen(false)}
            />
            <div className="flex h-100 flex-col overflow-hidden">
              {inCall ? (
                <ActiveCallPanel
                  call={{
                    number: formatDialNumber(dialer.number),
                    status: dialer.status,
                    seconds: dialer.seconds,
                    muted: dialer.muted,
                    held: dialer.held,
                  }}
                  actions={{
                    onToggleMute: dialer.toggleMute,
                    onToggleHold: dialer.toggleHold,
                    onHangUp: () => void dialer.hangUp(),
                  }}
                  keypad={{
                    open: dialer.keypadOpen,
                    digits: dialer.dtmf,
                    onToggle: dialer.toggleKeypad,
                    onDigit: dialer.sendDtmf,
                  }}
                />
              ) : (
                <>
                  {tab === 'dialpad' ? (
                    <div className="flex flex-1 flex-col justify-center px-4 pb-2">
                      <DialerPanel
                        value={formatDialNumber(dialer.number)}
                        canCall={dialer.number !== ''}
                        actions={{
                          onDigit: dialer.appendDigit,
                          onDelete: dialer.deleteDigit,
                          onCall: () => void dialer.placeCall(),
                        }}
                      />
                    </div>
                  ) : null}
                  {tab === 'calls' ? (
                    <CallsView entries={dialer.history} now={Date.now()} onCall={callAndSwitch} />
                  ) : null}
                  {tab === 'contacts' ? <ContactsTab onCall={callAndSwitch} /> : null}
                </>
              )}
            </div>
            <DockTabBar active={inCall ? 'dialpad' : tab} onSelect={setTab} />
          </motion.div>
        ) : (
          <motion.div
            key="fab"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={transition}
          >
            <PillButton
              variant="primary"
              size="sm"
              aria-label={t('dialer.open')}
              onClick={() => dialer.setOpen(true)}
              className="size-12 rounded-full px-0 shadow-e2"
            >
              <PhoneIcon className="size-5" />
            </PillButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
