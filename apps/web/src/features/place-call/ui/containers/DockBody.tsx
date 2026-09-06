'use client'

import { formatDialNumber } from '../../lib/format-dial-number'
import { ActiveCallPanel } from '../ActiveCallPanel'
import { CallsView } from '../CallsView'
import { DialerPanel } from '../DialerPanel'
import { PhoneScreen } from '../PhoneScreen'

import { ContactsTab } from './ContactsTab'
import { MoreScreen } from './MoreScreen'

import type { DockScreen } from '../../model/types/call.types'
import type { DockController } from '../../model/useCallDock'
import type { ReactNode } from 'react'

export function DockBody({ dock }: Readonly<{ dock: DockController }>) {
  const { dialer, phoneTab } = dock

  if (dock.inCall) {
    return (
      <ActiveCallPanel
        call={{
          number: formatDialNumber(dialer.number),
          name: dialer.callerName,
          status: dialer.status,
          seconds: dialer.seconds,
          muted: dialer.muted,
          held: dialer.held,
          recording: dialer.recording,
        }}
        actions={{
          onToggleMute: dialer.toggleMute,
          onToggleHold: dialer.toggleHold,
          onToggleRecord: dialer.toggleRecord,
          onHangUp: () => void dialer.hangUp(),
        }}
        keypad={{
          open: dialer.keypadOpen,
          digits: dialer.dtmf,
          onToggle: dialer.toggleKeypad,
          onDigit: dialer.sendDtmf,
        }}
      />
    )
  }

  const screens: Partial<Record<DockScreen, ReactNode>> = {
    phone: (
      <PhoneScreen activeTab={phoneTab} onSelectTab={dock.setPhoneTab}>
        {phoneTab === 'dialpad' ? (
          <DialerPanel
            value={formatDialNumber(dialer.number)}
            canCall={dialer.number.length >= 3}
            actions={{
              onDigit: dialer.appendDigit,
              onDelete: dialer.deleteDigit,
              onCall: dock.dialFromPad,
              onInput: dialer.setNumber,
            }}
          />
        ) : (
          <CallsView entries={dialer.history} now={Date.now()} onCall={dock.callAndSwitch} />
        )}
      </PhoneScreen>
    ),
    contacts: <ContactsTab onCall={dock.callAndSwitch} />,
    more: <MoreScreen />,
  }

  return screens[dock.screen] ?? null
}
