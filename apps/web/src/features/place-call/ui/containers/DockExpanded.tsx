'use client'

import { useTranslation } from 'react-i18next'

import { PRESENCE_TONES } from '../../config/dock-tabs.constants'
import { DockHeader } from '../DockHeader'
import { DockTabBar } from '../DockTabBar'

import { DockBody } from './DockBody'

import type { DockController } from '../../model/useCallDock'

export function DockExpanded({ dock }: Readonly<{ dock: DockController }>) {
  const { t } = useTranslation()
  const { drag, presence, inCall } = dock

  return (
    <div
      ref={drag.elementRef}
      style={drag.style}
      className="flex max-h-[calc(100dvh-6rem)] w-75 flex-col overflow-hidden rounded-3xl bg-card shadow-e2"
    >
      <DockHeader
        presence={{
          label: t(`dialer.presenceOptions.${presence}`),
          tone: PRESENCE_TONES[presence],
          onClick: () => dock.setScreen('more'),
        }}
        actions={{
          minimizeLabel: t('dialer.minimize'),
          onMinimize: () => dock.dialer.setOpen(false),
          expandLabel: t('dialer.expand'),
          expandHint: t('dialer.comingSoon'),
          closeLabel: t('dialer.close'),
          onClose: inCall ? undefined : dock.hide,
        }}
        dragProps={drag.handleProps}
      />
      <div className="flex h-110 flex-col overflow-hidden">
        <DockBody dock={dock} />
      </div>
      <DockTabBar active={inCall ? 'phone' : dock.screen} onSelect={dock.setScreen} />
    </div>
  )
}
