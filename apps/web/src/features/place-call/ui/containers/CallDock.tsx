'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { smoothSpring, useReducedTransition } from '@/shared/lib/animations'

import { PRESENCE_TONES } from '../../config/dock-tabs.constants'
import { useCallDock } from '../../model/useCallDock'
import { DockCollapsed } from '../DockCollapsed'
import { MicPermissionDialog } from '../MicPermissionDialog'

import { DockExpanded } from './DockExpanded'

const WINDOW_MOTION = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
} as const

export function CallDock() {
  const { t } = useTranslation()
  const dock = useCallDock()
  const { drag, micGate } = dock
  const transition = useReducedTransition(smoothSpring)
  const visible = !dock.hidden || dock.inCall

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait" initial={false}>
        {visible && dock.expanded && (
          <motion.div
            key="dock"
            {...WINDOW_MOTION}
            transition={transition}
            style={{ transformOrigin: 'bottom right' }}
          >
            <DockExpanded dock={dock} />
          </motion.div>
        )}
        {visible && !dock.expanded && (
          <motion.div
            key="pill"
            {...WINDOW_MOTION}
            transition={transition}
            style={{ transformOrigin: 'bottom right' }}
          >
            <div ref={drag.elementRef} style={drag.style}>
              <DockCollapsed
                tone={PRESENCE_TONES[dock.presence]}
                label={t('dialer.open')}
                onOpen={() => {
                  if (!drag.consumeMoved()) dock.dialer.setOpen(true)
                }}
                dragProps={drag.handleProps}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <MicPermissionDialog
        open={micGate.modalOpen}
        denied={micGate.denied}
        onAllow={() => void micGate.allow()}
        onClose={micGate.dismiss}
      />
    </div>
  )
}
