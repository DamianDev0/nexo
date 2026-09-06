'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { quickEase, useReducedTransition } from '@/shared/lib/animations'

import { PRESENCE_TONES } from '../../config/dock-tabs.constants'
import { useCallDock } from '../../model/useCallDock'
import { DockCollapsed } from '../DockCollapsed'
import { MicPermissionDialog } from '../MicPermissionDialog'

import { DockExpanded } from './DockExpanded'

export function CallDock() {
  const { t } = useTranslation()
  const dock = useCallDock()
  const { drag, micGate } = dock
  const transition = useReducedTransition(quickEase)

  if (dock.hidden && !dock.inCall) return null

  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait" initial={false}>
        {dock.expanded ? (
          <motion.div
            key="dock"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={transition}
            style={{ transformOrigin: 'bottom right' }}
          >
            <DockExpanded dock={dock} />
          </motion.div>
        ) : (
          <motion.div
            key="pill"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={transition}
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
